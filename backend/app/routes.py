# API Endpoints
from flask import Blueprint, Response, render_template, jsonify, request
from flask_cors import CORS, cross_origin
from flask import Flask, Response, render_template
import threading
import time
import os
import logging

from .video import generate_frames, stream_video, car_count
from .data_store import read_data, write_data, init_data_file

routes = Blueprint('routes', __name__)

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@routes.route('/')
def index():
    return render_template('index.html')

@routes.route('/video_feed')
def video_feed():
    return Response(generate_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

@routes.route('/toggle_detection')
def toggle_detection():
    global detect_faces
    detect_faces = not detect_faces
    return jsonify({"status": "success", "detecting": detect_faces})

@routes.route('/trafficLevel', methods=['GET', 'POST'])
def trafficLevel():
    try:
        data = read_data()
        if request.method == 'GET':
            @cross_origin(origins='*')
            def getLevel():
                return jsonify({'status': 'success', 'trafficLevel': data['level']})
            return getLevel()
        elif request.method == 'POST':
            @cross_origin(origins=[adminSource])
            def postLevel():
                req_data = request.get_json()
                new_level = req_data["trafficLevel"]
                if not isinstance(new_level, int) or new_level < 1 or new_level > 9:
                    return jsonify({'status': 'error', 'message': 'Traffic level must be an integer between 1 and 9'}), 422
                data['level'] = new_level
                data['historyData'].append({'time': time.strftime("%I:%M"), 'value': new_level})
                if len(data['historyData']) > 12:
                    data['historyData'].pop(0)
                write_data(data)
                return jsonify({'status': 'success', 'trafficLevel': new_level})
            return postLevel()
    except Exception as e:
        logger.error(f"Error in trafficLevel: {str(e)}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@routes.route('/thresholds', methods=['GET', 'POST'])
def thresholds():
    try:
        data = read_data()
        if request.method == 'GET':
            @cross_origin(origins='*')
            def getThreshold():
                return jsonify({'status': 'success', 'thresholds': data['thresholdsLevels']})
            return getThreshold()
        elif request.method == 'POST':
            @cross_origin(origins=[adminSource])
            def postThreshold():
                req_data = request.get_json()
                new_thresholds = req_data["thresholds"]
                if not isinstance(new_thresholds, list) or len(new_thresholds) != 2 or \
                not all(isinstance(x, (int, float)) and x >= 0 for x in new_thresholds):
                    return jsonify({'status': 'error', 'message': 'Thresholds must be a list of two non-negative numbers'}), 422
                data['thresholdsLevels'] = new_thresholds
                write_data(data)
                return jsonify({'status': 'success', 'thresholds': new_thresholds})
            return postThreshold()
    except Exception as e:
        logger.error(f"Error in thresholds: {str(e)}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@routes.route('/lotManager', methods=['GET', 'POST'])
def lotManager():
    try:
        data = read_data()
        if request.method == 'GET':
            @cross_origin(origins='*')
            def getLotManager():
                return jsonify({'status': 'success', 'lotData': data['lotData']})
            return getLotManager()
        elif request.method == 'POST':
            @cross_origin(origins=[adminSource])
            def postLotManager():
                req_data = request.get_json()
                new_lot_data = req_data["lotData"]
                if not isinstance(new_lot_data, list) or not all(
                    isinstance(lot, dict) and 'name' in lot and 'spaces' in lot and 'isOpen' in lot and
                    isinstance(lot['name'], str) and isinstance(lot['spaces'], int) and isinstance(lot['isOpen'], bool)
                    for lot in new_lot_data
                ):
                    return jsonify({'status': 'error', 'message': 'Invalid lot data format'}), 422
                data['lotData'] = new_lot_data
                write_data(data)
                return jsonify({'status': 'success', 'lotData': new_lot_data})
            return postLotManager()
    except Exception as e:
        logger.error(f"Error in lotManager: {str(e)}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@routes.route('/history', methods=['GET'])
def history():
    try:
        @cross_origin(origins='*')
        def getHistory():
            data = read_data()
            return jsonify({'status': 'success', 'historyData': data['historyData']})
        return getHistory()
    except Exception as e:
        logger.error(f"Error in history: {str(e)}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

# Handle server shutdown
def handle_shutdown(signum, frame):
    global stream_active
    logger.info("Shutting down server")
    stream_active = False
    stream_thread.join()
    exit(0)


@routes.route('/car_count')
def car_count_api():
    global car_count
    return {"count": car_count}

if __name__ == '__main__':
    import signal
    signal.signal(signal.SIGINT, handle_shutdown)
    os.makedirs('templates', exist_ok=True)
    try:
        init_data_file()
    except Exception as e:
        logger.error(f"Failed to initialize data.json: {str(e)}")
        exit(1)
    stream_thread = threading.Thread(target=stream_video)
    stream_thread.daemon = True
    stream_thread.start()
    logger.info("Starting Flask server on http://10.0.0.25:5000")
    app.run(host='0.0.0.0', port=5000, debug=False, threaded=True, use_reloader=False)

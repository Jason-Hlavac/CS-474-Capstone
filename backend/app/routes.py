from flask import Blueprint, Response, jsonify, render_template, request
from app.video import generate_frames, start_stream, stop_stream, car_count, set_config
import requests, json
from flask_cors import CORS, cross_origin
import os
import logging
import threading
import time
from threading import Lock



# Create a Blueprint for video streaming-related routes
video_bp = Blueprint('video', __name__)
CORS(video_bp)
adminSource = 'http://127.0.0.1:5500'
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

lock = threading.Lock()
DATA_FILE = 'data.json'
data_lock = Lock()

def init_data_file():
    default_data = {
        'level': 6,
        'thresholdsLevels': [5, 10],
        'lotData': [
            {'name': "Main Commuter Lot", 'spaces': 150, 'isOpen': True},
            {'name': "Garaventa Lot", 'spaces': 40, 'isOpen': False}
        ],
        'historyData': [
            {'time': '6:00', 'value': 20}, {'time': '7:00', 'value': 45},
            {'time': '8:00', 'value': 28}, {'time': '9:00', 'value': 80},
            {'time': '10:00', 'value': 99}, {'time': '11:00', 'value': 43},
            {'time': '12:00', 'value': 20}, {'time': '1:00', 'value': 45},
            {'time': '2:00', 'value': 28}, {'time': '3:00', 'value': 80},
            {'time': '4:00', 'value': 99}, {'time': '5:00', 'value': 43}
        ]
    }
    try:
        if not os.path.exists(DATA_FILE):
            logger.info(f"Creating new data.json at {os.path.abspath(DATA_FILE)}")
            with open(DATA_FILE, 'w') as f:
                json.dump(default_data, f, indent=4)
            logger.info("data.json created successfully")
        else:
            logger.info(f"data.json already exists at {os.path.abspath(DATA_FILE)}")
    except Exception as e:
        logger.error(f"Failed to create data.json: {str(e)}")
        raise

# Read data from file
def read_data():
    with data_lock:
        try:
            logger.info(f"Reading data from {os.path.abspath(DATA_FILE)}")
            with open(DATA_FILE, 'r') as f:
                data = json.load(f)
            logger.info("Data read successfully")
            return data
        except (FileNotFoundError, json.JSONDecodeError) as e:
            logger.warning(f"Error reading data.json: {str(e)}. Initializing new file.")
            init_data_file()
            with open(DATA_FILE, 'r') as f:
                data = json.load(f)
            return data
        except Exception as e:
            logger.error(f"Unexpected error reading data.json: {str(e)}")
            raise

# Write data to file
def write_data(data):
    with data_lock:
        try:
            logger.info(f"Writing data to {os.path.abspath(DATA_FILE)}")
            with open(DATA_FILE, 'w') as f:
                json.dump(data, f, indent=4)
            logger.info("Data written successfully")
        except Exception as e:
            logger.error(f"Failed to write data.json: {str(e)}")
            raise


@video_bp.route('/')
def stream_root():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@video_bp.route('/video_feed')
def video_feed():
    """Streaming endpoint: returns the video frames as a MJPEG stream."""
    # Use the generate_frames generator from video.py
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@video_bp.route('/start_stream', methods=['POST'])
def start_stream_endpoint():
    """API endpoint to start the video streaming thread."""
    result = start_stream()  # call the video.start_stream() function
    # Return result as JSON (e.g., {"status": "started", "message": "..."} or "running")
    return jsonify(result)

@video_bp.route('/stop_stream', methods=['POST'])
def stop_stream_endpoint():
    """API endpoint to stop the video streaming thread."""
    result = stop_stream()  # call the video.stop_stream() function
    return jsonify(result)

@video_bp.route('/car_count', methods=['GET'])
def get_car_count():
    """Optional: get the current car count."""
    return jsonify({"count": car_count})

@video_bp.route('/config')
def config_page():
    return render_template('testing.html')

@video_bp.route('/update_config', methods=['POST'])
def update_config():
    data = request.get_json(force=True)  # force=True helps if header is missed
    print("Received config:", data)
    if not isinstance(data, dict):
        return {"error": "Invalid config format"}, 400

    from app import video
    video.set_config(data)
    return {"status": "ok"}

@video_bp.route('/trafficLevel', methods=['GET', 'POST'])
@cross_origin(origins='*')  # CORS for GET; POST origin check inside
def traffic_level():
    try:
        data = read_data()
        if request.method == 'GET':
            return jsonify({'status': 'success', 'trafficLevel': data['level']})

        if request.remote_addr not in adminSource:
            return jsonify({'status': 'error', 'message': 'Unauthorized'}), 403

        req_data = request.get_json()
        new_level = req_data.get("trafficLevel")

        if not isinstance(new_level, int) or not (1 <= new_level <= 9):
            return jsonify({'status': 'error', 'message': 'Traffic level must be an integer between 1 and 9'}), 422

        data['level'] = new_level
        data['historyData'].append({'time': time.strftime("%I:%M"), 'value': new_level})
        if len(data['historyData']) > 12:
            data['historyData'].pop(0)

        write_data(data)
        return jsonify({'status': 'success', 'trafficLevel': new_level})

    except Exception as e:
        logger.error(f"Error in traffic_level: {str(e)}")
        return jsonify({'status': 'error', 'message': str(e)}), 500


@video_bp.route('/thresholds', methods=['GET', 'POST'])
@cross_origin(origins='*')  # GET open; POST origin check inside
def thresholds():
    try:
        data = read_data()
        if request.method == 'GET':
            return jsonify({'status': 'success', 'thresholds': data['thresholdsLevels']})

        if request.remote_addr not in adminSource:
            return jsonify({'status': 'error', 'message': 'Unauthorized'}), 403

        req_data = request.get_json()
        new_thresholds = req_data.get("thresholds")

        if not isinstance(new_thresholds, list) or len(new_thresholds) != 2 or \
           not all(isinstance(x, (int, float)) and x >= 0 for x in new_thresholds):
            return jsonify({'status': 'error', 'message': 'Thresholds must be a list of two non-negative numbers'}), 422

        data['thresholdsLevels'] = new_thresholds
        write_data(data)
        return jsonify({'status': 'success', 'thresholds': new_thresholds})

    except Exception as e:
        logger.error(f"Error in thresholds: {str(e)}")
        return jsonify({'status': 'error', 'message': str(e)}), 500


@video_bp.route('/lotManager', methods=['GET', 'POST'])
@cross_origin(origins='*')  # GET open; POST origin check inside
def lot_manager():
    try:
        data = read_data()
        if request.method == 'GET':
            return jsonify({'status': 'success', 'lotData': data['lotData']})

        if request.remote_addr not in adminSource:
            return jsonify({'status': 'error', 'message': 'Unauthorized'}), 403

        req_data = request.get_json()
        new_lot_data = req_data.get("lotData")

        if not isinstance(new_lot_data, list) or not all(
            isinstance(lot, dict) and
            'name' in lot and 'spaces' in lot and 'isOpen' in lot and
            isinstance(lot['name'], str) and
            isinstance(lot['spaces'], int) and
            isinstance(lot['isOpen'], bool)
            for lot in new_lot_data
        ):
            return jsonify({'status': 'error', 'message': 'Invalid lot data format'}), 422

        data['lotData'] = new_lot_data
        write_data(data)
        return jsonify({'status': 'success', 'lotData': new_lot_data})

    except Exception as e:
        logger.error(f"Error in lot_manager: {str(e)}")
        return jsonify({'status': 'error', 'message': str(e)}), 500


@video_bp.route('/history', methods=['GET'])
@cross_origin(origins='*')
def history():
    try:
        data = read_data()
        return jsonify({'status': 'success', 'historyData': data['historyData']})
    except Exception as e:
        logger.error(f"Error in history: {str(e)}")
        return jsonify({'status': 'error', 'message': str(e)}), 500


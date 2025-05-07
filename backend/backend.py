from flask import Flask, Response, render_template, jsonify, request
from flask_cors import CORS, cross_origin
from flask import Flask, Response, render_template
from ultralytics import YOLO
from deep_sort_realtime.deepsort_tracker import DeepSort
import cv2
import threading
import time
import os
import json
from threading import Lock
import logging

app = Flask(__name__)
CORS(app)
adminSource = 'http://127.0.0.1:5500'

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Global variables for video streaming
output_frame = None
lock = threading.Lock()
rtsp_url = os.getenv('RTSP_URL', "rtsp://192.168.50.201:554/1/h264major")
stream_active = True
detect_faces = True

# File for persistent data storage
DATA_FILE = 'data.json'
data_lock = Lock()

# Initialize data file with default values if it doesn't exist
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

# Video streaming functions
def generate_frames():
    global output_frame, lock, stream_active
    while stream_active:
        with lock:
            if output_frame is None:
                print("output_frame is None")  # TEMP debug
                continue

            print("Sending frame...")
            # Encode the frame as JPEG
            (flag, encoded_image) = cv2.imencode(".jpg", output_frame)
            if not flag:
                continue
        yield(b'--frame\r\n' b'Content-Type: image/jpeg\r\n\r\n' + 
              bytearray(encoded_image) + b'\r\n')
        time.sleep(0.05)

car_count = 0
counted_ids = set()

def point_near_line(px, py, x1, y1, x2, y2, threshold=10):
    A = y2 - y1
    B = x1 - x2
    C = x2 * y1 - x1 * y2
    distance = abs(A * px + B * py + C) / ((A**2 + B**2) ** 0.5)
    return distance < threshold

def stream_video():
    global output_frame, lock, stream_active, car_count, counted_ids

    model = YOLO('yolov8n.pt')
    tracker = DeepSort(max_age=30)

    # Load video file
    video_path = os.path.abspath("static/smctest.mp4")
    print(f"Opening video: {video_path}")
    cap = cv2.VideoCapture(video_path)

    line_start = (380, 352)
    line_end = (215, 0)

    if not cap.isOpened():
        print("Error: Could not open video file.")
        return

    print("Video file opened successfully.")

    # Load car cascade (download and place if needed)
    cascade_path = "static/haarcascade_car.xml"
    car_cascade = cv2.CascadeClassifier(cascade_path)
    if car_cascade.empty():
        print("Error: Failed to load car cascade.")
        return

    while stream_active:
        success, frame = cap.read()
        if not success:
            cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
            continue

        results = model(frame)[0]
        detections = []

        for result in results.boxes.data.tolist():
            x1, y1, x2, y2, score, cls_id = result
            if int(cls_id) == 2:  # car
                detections.append(([x1, y1, x2 - x1, y2 - y1], score, 'car'))

        tracks = tracker.update_tracks(detections, frame=frame)

        for track in tracks:
            if not track.is_confirmed():
                continue

            track_id = track.track_id
            ltrb = track.to_ltrb()
            x1, y1, x2, y2 = map(int, ltrb)
            cx = int((x1 + x2) / 2)
            cy = int((y1 + y2) / 2)

            if point_near_line(cx, cy, *line_start, *line_end, threshold=15) and track_id not in counted_ids:
                car_count += 1
                counted_ids.add(track_id)

            cv2.rectangle(frame, (x1, y1), (x2, y2), (255, 0, 0), 2)
            cv2.putText(frame, f'ID {track_id}', (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
            cv2.circle(frame, (cx, cy), 4, (0, 255, 0), -1)

        cv2.line(frame, line_start, line_end, (0, 255, 255), 2)
        cv2.putText(frame, f'Car Count: {car_count}', (10, 30),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)

        with lock:
            output_frame = frame.copy()

        time.sleep(0.03)

    cap.release()


# API Endpoints
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/toggle_detection')
def toggle_detection():
    global detect_faces
    detect_faces = not detect_faces
    return jsonify({"status": "success", "detecting": detect_faces})

@app.route('/trafficLevel', methods=['GET', 'POST'])
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

@app.route('/thresholds', methods=['GET', 'POST'])
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

@app.route('/lotManager', methods=['GET', 'POST'])
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

@app.route('/history', methods=['GET'])
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

@app.route('/car_count')
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

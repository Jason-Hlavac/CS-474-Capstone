from flask import Flask, Response, render_template, jsonify, request
from flask_cors import CORS
import cv2
import threading
import time
import os

app = Flask(__name__)
CORS(app)

# Global variables
output_frame = None
lock = threading.Lock()
# RTSP URL - YOUR WORKING CAMERA URL
rtsp_url = "rtsp://192.168.50.201:554/1/h264major"
# Flag to control the video stream thread
stream_active = True
# Face detection flag
detect_faces = True
level = 6
thresholdsLevels = [5, 10]
lotData = [{'name': "Main Commuter Lot", 'spaces': 150, 'isOpen': True}, {'name': "Garaventa Lot", 'spaces': 40, 'isOpen': False}, {'name': "Garaventa Lot", 'spaces': 40, 'isOpen': False},{'name': "Garaventa Lot", 'spaces': 40, 'isOpen': False},{'name': "Garaventa Lot", 'spaces': 40, 'isOpen': False},{'name': "Garaventa Lot", 'spaces': 40, 'isOpen': False},{'name': "Garaventa Lot", 'spaces': 40, 'isOpen': False},{'name': "Garaventa Lot", 'spaces': 40, 'isOpen': False},{'name': "Garaventa Lot", 'spaces': 40, 'isOpen': False},{'name': "Garaventa Lot", 'spaces': 40, 'isOpen': False},{'name': "Garaventa Lot", 'spaces': 40, 'isOpen': False},{'name': "Garaventa Lot", 'spaces': 40, 'isOpen': False},{'name': "Garaventa Lot", 'spaces': 40, 'isOpen': False}]
historyData = [
    { 'time': '6:00', 'value': 20 },
    { 'time': '7:00', 'value': 45 },
    { 'time': '8:00', 'value': 28 },
    { 'time': '9:00', 'value': 80 },
    { 'time': '10:00', 'value': 99 },
    { 'time': '11:00', 'value': 43 },
    { 'time': '12:00', 'value': 20 },
    { 'time': '1:00', 'value': 45 },
    { 'time': '2:00', 'value': 28 },
    { 'time': '3:00', 'value': 80 },
    { 'time': '4:00', 'value': 99 },
    { 'time': '5:00', 'value': 43 }
  ]

def generate_frames():
    # Access the global variables
    global output_frame, lock, stream_active
    
    # Loop while streaming is active
    while stream_active:
        # Acquire the lock before accessing the output frame
        with lock:
            if output_frame is None:
                continue
                
            # Encode the frame as JPEG
            (flag, encoded_image) = cv2.imencode(".jpg", output_frame)
            if not flag:
                continue
                
        # Yield the output frame in the byte format
        yield(b'--frame\r\n' b'Content-Type: image/jpeg\r\n\r\n' + 
              bytearray(encoded_image) + b'\r\n')
        time.sleep(0.05)  # Small delay to control frame rate

def stream_video():
    # Access global variables
    global output_frame, lock, rtsp_url, stream_active, detect_faces
    
    # Create a VideoCapture object
    print(f"Attempting to connect to: {rtsp_url}")
    video_stream = cv2.VideoCapture(rtsp_url)
    time.sleep(2.0)  # Allow camera connection to establish
    
    # Check if the camera opened successfully
    if not video_stream.isOpened():
        print("Error: Could not open video stream.")
        return
    
    print("Camera connection established!")
    
    # Load the face cascade classifier
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    
    # Process frames from the video stream
    while stream_active:
        success, frame = video_stream.read()
        if not success:
            print("Error: Failed to read frame.")
            # Attempt to reconnect
            video_stream.release()
            video_stream = cv2.VideoCapture(rtsp_url)
            time.sleep(2.0)
            continue
        
        # Resize frame for faster processing (adjust as needed)
        frame = cv2.resize(frame, (640, 480))
        
        if detect_faces:
            # Convert to grayscale for face detection
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            
            # Detect faces
            faces = face_cascade.detectMultiScale(
                gray,
                scaleFactor=1.1,
                minNeighbors=5,
                minSize=(30, 30),
                flags=cv2.CASCADE_SCALE_IMAGE
            )
            
            # Draw rectangles around faces
            for (x, y, w, h) in faces:
                cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
                cv2.putText(frame, 'Face', (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2)
        
        # Add timestamp to frame
        timestamp = time.strftime("%A %d %B %Y %I:%M:%S %p")
        cv2.putText(frame, timestamp, (10, frame.shape[0] - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 1)
            
        # Acquire the lock before updating the output frame
        with lock:
            output_frame = frame.copy()
            
    # Release the video stream pointer
    video_stream.release()

@app.route('/')
def index():
    """Serve the index page"""
    return render_template('index.html')

# @app.route('/admin')
# def admin():
#     """Serve the index page"""
#     return render_template('admin.html')

@app.route('/video_feed')
def video_feed():
    """Return the response generated along with the specific media type (MIME type)"""
    return Response(generate_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/toggle_detection')
def toggle_detection():
    """Toggle face detection on/off"""
    global detect_faces
    detect_faces = not detect_faces
    return {"status": "success", "detecting": detect_faces}

# API Definitions
@app.route('/trafficLevel', methods = ['GET', 'POST'])
def trafficLevel():
    global level
    if(request.method == 'GET'):
        return jsonify({'status': 'success', 'trafficLevel': level})
    elif(request.method == 'POST'):
        try: 
            data = request.get_json()
            level = data["trafficLevel"]
            return jsonify({'status': 'success', 'trafficLevel': level})
        except:
            return jsonify({'status': 'error'}), 400


@app.route('/thresholds', methods = ['GET', 'POST'])
def thresholds():
    global thresholdsLevels
    if(request.method == 'GET'):
        return jsonify({'status': 'success', 'thresholds': thresholdsLevels})
    elif(request.method == 'POST'):
        try: 
            data = request.get_json()
            thresholdsLevels = data["thresholds"]
            return jsonify({'status': 'success', 'thresholds': thresholdsLevels})
        except:
            return jsonify({'status': 'error'}), 400

@app.route('/lotManager', methods = ['GET', 'POST'])
def lotManager():
    global lotData
    if(request.method == 'GET'):
        return jsonify({'status': 'success', 'lotData': lotData})
    elif(request.method == 'POST'):
        try: 
            data = request.get_json()
            lotData = data["lotData"]
            return jsonify({'status': 'success', 'lotData': lotData})
        except:
            return jsonify({'status': 'error'}), 400

@app.route('/history', methods = ['GET'])
def history():
    global historyData
    if(request.method == 'GET'):
        return jsonify({'status': 'success', 'historyData': historyData})


if __name__ == '__main__':
    # Make sure templates directory exists
    os.makedirs('templates', exist_ok=True)
    
    # Start a thread that will capture frames from the video stream
    stream_thread = threading.Thread(target=stream_video)
    stream_thread.daemon = True
    stream_thread.start()
    
    # Start the Flask app
    app.run(host='0.0.0.0', port=5000, debug=True,
            threaded=True, use_reloader=False)
    
    # When app is closed, set the stream_active flag to False
    stream_active = False
    stream_thread.join()

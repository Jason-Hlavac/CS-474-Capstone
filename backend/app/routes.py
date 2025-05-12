from flask import Blueprint, Response, jsonify
from app.video import generate_frames, start_stream, stop_stream, car_count

# Create a Blueprint for video streaming-related routes
video_bp = Blueprint('video', __name__)

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

from flask import Flask
from app.routes import video_bp  # import the blueprint
from app import video  # import to access video.start_stream at startup

app = Flask(__name__)
app.register_blueprint(video_bp)  # register the video streaming blueprint

# Optionally, configure other settings, logging, etc. here.

# Start the video streaming thread automatically at startup:
video.start_stream()  # this will set the flag and spawn the background thread

if __name__ == '__main__':
    # Run the Flask development server.
    # Important: disable the reloader to avoid launching the thread twice in debug mode.
    app.run(host='0.0.0.0', port=5000, debug=True, threaded=True, use_reloader=False)

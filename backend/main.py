from flask import Flask
from flask_cors import CORS
from app.routes import routes
from app.video import stream_video
from app.data_store import init_data_file
import threading
import signal
import os
import logging

# app = Flask(__name__)
# CORS(app)
# adminSource = 'http://127.0.0.1:5500'
# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.register_blueprint(routes)
os.makedirs('templates', exist_ok=True)

stream_thread = threading.Thread(target=stream_video)
stream_thread.daemon = True
stream_thread.start()

def handle_shutdown(signum, frame):
    from app.video import stream_active, stream_thread
    stream_active = False
    stream_thread.join()
    exit(0)

if __name__ == '__main__':
    signal.signal(signal.SIGINT, handle_shutdown)
    logging.basicConfig(level=logging.INFO)
    init_data_file()

    stream_thread.start()

    app.run(host='0.0.0.0', port=5000, debug=False, threaded=True, use_reloader=False)

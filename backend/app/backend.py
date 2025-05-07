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








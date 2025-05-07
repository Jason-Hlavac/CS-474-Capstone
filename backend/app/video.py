from flask import Flask, Response, render_template, jsonify, request
from flask_cors import CORS, cross_origin
from ultralytics import YOLO
from deep_sort_realtime.deepsort_tracker import DeepSort
import cv2
import time
import os


# # Global variables for video streaming
# output_frame = None
# lock = threading.Lock()
# rtsp_url = os.getenv('RTSP_URL', "rtsp://191.168.50.201:554/1/h264major")
# stream_active = True
# detect_faces = True

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

    model = YOLO('../static/yolov8n.pt')
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
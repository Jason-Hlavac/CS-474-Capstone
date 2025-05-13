import cv2, threading, time, logging
from ultralytics import YOLO
from deep_sort_realtime.deepsort_tracker import DeepSort

# Initialize logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

# Shared resources
output_frame = None
lock = threading.Lock()  # ensure thread-safe access to output_frame:contentReference[oaicite:1]{index=1}
stream_event = threading.Event()  # event flag to signal streaming thread (set = run):contentReference[oaicite:2]{index=2}

# Tracking counters
car_count = 0
counted_ids = set()

config = {
    "model": "yolov8n.pt",
    "entry_line": (380, 352, 215, 0),
    "exit_line": (480, 352, 315, 0),
}

def set_config(new_config):
    global config
    if not isinstance(new_config, dict):
        print("set_config error: input is not a dict")
        return
    config.update(new_config)
    print("Updated config:", config)

def point_near_line(px, py, x1, y1, x2, y2, threshold=10):
    """Utility: check if point (px,py) is within `threshold` pixels of line segment (x1,y1)-(x2,y2)."""
    A = y2 - y1
    B = x1 - x2
    C = x2*y1 - x1*y2
    distance = abs(A*px + B*py + C) / ((A**2 + B**2) ** 0.5)
    return distance < threshold

def _video_loop():
    global output_frame, car_count, counted_ids
    current_model_name = config["model"]
    model = YOLO(current_model_name)

    tracker = DeepSort(
        max_age=30,
        n_init=3,
        max_cosine_distance=0.3)  # Try lowering to 0.2 or 0.25

    cap = cv2.VideoCapture("static/jt_test1.mp4")

    if not cap.isOpened():
        logging.error("Failed to open video source.")
        stream_event.clear()
        return

    logging.info("Video capture started.")

    

    car_count = 0
    line_history = {}  # {track_id: 'entry' or 'exit'}
    last_log_time = time.time()

    while stream_event.is_set():
        ret, frame = cap.read()
        if not ret:
            cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
            continue

        # Inference timing
        start_infer = time.time()
        results = model(frame, verbose=False)[0]
        inference_time = (time.time() - start_infer) * 1000  # ms

        # Update lines from config each frame
        entry_line = ((config['entry_line'][0], config['entry_line'][1]),
                    (config['entry_line'][2], config['entry_line'][3]))
        exit_line = ((config['exit_line'][0], config['exit_line'][1]),
                    (config['exit_line'][2], config['exit_line'][3]))
        
        # Optionally reload model if changed
        if config["model"] != current_model_name:
            model = YOLO(config["model"])
            current_model_name = config["model"]
            print(f"Switched to model: {current_model_name}")

        # Extract car detections
        detections = []
        for *bbox, score, cls_id in results.boxes.data.tolist():
            x1, y1, x2, y2 = map(int, bbox)
            if int(cls_id) == 2 and score > 0.4:  # car class + confidence threshold
                detections.append(([x1, y1, x2 - x1, y2 - y1], score, 'car'))

        # DeepSORT tracking
        tracks = tracker.update_tracks(detections, frame=frame)
        for track in tracks:
            if not track.is_confirmed():
                continue

            track_id = track.track_id
            x1, y1, x2, y2 = map(int, track.to_ltrb())
            cx, cy = int((x1 + x2) / 2), int((y1 + y2) / 2)

            if track_id not in line_history:
                line_history[track_id] = None

            near_entry = point_near_line(cx, cy, *entry_line[0], *entry_line[1], threshold=15)
            near_exit = point_near_line(cx, cy, *exit_line[0], *exit_line[1], threshold=15)

            # Count logic
            if near_entry and line_history[track_id] == 'exit':
                car_count += 1
                line_history[track_id] = 'entry'
            elif near_exit and line_history[track_id] == 'entry':
                car_count -= 1
                line_history[track_id] = 'exit'
            elif near_entry:
                line_history[track_id] = 'entry'
            elif near_exit:
                line_history[track_id] = 'exit'

            # Draw box + ID
            cv2.rectangle(frame, (x1, y1), (x2, y2), (255, 0, 0), 2)
            cv2.putText(frame, f'ID {track_id}', (x1, y1 - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
            cv2.circle(frame, (cx, cy), 4, (0, 255, 0), -1)

        # Draw lines
        cv2.line(frame, *entry_line, (0, 255, 0), 2)
        cv2.line(frame, *exit_line, (0, 0, 255), 2)
        cv2.putText(frame, f'Car Count: {car_count}', (10, 30),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)

        # Log once per second
        now = time.time()
        if now - last_log_time >= 1.0:
            print(f"Car Count: {car_count} | Inference: {round(inference_time, 2)}ms")
            last_log_time = now

        # Update frame
        with lock:
            output_frame = frame.copy()

        time.sleep(0.03)

    cap.release()
    logging.info("Video capture stopped.")


def start_stream():
    """Start the video streaming thread if not already running."""
    if stream_event.is_set():
        logging.warning("Stream already active. Duplicate start request ignored.")
        return {"status": "running", "message": "Stream already running."}
    # Signal the thread to run and start it
    stream_event.set()  # set the flag to True (start running):contentReference[oaicite:5]{index=5}
    thread = threading.Thread(target=_video_loop, daemon=True)
    thread.start()
    logging.info("Video stream thread started.")
    return {"status": "started", "message": "Stream thread started."}

def stop_stream():
    """Stop the video streaming thread if running."""
    if not stream_event.is_set():
        logging.warning("Stream is not active. Stop request ignored.")
        return {"status": "stopped", "message": "Stream already stopped."}
    # Clear the flag to signal thread to stop
    stream_event.clear()  # thread will exit loop on next iteration:contentReference[oaicite:6]{index=6}
    logging.info("Stopping video stream thread...")
    # Note: The thread will terminate itself shortly; no need to join since it's daemon
    return {"status": "stopped", "message": "Stream stopping."}

def generate_frames():
    """Generator function to yield video frames for streaming (MJPEG)."""
    global output_frame  # refers to the frame updated by _video_loop
    # Loop indefinitely to stream frames (will break if stream_event is cleared)
    while True:
        # Only proceed if we have a frame available
        with lock: 
            if output_frame is None:
                # No frame yet, skip this iteration
                continue
            # Encode the frame as JPEG
            success, encoded_image = cv2.imencode(".jpg", output_frame)
            if not success:
                continue
        # Yield the frame in HTTP multipart format
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + bytearray(encoded_image) + b'\r\n')
        # Break out if streaming has been stopped
        if not stream_event.is_set():
            break
        time.sleep(0.05)

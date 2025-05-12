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

def point_near_line(px, py, x1, y1, x2, y2, threshold=10):
    """Utility: check if point (px,py) is within `threshold` pixels of line segment (x1,y1)-(x2,y2)."""
    A = y2 - y1
    B = x1 - x2
    C = x2*y1 - x1*y2
    distance = abs(A*px + B*py + C) / ((A**2 + B**2) ** 0.5)
    return distance < threshold

def _video_loop():
    """Background thread function to process video frames with YOLOv8 + DeepSORT."""
    global output_frame, car_count, counted_ids
    # Load models once at thread start
    model = YOLO('yolov8n.pt')   # YOLOv8 model (e.g., small model)
    tracker = DeepSort(max_age=30) 
    cap = cv2.VideoCapture("static/smctest.mp4")
    if not cap.isOpened():
        logging.error("Failed to open video source.")
        stream_event.clear()
        return

    logging.info("Video capture started.")
    line_start, line_end = (380, 352), (215, 0)  # line for counting
    car_count = 0
    counted_ids = set()

    while stream_event.is_set():  # loop while streaming flag is True:contentReference[oaicite:3]{index=3}
        ret, frame = cap.read()
        if not ret:
            # Loop the video file if at end
            cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
            continue

        # Run YOLO detection
        results = model(frame)[0]
        detections = []
        for *bbox, score, cls_id in results.boxes.data.tolist():
            x1, y1, x2, y2 = map(int, bbox)
            if int(cls_id) == 2:  # class 2 = 'car' in COCO
                detections.append(([x1, y1, x2 - x1, y2 - y1], score, 'car'))
        # Update DeepSORT tracker
        tracks = tracker.update_tracks(detections, frame=frame)
        for track in tracks:
            if not track.is_confirmed():
                continue
            track_id = track.track_id
            x1, y1, x2, y2 = map(int, track.to_ltrb())
            cx, cy = int((x1+x2)/2), int((y1+y2)/2)
            # Count car if it crosses the line (and not counted before)
            if point_near_line(cx, cy, *line_start, *line_end, threshold=15) and track_id not in counted_ids:
                car_count += 1
                counted_ids.add(track_id)
            # Draw bounding box, ID, and center point on frame
            cv2.rectangle(frame, (x1, y1), (x2, y2), (255,0,0), 2)
            cv2.putText(frame, f'ID {track_id}', (x1, y1-10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0,255,0), 2)
            cv2.circle(frame, (cx, cy), 4, (0,255,0), -1)
        # Draw counting line and count text
        cv2.line(frame, line_start, line_end, (0, 255, 255), 2)
        cv2.putText(frame, f'Car Count: {car_count}', (10, 30),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)

        # Update the global output_frame with the new processed frame (thread-safe)
        with lock:
            output_frame = frame.copy()  # copy to avoid issues if frame is reused:contentReference[oaicite:4]{index=4}

        # Small delay to throttle frame rate
        time.sleep(0.03)

    # Cleanup when stream_event is cleared (thread exiting)
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

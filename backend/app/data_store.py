import os
import json
from threading import Lock
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger("car_app")

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

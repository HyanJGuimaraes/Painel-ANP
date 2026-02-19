import requests
import json
import time

url = "http://127.0.0.1:8000/api/history?limit=1000"
max_retries = 5

for i in range(max_retries):
    try:
        print(f"Attempt {i+1}: Connecting to {url}...")
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            print("Successfully connected!")
            print(f"Received {len(data)} records.")
            if len(data) > 0:
                print("First record:", json.dumps(data[0], indent=2))
            else:
                print("Warning: Received empty list (DB empty?).")
            exit(0)
        else:
            print(f"Failed with status: {response.status_code}")
            print(response.text)
            exit(1)
    except Exception as e:
        print(f"Connection failed: {e}")
        time.sleep(2)

print("Could not connect after retries.")
exit(1)

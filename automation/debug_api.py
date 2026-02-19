
import requests
import json

try:
    print("Requesting...")
    response = requests.get("http://127.0.0.1:8000/api/history/municipalities?limit=5")
    print(f"Status: {response.status_code}")
    print("Headers:", response.headers)
    try:
        data = response.json()
        print("Data sample (first 1):", json.dumps(data[:1], indent=2) if data else "Empty list")
    except Exception as e:
        print("Not JSON:", response.text)
except Exception as e:
    print("Failed:", e)

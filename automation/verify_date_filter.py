import requests
import sys

try:
    print("Testing API with start_date=2025-01-01...")
    response = requests.get("http://127.0.0.1:8000/api/history?limit=100&start_date=2025-01-01")
    response.raise_for_status()
    data = response.json()
    
    print(f"Received {len(data)} records.")
    
    if len(data) == 0:
        print("Warning: No data returned. DB might be empty or date too recent.")
    
    failures = 0
    for record in data:
        # datas format: "DD/MM/YYYY - DD/MM/YYYY"
        # We check the second part (end date)
        date_str = record['datas'].split(' - ')[1]
        day, month, year = map(int, date_str.split('/'))
        
        if year < 2025:
            print(f"FAIL: Found record from {year} ({record['datas']})")
            failures += 1
            if failures >= 5: break
            
    if failures == 0:
        print("SUCCESS: All records are from 2025 or later.")
    else:
        print(f"FAILURE: Found {failures} records violating the filter.")
        sys.exit(1)

except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)

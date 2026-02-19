import pandas as pd
import os

# Check the debug file downloaded earlier
file_path = "debug_auto_download.xlsx"

if os.path.exists(file_path):
    try:
        xl = pd.ExcelFile(file_path, engine='openpyxl')
        print(f"Sheet names: {xl.sheet_names}")
    except Exception as e:
        print(f"Error reading Excel: {e}")
else:
    print("Debug file not found.")

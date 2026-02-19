
import pandas as pd
import os

base_dir = os.path.dirname(os.path.abspath(__file__))
file_path = os.path.join(base_dir, "debug_auto_download.xlsx")

try:
    xl = pd.ExcelFile(file_path)
    print(f"Sheet names in {file_path}: {xl.sheet_names}")
except Exception as e:
    print(f"Error reading {file_path}: {e}")

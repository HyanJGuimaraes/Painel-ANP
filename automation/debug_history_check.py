import pandas as pd
import os

file_path = r"c:\Users\hyanjulio\Documents\MyBrain\Documentos Soltos\semanal-estados-desde-2013.xlsx"

print(f"Reading {file_path}...")
try:
    # Try reading first 20 rows to visually find header
    df = pd.read_excel(file_path, header=None, nrows=20, engine='openpyxl')
    with open("debug_history_head.txt", "w", encoding="utf-8") as f:
        f.write(df.to_string())
    print("Saved to debug_history_head.txt")
except Exception as e:
    print(f"Error: {e}")

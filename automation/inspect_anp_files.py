
import pandas as pd
import os

base_path = r"c:\Users\hyanjulio\Documents\MyBrain\Documentos Soltos\Dados da ANP"
files_to_check = [
    "semanal-regioes-desde-2013.xlsx",
    "semanal-municipio-2024-2025.xlsx"
]

for file_name in files_to_check:
    file_path = os.path.join(base_path, file_name)
    print(f"\n--- Analyzing {file_name} ---")

    try:
        # Read first 30 rows headerless
        if file_name.endswith('.xlsb'):
             df = pd.read_excel(file_path, engine='pyxlsb', header=None, nrows=30)
        else:
             df = pd.read_excel(file_path, header=None, nrows=30)
        
        header_row = None
        for i, row in df.iterrows():
            row_str = row.astype(str).str.upper().tolist()
            if any("DATA INICIAL" in str(x) for x in row_str):
                header_row = i
                print(f"FOUND HEADER AT ROW INDEX: {header_row}")
                print(f"Header Content: {row.tolist()}")
                break
        
        if header_row is None:
            print("Could not find 'DATA INICIAL' in first 30 rows.")
    except Exception as e:
        print(f"Error reading {file_name}: {e}")

import pandas as pd
import requests
import urllib3
import os

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# This is the exact link we found in the debug scraper
TEST_URL = "https://www.gov.br/anp/pt-br/centrais-de-conteudo/dados-abertos/arquivos/shpc/dsan/2025/resumo_semanal_lpc_2025-02-16_2025-02-22.xlsx" # Wait, the debug scraper found 2026 links?
# Let's use the one from the debug output: 
# https://www.gov.br/anp/pt-br/centrais-de-conteudo/dados-abertos/arquivos/shpc/dsan/2026/resumo_semanal_lpc_2026-02-01_2026-02-07.xlsx
TARGET_URL = "https://www.gov.br/anp/pt-br/centrais-de-conteudo/dados-abertos/arquivos/shpc/dsan/2026/resumo_semanal_lpc_2026-02-01_2026-02-07.xlsx"

def check_excel_structure():
    print(f"Downloading {TARGET_URL}...")
    headers = {'User-Agent': 'Mozilla/5.0'}
    response = requests.get(TARGET_URL, headers=headers, verify=False)
    
    file_path = "debug_weekly.xlsx"
    with open(file_path, "wb") as f:
        f.write(response.content)
        
    print("Reading Excel file...")
    try:
        # Load the workbook to see sheet names
        xl = pd.ExcelFile(file_path, engine='openpyxl')
        print(f"Sheet names: {xl.sheet_names}")
        
        # Read the first sheet
        df = pd.read_excel(file_path, sheet_name=0, engine='openpyxl')
        print("\nFirst 5 rows:")
        print(df.head())
        print("\nColumns:")
        print(df.columns.tolist())
        
        # Check specifically for expected columns
        expected = ['Regiao - Sigla', 'Produto', 'Valor de Venda']
        found = [c for c in expected if c in df.columns]
        print(f"\nFound expected columns: {found}")
        
    except Exception as e:
        print(f"Error reading Excel: {e}")

if __name__ == "__main__":
    check_excel_structure()

import pandas as pd

url = "https://www.gov.br/anp/pt-br/assuntos/precos-e-defesa-da-concorrencia/precos/arquivos-lpc/2026/resumo_semanal_lpc_2026-02-08_2026-02-14.xlsx"
print("Reading file...")
try:
    df = pd.read_excel(url, sheet_name="REGIOES", header=9, engine='openpyxl')
    print("REGIOES columns:", df.columns.tolist())
except Exception as e:
    print("Error:", e)

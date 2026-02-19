import pandas as pd
import os
import sys
from sqlalchemy import create_engine
from dotenv import load_dotenv

# Add src to python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)) + "/../")

from etl.load import load_data_to_db

load_dotenv()

FILE_PATH = r"c:\Users\hyanjulio\Documents\MyBrain\Documentos Soltos\semanal-estados-desde-2013.xlsx"

def import_history():
    print("=== Importing Historical Data (States 2013+) ===")
    
    if not os.path.exists(FILE_PATH):
        print(f"Error: File not found at {FILE_PATH}")
        return

    print(f"Reading Excel file: {FILE_PATH}")
    # Header detected at row 17 (index 17 in 0-based? No, line 18 in text file is approx row 17. 
    # Text file line 1 is row 0. 
    # Line 20 (row 19) is data.
    # Line 19 (row 18) is HEADER: "DATA INICIAL..."
    # Wait, let's re-verify line numbers in text file.
    # Line 19 starts with "DATA INICIAL". 
    # So header index is 17 or 18?
    # Python read_excel header is 0-indexed.
    # If file has 17 empty/meta lines, header might be index 17.
    # Let's try header=17.
    
    try:
        df = pd.read_excel(FILE_PATH, header=17, engine='openpyxl')
    except Exception as e:
        print(f"Error reading Excel: {e}")
        return

    print("Normalizing columns...")
    # columns: DATA INICIAL, DATA FINAL, REGIÃO, ESTADO, PRODUTO, ...
    header_map = {
        'DATA INICIAL': 'data_inicial',
        'DATA FINAL': 'data_final',
        'REGIÃO': 'regiao',
        'ESTADO': 'estado',
        'PRODUTO': 'produto',
        'NÚMERO DE POSTOS PESQUISADOS': 'num_postos',
        'UNIDADE DE MEDIDA': 'unidade',
        'PREÇO MÉDIO REVENDA': 'preco_medio_revenda',
        'DESVIO PADRÃO REVENDA': 'desvio_padrao_revenda',
        'PREÇO MÍNIMO REVENDA': 'preco_min_revenda',
        'PREÇO MÁXIMO REVENDA': 'preco_max_revenda',
        'MARGEM MÉDIA REVENDA': 'margem_media_revenda',
        'COEF DE VARIAÇÃO REVENDA': 'coef_variacao_revenda',
        'PREÇO MÉDIO DISTRIBUIÇÃO': 'preco_medio_distribuicao',
        'DESVIO PADRÃO DISTRIBUIÇÃO': 'desvio_padrao_distribuicao',
        'PREÇO MÍNIMO DISTRIBUIÇÃO': 'preco_min_distribuicao',
        'PREÇO MÁXIMO DISTRIBUIÇÃO': 'preco_max_distribuicao',
        'COEF DE VARIAÇÃO DISTRIBUIÇÃO': 'coef_variacao_distribuicao'
    }
    
    df.rename(columns=header_map, inplace=True)
    
    # Clean column names (strip spaces just in case)
    df.columns = [c.strip() if isinstance(c, str) else c for c in df.columns]
    
    print(f"Loaded {len(df)} rows.")
    n_rows = len(df)
    if n_rows == 0:
        print("Empty dataframe.")
        return

    # Database connection
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        base_dir = os.path.dirname(os.path.abspath(__file__))
        sqlite_path = os.path.join(base_dir, "../data/ethyl.db")
        db_url = f"sqlite:///{sqlite_path}"
        print(f"[Config] Using Local SQLite: {sqlite_path}")
    else:
        print("[Config] Using Cloud Database")

    print("Loading to table 'anp_history_states'...")
    engine = create_engine(db_url)
    
    # Save to different table due to schema difference (State vs City)
    try:
        print("Using optimized batch insert (chunksize=500)...")
        df.to_sql('anp_history_states', engine, if_exists='replace', index=False, chunksize=500, method='multi')
        print("Success! History data loaded.")
    except Exception as e:
        print(f"Error saving to DB: {e}")

if __name__ == "__main__":
    import_history()


import pandas as pd
import os
import sys
from sqlalchemy import create_engine
from dotenv import load_dotenv

# Add src to python path for imports if needed
sys.path.append(os.path.dirname(os.path.abspath(__file__)) + "/../../")

load_dotenv()

# Configuration
SOURCE_FILE = r"c:\Users\hyanjulio\Documents\MyBrain\Documentos Soltos\Dados da ANP\semanal-regioes-desde-2013.xlsx"
TABLE_NAME = "anp_history_regions"

def find_header_row(df, keyword="DATA INICIAL"):
    for i, row in df.iterrows():
        row_str = row.astype(str).str.upper().tolist()
        if any(keyword in str(x) for x in row_str):
            return i
    return None

def import_regions():
    print("=== Importing Region Data (2013+) ===")
    
    if not os.path.exists(SOURCE_FILE):
        print(f"Error: File not found at {SOURCE_FILE}")
        return

    print(f"Reading Excel file: {SOURCE_FILE}")
    try:
        # Read first 30 rows to scan for header
        df_preview = pd.read_excel(SOURCE_FILE, header=None, nrows=30)
        header_idx = find_header_row(df_preview)
        
        if header_idx is None:
            print("Error: Could not find 'DATA INICIAL' header in first 30 rows.")
            return
            
        print(f"Detected header at row {header_idx}")
        
        # Read actual data
        df = pd.read_excel(SOURCE_FILE, header=header_idx)
    except Exception as e:
        print(f"Error reading Excel: {e}")
        return

    print("Normalizing columns...")
    # Map Excel headers to DB columns
    # Based on inspection: "DATA INICIAL", "DATA FINAL", "REGIÃO", "PRODUTO", ...
    header_map = {
        'DATA INICIAL': 'data_inicial',
        'DATA FINAL': 'data_final',
        'REGIÃO': 'regiao',
        'PRODUTO': 'produto',
        'NÚMERO DE POSTOS PESQUISADOS': 'num_postos',
        'UNIDADE DE MEDIDA': 'unidade',
        'PREÇO MÉDIO REVENDA': 'preco_medio_revenda',
        'DESVIO PADRÃO REVENDA': 'desvio_padrao_revenda',
        'PREÇO MÍNIMO REVENDA': 'preco_min_revenda',
        'PREÇO MÁXIMO REVENDA': 'preco_max_revenda',
        'COEF DE VARIAÇÃO REVENDA': 'coef_variacao_revenda',
        'PREÇO MÉDIO DISTRIBUIÇÃO': 'preco_medio_distribuicao',
        'DESVIO PADRÃO DISTRIBUIÇÃO': 'desvio_padrao_distribuicao',
        'PREÇO MÍNIMO DISTRIBUIÇÃO': 'preco_min_distribuicao',
        'PREÇO MÁXIMO DISTRIBUIÇÃO': 'preco_max_distribuicao',
        'COEF DE VARIAÇÃO DISTRIBUIÇÃO': 'coef_variacao_distribuicao'
    }
    
    # Strip whitespace from columns
    df.columns = [c.strip() if isinstance(c, str) else c for c in df.columns]
    
    df.rename(columns=header_map, inplace=True)
    
    print(f"Loaded {len(df)} rows.")
    
    # Database connection
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        # Fallback to local SQLite if env not set
        base_dir = os.path.dirname(os.path.abspath(__file__))
        sqlite_path = os.path.join(base_dir, "../../ethyl.db")
        db_url = f"sqlite:///{sqlite_path}"
        print(f"[Config] Using Local SQLite: {sqlite_path}")

    print(f"Loading to table '{TABLE_NAME}'...")
    engine = create_engine(db_url)
    
    try:
        df.to_sql(TABLE_NAME, engine, if_exists='replace', index=False, chunksize=500, method='multi')
        print("Success! Region data loaded.")
    except Exception as e:
        print(f"Error saving to DB: {e}")

if __name__ == "__main__":
    import_regions()

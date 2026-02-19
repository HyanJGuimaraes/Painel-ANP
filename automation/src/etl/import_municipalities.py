
import pandas as pd
import os
import sys
import glob
from sqlalchemy import create_engine
from dotenv import load_dotenv

# Add src to python path for imports if needed
sys.path.append(os.path.dirname(os.path.abspath(__file__)) + "/../../")

load_dotenv()

# Configuration
SOURCE_DIR = r"c:\Users\hyanjulio\Documents\MyBrain\Documentos Soltos\Dados da ANP"
TABLE_NAME = "anp_history_municipalities"

def find_header_row(df, keyword="DATA INICIAL"):
    for i, row in df.iterrows():
        row_str = row.astype(str).str.upper().tolist()
        if any(keyword in str(x) for x in row_str):
            return i
    return None

def read_file(file_path):
    print(f"Reading: {os.path.basename(file_path)}")
    
    engines = ['openpyxl', 'pyxlsb', 'xlrd']
    # Prioritize based on extension but fallback
    if file_path.endswith('.xlsb'):
        engines = ['pyxlsb', 'openpyxl', 'xlrd']
    elif file_path.endswith('.xls'):
        engines = ['xlrd', 'openpyxl', 'pyxlsb']
        
    for engine in engines:
        try:
            # Find header
            df_preview = pd.read_excel(file_path, header=None, nrows=30, engine=engine)
            header_idx = find_header_row(df_preview)
            
            if header_idx is None:
                continue # Try next engine or fail later? No, if read works but header missing, engine is probably fine but data is weird.
                # Actually, if read works, engine is fine.
            
            # Read full file
            df = pd.read_excel(file_path, header=header_idx, engine=engine)
            return df
        except Exception as e:
            # print(f"Engine {engine} failed: {e}")
            continue
            
    print(f"Failed to read {os.path.basename(file_path)} with any engine.")
    return None

def import_municipalities():
    print("=== Importing Municipality Data ===")
    
    # updated pattern to catch all relevant files
    files = glob.glob(os.path.join(SOURCE_DIR, "semanal-municipio*.xls*"))
    
    if not files:
        print(f"No files found in {SOURCE_DIR}")
        return

    all_dfs = []
    
    for f in files:
        df = read_file(f)
        if df is not None:
             all_dfs.append(df)
    
    if not all_dfs:
        print("No valid data loaded.")
        return
        
    print("Concatenating all files...")
    full_df = pd.concat(all_dfs, ignore_index=True)
    
    print("Normalizing columns...")
    # Map keys
    header_map = {
        'DATA INICIAL': 'data_inicial',
        'DATA FINAL': 'data_final',
        'REGIÃO': 'regiao',
        'ESTADO': 'estado',
        'MUNICÍPIO': 'municipio',
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
    full_df.columns = [c.strip() if isinstance(c, str) else c for c in full_df.columns]
    
    full_df.rename(columns=header_map, inplace=True)
    
    print(f"Total rows: {len(full_df)}")
    
    # Database connection
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        base_dir = os.path.dirname(os.path.abspath(__file__))
        sqlite_path = os.path.join(base_dir, "../../ethyl.db")
        db_url = f"sqlite:///{sqlite_path}"
        print(f"[Config] Using Local SQLite: {sqlite_path}")

    print(f"Loading to table '{TABLE_NAME}'...")
    engine = create_engine(db_url)
    
    try:
        # Chunksize ensures we don't hit parameter limits
        full_df.to_sql(TABLE_NAME, engine, if_exists='replace', index=False, chunksize=500, method='multi')
        print("Success! Municipality data loaded.")
    except Exception as e:
        print(f"Error saving to DB: {e}")

if __name__ == "__main__":
    import_municipalities()

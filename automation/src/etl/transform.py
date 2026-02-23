import pandas as pd
import os
import sys


def load_and_transform_data(file_path: str, granularity: str = 'state') -> pd.DataFrame:
    """
    Reads the ANP Excel file (Summary), cleans headers, converts types.
    granularity: 'state', 'region', 'municipality'
    """
    print(f"Loading data from {file_path} for {granularity}...")
    
    sheet_map = {
        'state': 'ESTADOS',
        'region': 'REGIOES',
        'municipality': 'MUNICIPIOS'
    }
    
    target_sheet = sheet_map.get(granularity, 'ESTADOS')
    
    # Read Excel. The weekly summary file typically has headers at row 10 (index 9).
    # Need to verify if this holds for all sheets.
    # Assuming index 9 for now based on previous manual check.
    header_idx = 9
    
    try:
        df = pd.read_excel(file_path, sheet_name=target_sheet, header=header_idx, engine='openpyxl')
    except Exception as e:
        print(f"openpyxl failed ({e}), trying xlrd...")
        try:
            df = pd.read_excel(file_path, sheet_name=target_sheet, header=header_idx, engine='xlrd')
        except Exception as e2:
            print(f"Failed to read Excel file: {e2}")
            return pd.DataFrame()

    # Normalize Headers based on granularity
    base_map = {
        'DATA INICIAL': 'data_inicial',
        'DATA FINAL': 'data_final',
        'PRODUTO': 'produto',
        'NÚMERO DE POSTOS PESQUISADOS': 'num_postos',
        'UNIDADE DE MEDIDA': 'unidade',
        'PREÇO MÉDIO REVENDA': 'preco_medio_revenda',
        'DESVIO PADRÃO REVENDA': 'desvio_padrao_revenda',
        'PREÇO MÍNIMO REVENDA': 'preco_min_revenda',
        'PREÇO MÁXIMO REVENDA': 'preco_max_revenda',
        'COEF DE VARIAÇÃO REVENDA': 'coef_variacao_revenda'
    }
    
    if granularity == 'state':
        base_map['ESTADOS'] = 'estado'
        base_map['REGIAO'] = 'regiao'
    elif granularity == 'region':
        base_map['REGIÃO'] = 'regiao'
        base_map['REGIAO'] = 'regiao'
    elif granularity == 'municipality':
        base_map['ESTADO'] = 'estado'
        base_map['MUNICÍPIO'] = 'municipio'
        base_map['REGIAO'] = 'regiao'
    
    # Clean headers first so the rename map works properly
    df.columns = [c.strip() if isinstance(c, str) else c for c in df.columns]

    df.rename(columns=base_map, inplace=True)
    
    # Ensure all expected columns exist (fill missing with None)
    distribution_cols = [
        'preco_medio_distribuicao', 'desvio_padrao_distribuicao', 
        'preco_min_distribuicao', 'preco_max_distribuicao', 
        'coef_variacao_distribuicao', 'margem_media_revenda'
    ]
    
    for col in distribution_cols:
        if col not in df.columns:
            df[col] = None 
        
    # Convert types
    cols_to_float = [
        'preco_medio_revenda', 'desvio_padrao_revenda', 
        'preco_min_revenda', 'preco_max_revenda', 'coef_variacao_revenda'
    ]
    
    def clean_currency(x):
        if isinstance(x, str):
            val = x.replace(',', '.')
            # Handle '-' or empty
            if val.strip() == '-' or not val.strip():
                return None
            try:
                return float(val)
            except:
                return None
        return x

    for col in cols_to_float:
        if col in df.columns:
            df[col] = df[col].apply(clean_currency)
    
    # Date conversion
    cols_to_date = ['data_inicial', 'data_final']
    for col in cols_to_date:
        if col in df.columns:
            df[col] = pd.to_datetime(df[col], errors='coerce')
    
    # Drop rows where keys are missing
    if granularity == 'state':
        df.dropna(subset=['estado', 'produto', 'data_final'], inplace=True)
    elif granularity == 'region':
        df.dropna(subset=['regiao', 'produto', 'data_final'], inplace=True)
    elif granularity == 'municipality':
        df.dropna(subset=['municipio', 'estado', 'produto', 'data_final'], inplace=True)

    print(f"Transformed data ({granularity}): {len(df)} rows.")
    return df

if __name__ == "__main__":
    # Test path
    base_dir = os.path.dirname(os.path.abspath(__file__))
    debug_file = os.path.join(base_dir, "../../automation/debug_auto_download.xlsx")
    
    if os.path.exists(debug_file):
        df_reg = load_and_transform_data(debug_file, 'region')
        print("Regions Head:", df_reg.head())
        df_mun = load_and_transform_data(debug_file, 'municipality')
        print("Municipalities Head:", df_mun.head())
    else:
        print(f"File not found: {debug_file}")

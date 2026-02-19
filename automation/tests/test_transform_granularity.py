
import pandas as pd
import pytest
import os
import sys

# Add src to python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)) + "/../src")

from etl.transform import load_and_transform_data

# Mocking pd.read_excel is hard due to engine dependency.
# Instead, we can verify the column mapping logic if we extract it, 
# but for now let's just create a dummy excel if needed or test the function logic if refactored.
# Actually, let's just make a small script that creates temporary excel files and tests load_and_transform.

def test_transform_granularity():
    # Create a dummy dataframe with Region columns
    df_region = pd.DataFrame({
        'DATA INICIAL': ['2023-01-01'],
        'DATA FINAL': ['2023-01-07'],
        'REGIÃO': ['SE'],
        'PRODUTO': ['GASOLINA'],
        'PREÇO MÉDIO REVENDA': ['5,00']
    })
    
    # Save to temp file
    region_file = "test_region.xlsx"
    df_region.to_excel(region_file, index=False, sheet_name='REGIOES', startrow=9)
    # Note: openpyxl engine header is 0-indexed, but our code uses header=9.
    # So we need to put data at row 9 (index 9) -> line 10 in Excel.
    # to_excel startrow=9 means header is at row 9.
    
    try:
        # Test Granularity: region
        df_out = load_and_transform_data(region_file, granularity='region')
        assert not df_out.empty
        assert 'regiao' in df_out.columns
        assert df_out.iloc[0]['regiao'] == 'SE'
        print("Region Transform Check: PASS")
        
        # Test Granularity: municipality (requires diff sheet)
        df_mun = pd.DataFrame({
            'DATA INICIAL': ['2023-01-01'],
            'DATA FINAL': ['2023-01-07'],
            'REGIÃO': ['SE'],
            'ESTADO': ['SP'],
            'MUNICÍPIO': ['SAO PAULO'],
            'PRODUTO': ['GASOLINA'],
            'PREÇO MÉDIO REVENDA': ['5,00']
        })
        mun_file = "test_mun.xlsx"
        df_mun.to_excel(mun_file, index=False, sheet_name='MUNICIPIOS', startrow=9)
        
        df_out_mun = load_and_transform_data(mun_file, granularity='municipality')
        assert not df_out_mun.empty
        assert 'municipio' in df_out_mun.columns
        assert df_out_mun.iloc[0]['municipio'] == 'SAO PAULO'
        print("Municipality Transform Check: PASS")
        
    finally:
        if os.path.exists(region_file):
            os.remove(region_file)
        if os.path.exists(mun_file):
            os.remove(mun_file)

if __name__ == "__main__":
    test_transform_granularity()

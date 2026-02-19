import requests
import pandas as pd
from bs4 import BeautifulSoup
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

URL = "https://www.gov.br/anp/pt-br/assuntos/precos-e-defesa-da-concorrencia/precos/levantamento-de-precos-de-combustiveis-ultimas-semanas-pesquisadas"

def debug_weekly_page():
    print(f"Scraping {URL}...")
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    response = requests.get(URL, headers=headers, verify=False)
    soup = BeautifulSoup(response.content, 'html.parser')
    
    print("Searching for 'Preços médios semanais' links...")
    found_links = []
    
    # The user wants "Preços médios semanais: Brasil, regiões, estados e municípios"
    target_text = "Preços médios semanais: Brasil, regiões, estados e municípios"
    
    for a in soup.find_all('a', href=True):
        text = a.text.strip()
        if "Preços médios semanais" in text:
            print(f"Found: {text[:50]}... -> {a['href']}")
            found_links.append((text, a['href']))
            
    if found_links:
        target_url = found_links[0][1]
        print(f"\nTop link (Latest): {target_url}")
        
        print(f"Downloading {target_url}...")
        try:
            r = requests.get(target_url, headers=headers, verify=False)
            with open("debug_auto_download.xlsx", "wb") as f:
                f.write(r.content)
            print("Download saved to debug_auto_download.xlsx")
            
            # Verify if it is valid Excel
            try:
                print("Trying to read with openpyxl...")
                df = pd.read_excel("debug_auto_download.xlsx", engine='openpyxl')
                print("SUCCESS: File is valid Excel (openpyxl).")
                df = pd.read_excel("debug_auto_download.xlsx", sheet_name='ESTADOS', engine='openpyxl')
                with open("debug_estados_head.txt", "w", encoding="utf-8") as f:
                    f.write(df.head(20).to_string())
                print("Head ESTADOS saved to debug_estados_head.txt")
            except Exception as e_openpyxl:
                print(f"openpyxl failed: {e_openpyxl}")
                try:
                    print("Trying to read with xlrd (legacy .xls)...")
                    pd.read_excel("debug_auto_download.xlsx", engine='xlrd')
                    print("SUCCESS: File is valid Excel (xlrd).")
                except Exception as e_xlrd:
                    print(f"ERROR: File is not valid Excel. Content start: {r.content[:100]}")
                    print(f"xlrd error: {e_xlrd}")
                
        except Exception as e:
            print(f"Download failed: {e}")
            
    else:
        print("No links found.")

if __name__ == "__main__":
    debug_weekly_page()

import requests
from bs4 import BeautifulSoup
import os
import re

ANP_URL = "https://www.gov.br/anp/pt-br/assuntos/precos-e-defesa-da-concorrencia/precos/levantamento-de-precos-de-combustiveis-ultimas-semanas-pesquisadas"

def get_latest_weekly_url():
    """
    Scrapes ANP page to find the latest 'Preços médios semanais' XLSX link.
    """
    print(f"Scraping {ANP_URL}...")
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    try:
        response = requests.get(ANP_URL, headers=headers)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Target text: "Preços médios semanais: Brasil, regiões, estados e municípios"
        target_text_pattern = re.compile(r"Preços médios semanais.*Brasil.*municípios", re.IGNORECASE)
        
        # Find first matching link (assuming dates are ordered descending)
        for a in soup.find_all('a', href=True):
            if target_text_pattern.search(a.text):
                print(f"Found URL: {a['href']}")
                return a['href']
                
        print("No match found for 'Preços médios semanais'.")
        return None
        
    except Exception as e:
        print(f"Error scraping ANP: {e}")
        return None

def download_file(url, output_dir):
    """
    Downloads the file from url to output_dir.
    Returns absolute path of saved file.
    """
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        
    filename = url.split('/')[-1]
    # Ensure extension is .xlsx (sometimes url doesn't have it or has params)
    if not filename.endswith('.xlsx') and not filename.endswith('.xls'):
        filename += ".xlsx"
        
    filepath = os.path.join(output_dir, filename)
    
    print(f"Downloading {filename}...")
    try:
        r = requests.get(url)
        r.raise_for_status()
        
        with open(filepath, "wb") as f:
            f.write(r.content)
            
        print(f"Saved to {filepath}")
        return filepath
    except Exception as e:
        print(f"Download failed: {e}")
        return None

if __name__ == "__main__":
    url = get_latest_weekly_url()
    if url:
        # Resolves to automation/data/raw regardless of CWD
        base_dir = os.path.dirname(os.path.abspath(__file__))
        data_dir = os.path.join(base_dir, "../../data/raw")
        download_file(url, data_dir)

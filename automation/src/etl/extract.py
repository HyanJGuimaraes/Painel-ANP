import requests
from bs4 import BeautifulSoup
import os
import re
from datetime import datetime

ANP_URL = "https://www.gov.br/anp/pt-br/assuntos/precos-e-defesa-da-concorrencia/precos/levantamento-de-precos-de-combustiveis-ultimas-semanas-pesquisadas"

def extract_date_from_str(text):
    """
    Attempts to extract a date from a string or URL.
    Supports YYYY-MM-DD, DD-MM-YYYY, DD_MM_YYYY.
    """
    # Pattern 1: YYYY-MM-DD
    m1 = re.search(r'(\d{4})-(\d{2})-(\d{2})', text)
    if m1:
        try: return datetime(int(m1.group(1)), int(m1.group(2)), int(m1.group(3)))
        except ValueError: pass
        
    # Pattern 2: DD-MM-YYYY or DD_MM_YYYY
    m2 = re.search(r'(\d{2})[-_](\d{2})[-_](\d{4})', text)
    if m2:
        try: return datetime(int(m2.group(3)), int(m2.group(2)), int(m2.group(1)))
        except ValueError: pass
        
    return datetime(1900, 1, 1)

def get_latest_weekly_url():
    """
    Scrapes ANP page to find the latest 'Preços médios semanais' XLSX link.
    Sorts matches by date to avoid issues with non-chronological DOM order.
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
        
        matches = []
        for a in soup.find_all('a', href=True):
            if target_text_pattern.search(a.text):
                url = a['href']
                # Combine text and URL for date extraction
                date = extract_date_from_str(url + " " + a.text)
                matches.append({'url': url, 'date': date})
                
        if not matches:
            print("No match found for 'Preços médios semanais'.")
            return None
            
        # Sort by date descending
        matches.sort(key=lambda x: x['date'], reverse=True)
        
        latest = matches[0]
        print(f"Found Latest URL: {latest['url']} (Extracted Date: {latest['date'].date()})")
        return latest['url']
        
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

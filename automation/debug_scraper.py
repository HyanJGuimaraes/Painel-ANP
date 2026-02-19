from bs4 import BeautifulSoup

with open("debug_anp.html", "rb") as f:
    content = f.read()

soup = BeautifulSoup(content, 'html.parser')

print("Searching for ALL links...")
count = 0
for a in soup.find_all('a', href=True):
    href = a['href']
    text = a.text.strip().lower()
    if '.csv' in href.lower():
        if 'gasolina' in href.lower() or 'automotivos' in href.lower() or 'gasolina' in text or 'automotivos' in text:
             print(f"MATCH: {text} -> {href}")
             count += 1

print(f"Total CSV links found: {count}")

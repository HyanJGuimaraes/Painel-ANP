
from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv("automation/.env")
db_url = os.getenv("DATABASE_URL")
if not db_url:
    print("WARNING: DATABASE_URL not found, trying local default if applicable or failing.")
    
try:
    engine = create_engine(db_url)
    with engine.connect() as conn:
        result = conn.execute(text("SELECT DISTINCT produto FROM anp_history_municipalities"))
        print("Products in DB:")
        for row in result:
            print(f"- '{row[0]}'")
except Exception as e:
    print(f"Error: {e}")

from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv("DATABASE_URL")

engine = create_engine(db_url)
with engine.connect() as conn:
    print("Querying Date Range...")
    min_date = conn.execute(text("SELECT MIN(data_final) FROM anp_history_states")).scalar()
    max_date = conn.execute(text("SELECT MAX(data_final) FROM anp_history_states")).scalar()
    print(f"Date Range: {min_date} to {max_date}")

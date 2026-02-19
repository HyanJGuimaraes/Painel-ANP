
import os
import sys
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Add src to python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)) + "/../")
load_dotenv()

def verify_counts():
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        base_dir = os.path.dirname(os.path.abspath(__file__))
        sqlite_path = os.path.join(base_dir, "../ethyl.db")
        db_url = f"sqlite:///{sqlite_path}"
        
    engine = create_engine(db_url)
    
    with engine.connect() as conn:
        # Whitelisted tables - Safe from SQL Injection
        tables = ["anp_history_states", "anp_history_regions", "anp_history_municipalities"]
        for t in tables:
            try:
                # Count
                res_count = conn.execute(text(f"SELECT COUNT(*) FROM {t}"))
                count = res_count.scalar()
                
                # Date Range
                res_min = conn.execute(text(f"SELECT MIN(data_final) FROM {t}"))
                min_date = res_min.scalar()
                
                res_max = conn.execute(text(f"SELECT MAX(data_final) FROM {t}"))
                max_date = res_max.scalar()
                
                print(f"Table '{t}': {count} rows | Range: {min_date} to {max_date}")
            except Exception as e:
                print(f"Table '{t}': Error/Not Found ({e})")

if __name__ == "__main__":
    verify_counts()


import os
import sys
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Add src to python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)) + "/../")
load_dotenv()

CUTOFF_DATE = '2024-01-01'

def cleanup_data():
    print(f"=== Cleaning up data older than {CUTOFF_DATE} ===")
    
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        base_dir = os.path.dirname(os.path.abspath(__file__))
        sqlite_path = os.path.join(base_dir, "../data/ethyl.db")
        # Ensure path is correct relative to this script location
        if not os.path.exists(os.path.dirname(sqlite_path)):
             sqlite_path = os.path.join(base_dir, "ethyl.db") # Fallback
             
        db_url = f"sqlite:///{sqlite_path}"
        print(f"[Config] Using Local SQLite: {sqlite_path}")
    else:
        print(f"[Config] Using Database: {db_url.split('@')[-1]}")

    engine = create_engine(db_url)
    
    tables = ["anp_history_states", "anp_history_regions", "anp_history_municipalities"]
    
    with engine.connect() as conn:
        for t in tables:
            try:
                # Check current count
                res_before = conn.execute(text(f"SELECT COUNT(*) FROM {t}"))
                count_before = res_before.scalar()
                
                print(f"\nTable '{t}': {count_before} rows existing.")
                
                # Delete
                print(f"Deleting rows where data_final < '{CUTOFF_DATE}'...")
                stmt = text(f"DELETE FROM {t} WHERE data_final < :cutoff")
                result = conn.execute(stmt, {"cutoff": CUTOFF_DATE})
                rows_deleted = result.rowcount
                conn.commit()
                
                print(f"Deleted {rows_deleted} rows.")
                
                # Verify
                res_after = conn.execute(text(f"SELECT COUNT(*) FROM {t}"))
                count_after = res_after.scalar()
                print(f"Remaining: {count_after} rows.")
                
            except Exception as e:
                print(f"Error processing table '{t}': {e}")

if __name__ == "__main__":
    cleanup_data()

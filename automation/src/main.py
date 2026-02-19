import os
import sys
from dotenv import load_dotenv

# Add src to python path to allow imports if running from root
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Load environment variables
load_dotenv()

from etl.extract import get_latest_weekly_url, download_file
from etl.transform import load_and_transform_data
from etl.load import load_data_to_db

def run_pipeline():
    print("=== Starting ANP Fuel Price ETL Pipeline (Weekly Update) ===")
    
    # Define Database Connection
    # Priority: DATABASE_URL env var (Neon/Postgres) -> Local SQLite fallback
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        base_dir = os.path.dirname(os.path.abspath(__file__))
        sqlite_path = os.path.join(base_dir, "../data/ethyl.db")
        # Ensure directory exists for SQLite
        os.makedirs(os.path.dirname(sqlite_path), exist_ok=True)
        db_url = f"sqlite:///{sqlite_path}"
        print(f"[Config] Using Local SQLite: {sqlite_path}")
    else:
        print("[Config] Using Cloud Database (Neon/Postgres)")

    # 1. Extract
    print("\n[Step 1] Extraction")
    url = get_latest_weekly_url()
    if not url:
        print("Failed to find Weekly XLSX URL.")
        return
    
    # Define paths relative to this script
    base_dir = os.path.dirname(os.path.abspath(__file__))
    raw_data_dir = os.path.join(base_dir, "../data/raw")
    
    csv_path = download_file(url, raw_data_dir)
    if not csv_path:
        print("Failed to download file.")
        return
        
    # 2. Transform & Load (Iterating granularities)
    granularities = [
        ('state', 'anp_history_states'),
        ('region', 'anp_history_regions'),
        ('municipality', 'anp_history_municipalities')
    ]

    for granularity, table_name in granularities:
        print(f"\n[Processing] {granularity.upper()} -> {table_name}")
        
        try:
            print("  - Transforming...")
            df = load_and_transform_data(csv_path, granularity=granularity)
            
            if df.empty:
                print(f"  - Warning: Empty DataFrame for {granularity}.")
                continue
                
            print("  - Loading...")
            load_data_to_db(df, db_url, table_name=table_name)
            print(f"  - Success: {granularity} processed.")
            
        except Exception as e:
            print(f"  - Error processing {granularity}: {e}")
    
    print("\n=== Pipeline Completed Successfully ===")

if __name__ == "__main__":
    run_pipeline()

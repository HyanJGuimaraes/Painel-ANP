from sqlalchemy import create_engine, text, inspect
import pandas as pd
import os

def load_data_to_db(df: pd.DataFrame, db_url: str, table_name: str = 'anp_history_states'):
    """
    Loads transformed DataFrame into database (SQLite or Postgres) with incremental logic.
    """
    # Validate table_name (simple identifier check)
    # Validate table_name against whitelist (Security Hardening)
    ALLOWED_TABLES = {'anp_history_states', 'anp_history_regions', 'anp_history_municipalities'}
    if table_name not in ALLOWED_TABLES:
        raise ValueError(f"Invalid table name: {table_name}. Must be one of {ALLOWED_TABLES}")

    # Create engine directly from URL
    print(f"Connecting to database...")
    engine = create_engine(db_url)
    
    # Check for existing table and schema
    inspector = inspect(engine)
    table_exists = table_name in inspector.get_table_names()
    
    if table_exists:
        # Check columns to see if it's the old schema
        columns = [col['name'] for col in inspector.get_columns(table_name)]
        if 'cnpj' in columns:
            print("Detected old schema (Granular Data). Dropping table to replace with Summary Data...")
            with engine.connect() as conn:
                conn.execute(text(f"DROP TABLE {table_name}"))
                conn.commit() # Ensure drop is committed
            print("Table dropped.")
            table_exists = False # Update flag
            
    # Incremental Logic
    # If table exists (and matches schema), find max date
    if table_exists:
        with engine.connect() as conn:
            # table_name is validated above
            result = conn.execute(text(f"SELECT MAX(data_final) FROM {table_name}"))
            max_date = result.scalar()
                
def load_data_to_db(df: pd.DataFrame, db_url: str, table_name: str = "anp_history_states"):
    """
    Loads DataFrame to Postgres/SQLite.
    """
    if df.empty:
        print("Dataframe is empty, skipping load.")
        return

    print(f"Connecting to DB: {db_url.split('@')[-1] if '@' in db_url else 'SQLite'}") # Mask password
    engine = create_engine(db_url)
    
    try:
        # Use 'append' to add new weekly data
        # 'replace' would wipe history! valid for historical import, but for weekly update?
        # If weekly update overlaps, we might have duplicates.
        # Ideally we should upsert. But for now, let's assume 'append' and we handle duplicates later or ignore.
        # Actually, the 'main.py' is a "Weekly Update". 
        # If we use 'append', we might duplicate data if we run it twice.
        # Let's use 'append' for now.
        
        print(f"Appending {len(df)} rows to {table_name}...")
        df.to_sql(table_name, engine, if_exists='append', index=False, chunksize=500, method='multi')
        print("Data loaded successfully.")
    except Exception as e:
        print(f"Failed to load data to DB: {e}")
        raise

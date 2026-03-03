from sqlalchemy import create_engine, text, inspect
import pandas as pd
import os

def load_data_to_db(df: pd.DataFrame, db_url: str, table_name: str = 'anp_history_states'):
    """
    Loads transformed DataFrame into database (SQLite or Postgres) with incremental logic.
    """
    if df.empty:
        print("Dataframe is empty, skipping load.")
        return

    # Validate table_name against whitelist (Security Hardening)
    ALLOWED_TABLES = {'anp_history_states', 'anp_history_regions', 'anp_history_municipalities'}
    if table_name not in ALLOWED_TABLES:
        raise ValueError(f"Invalid table name: {table_name}. Must be one of {ALLOWED_TABLES}")

    # Create engine directly from URL
    print(f"Connecting to DB: {db_url.split('@')[-1] if '@' in db_url else 'SQLite'} (Masked)")
    engine = create_engine(db_url, insertmanyvalues_page_size=50)
    
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
    if table_exists:
        with engine.connect() as conn:
            result = conn.execute(text(f"SELECT MAX(data_final) FROM {table_name}"))
            max_date = result.scalar()
        
        if max_date is not None:
            max_db_dt = pd.to_datetime(max_date)
            # Filter df to only keep rows newer than what's in DB
            new_df = df[df['data_final'] > max_db_dt]
            
            if len(new_df) < len(df):
                skipped = len(df) - len(new_df)
                print(f"[Incremental] Data in file ends at {df['data_final'].max().date()}. DB already has data up to {max_db_dt.date()}.")
                print(f"[Incremental] Skipped {skipped} rows already present in DB.")
            
            df = new_df
            
        if df.empty:
            print("[Incremental] No new data to load. Everything in this file is already in the database.")
            return

    try:
        # If table exists, drop columns from df that are not in the DB schema
        if table_exists:
            db_columns = [col['name'] for col in inspector.get_columns(table_name)]
            df = df[[col for col in df.columns if col in db_columns]]
            
        print(f"Appending {len(df)} rows to {table_name}...")
        df.to_sql(table_name, engine, if_exists='append', index=False, chunksize=50)
        print("Data loaded successfully.")
    except Exception as e:
        print(f"Failed to load data to DB: {e}")
        raise

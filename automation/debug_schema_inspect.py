from sqlalchemy import create_engine, inspect
import os
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv("DATABASE_URL")
if not db_url:
    print("DATABASE_URL not found")
    exit(1)

engine = create_engine(db_url)
inspector = inspect(engine)
table = 'anp_history_states'

print(f"--- Columns in {table} ---")
for col in inspector.get_columns(table):
    print(f"{col['name']} ({col['type']})")

print(f"\n--- Primary Keys in {table} ---")
pk = inspector.get_pk_constraint(table)
print(pk)

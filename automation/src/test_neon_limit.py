import pandas as pd
from sqlalchemy import create_engine
import os
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv("DATABASE_URL")
if not db_url:
    print("No DATABASE_URL found. Please run with environment variable set.")
    exit(1)

print(f"Connecting to {db_url.split('@')[-1]}")
engine = create_engine(db_url)

# Create a dummy dataframe with 18 columns and 200 rows (similar to municipality insert)
data = {f"col_{i}": range(200) for i in range(18)}
df = pd.DataFrame(data)

try:
    print(f"Testing insert with chunksize=100")
    df.to_sql('test_param_limit', engine, if_exists='replace', index=False, chunksize=100, method='multi')
    print("Success: chunksize=100 worked.")
except Exception as e:
    print(f"Failed chunksize=100: {e}")

try:
    print(f"Testing insert with chunksize=50")
    df.to_sql('test_param_limit', engine, if_exists='replace', index=False, chunksize=50, method='multi')
    print("Success: chunksize=50 worked.")
except Exception as e:
    print(f"Failed chunksize=50: {e}")

# Cleanup
with engine.connect() as conn:
    conn.execute(pd.io.sql.text("DROP TABLE IF EXISTS test_param_limit"))
    conn.commit()

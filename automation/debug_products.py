from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()

engine = create_engine(os.getenv("DATABASE_URL"))
with engine.connect() as conn:
    result = conn.execute(text("SELECT DISTINCT produto FROM anp_history_states"))
    print("Products in DB:")
    for row in result:
        print(f" - '{row[0]}'")

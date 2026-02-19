from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# Load .env from automation/ folder (parent of backend)
basedir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(basedir, "../.env")
load_dotenv(env_path)

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set in .env")

# Use sync engine
print(f"Connecting to DB: {DATABASE_URL.split('@')[-1] if '@' in DATABASE_URL else 'LOCAL'}")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

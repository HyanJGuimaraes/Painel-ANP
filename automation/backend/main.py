from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import List
import traceback
import sys

from . import crud, models, schemas
from .database import engine, get_db

# Create tables if not exist (though we rely on existing ones)
# models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="ANP Fuel Price API")

# CORS Configuration for Frontend (Vite)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for dev simplicity (port 8080 was blocked)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    error_msg = "".join(traceback.format_exception(None, exc, exc.__traceback__))
    print(f"CRITICAL ERROR: {error_msg}", file=sys.stderr)
    return JSONResponse(
        status_code=500,
        content={"message": "Internal Server Error", "detail": str(exc), "trace": error_msg},
    )

@app.get("/api/history", response_model=List[schemas.FuelRecord])
def read_history(limit: int = 5000, start_date: str = None, db: Session = Depends(get_db)):
    """
    Returns historical fuel data pivoted for frontend consumption.
    """
    return crud.get_history(db, limit=limit, start_date=start_date)

@app.get("/api/last-update", response_model=schemas.LastUpdate)
def read_last_update(db: Session = Depends(get_db)):
    return crud.get_last_update(db)

@app.get("/api/history/municipalities", response_model=List[schemas.FuelRecordMunicipality])
def read_municipalities_history(
    product: str = None, 
    state: str = None, 
    region: str = None, 
    start_date: str = None,
    end_date: str = None,
    db: Session = Depends(get_db)
):
    """
    Returns municipality data. Default: last 5 available weeks.
    Can be filtered by product, state, region, and date range.
    """
    return crud.get_municipalities(db, product=product, state=state, region=region, start_date=start_date, end_date=end_date)

@app.get("/api/history/regions", response_model=List[schemas.FuelRecordRegion])
def read_regions_history(product: str = None, db: Session = Depends(get_db)):
    """
    Returns region data for the last 5 available weeks.
    """
    return crud.get_regions(db, product=product)

@app.get("/")
def read_root():
    return {"message": "ANP Fuel Tracker API is running."}

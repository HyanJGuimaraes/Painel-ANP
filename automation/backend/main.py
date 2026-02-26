from fastapi import FastAPI, Depends, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import List
import traceback
import sys

from . import crud, models, schemas, auth
from .database import engine, get_db
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta

# Create tables if not exist (though we rely on existing ones)
# models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="ANP Fuel Price API")

# --- Auth Routes ---

@app.post("/api/auth/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(email=user.email, hashed_password=hashed_password, role=user.role)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/api/auth/login", response_model=schemas.Token)
def login(user_credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == user_credentials.email).first()
    if not user or not auth.verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email, "role": user.role}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "role": user.role
        }
    }

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
    limit: int = 50000,
    db: Session = Depends(get_db)
):
    """
    Returns municipality data. Default: last 5 available weeks.
    Can be filtered by product, state, region, and date range.
    """
    return crud.get_municipalities(db, product=product, state=state, region=region, start_date=start_date, end_date=end_date, limit=limit)

@app.get("/api/history/regions", response_model=List[schemas.FuelRecordRegion])
def read_regions_history(product: str = None, limit: int = 5000, db: Session = Depends(get_db)):
    """
    Returns region data for the last 5 available weeks.
    """
    return crud.get_regions(db, product=product, limit=limit)

@app.get("/")
def read_root():
    return {"message": "ANP Fuel Tracker API is running."}

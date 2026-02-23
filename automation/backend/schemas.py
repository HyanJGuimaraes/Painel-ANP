from pydantic import BaseModel
from typing import List, Optional, Any

class FuelRecord(BaseModel):
    estado: str
    datas: str
    etanol: float
    gasolina: float
    difNom: float
    paridade: float
    # Volatility / B2B Metrics
    etanol_min: Optional[float] = None
    etanol_max: Optional[float] = None
    gasolina_min: Optional[float] = None
    gasolina_max: Optional[float] = None
    headroom: float          # R$ margin before parity break
    demand_signal: str       # STRONG, NEUTRAL, WEAK


class LastUpdate(BaseModel):
    last_updated: str
    total_records: int

class FuelRecordMunicipality(BaseModel):
    id: Optional[int] = None
    data_final: Optional[Any] = None  # Allow datetime or str
    data_inicial: Optional[Any] = None
    estado: str
    municipio: str
    regiao: str
    produto: str
    preco_medio_revenda: float
    preco_min_revenda: float
    preco_max_revenda: float
    # We can add more fields if needed

    class Config:
        from_attributes = True

class FuelRecordRegion(BaseModel):
    id: Optional[int] = None
    data_final: Optional[Any] = None
    regiao: str
    produto: str
    preco_medio_revenda: float
    preco_min_revenda: float
    preco_max_revenda: float

    class Config:
        from_attributes = True

# --- Auth Schemas ---

class UserCreate(BaseModel):
    email: str
    password: str
    role: Optional[str] = "master"

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    role: str

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

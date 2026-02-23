from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from .database import Base

class FuelHistory(Base):
    __tablename__ = "anp_history_states"

    # Composite Logical PK for SQLAlchemy mapping
    # (The DB table itself has no PK, but SQLAlchemy needs one to map objects)
    data_final = Column(DateTime, primary_key=True)
    estado = Column(String, primary_key=True)
    produto = Column(String, primary_key=True)
    
    data_inicial = Column(DateTime)
    regiao = Column(String)
    num_postos = Column(Integer)
    unidade = Column(String)
    preco_medio_revenda = Column(Float)
    desvio_padrao_revenda = Column(Float)
    preco_min_revenda = Column(Float)
    preco_max_revenda = Column(Float)
    coef_variacao_revenda = Column(Float)
    
    # Distribution columns (nullable text/float mixed in DB, mapped as Text here or Float if clean)
    # Keeping Text to avoid casting errors if " - " exists
    preco_medio_distribuicao = Column(Text)

class FuelHistoryRegion(Base):
    __tablename__ = "anp_history_regions"

    data_final = Column(DateTime, primary_key=True)
    regiao = Column(String, primary_key=True)
    produto = Column(String, primary_key=True)
    
    data_inicial = Column(DateTime)
    num_postos = Column(Integer)
    unidade = Column(String)
    preco_medio_revenda = Column(Float)
    desvio_padrao_revenda = Column(Float)
    preco_min_revenda = Column(Float)
    preco_max_revenda = Column(Float)
    coef_variacao_revenda = Column(Float)
    
    preco_medio_distribuicao = Column(Text)
    desvio_padrao_distribuicao = Column(Text)
    preco_min_distribuicao = Column(Text)
    preco_max_distribuicao = Column(Text)
    coef_variacao_distribuicao = Column(Text)

class FuelHistoryMunicipality(Base):
    __tablename__ = "anp_history_municipalities"

    data_final = Column(DateTime, primary_key=True)
    municipio = Column(String, primary_key=True)
    estado = Column(String, primary_key=True)
    produto = Column(String, primary_key=True)
    
    data_inicial = Column(DateTime)
    regiao = Column(String)
    num_postos = Column(Integer)
    unidade = Column(String)
    preco_medio_revenda = Column(Float)
    desvio_padrao_revenda = Column(Float)
    preco_min_revenda = Column(Float)
    preco_max_revenda = Column(Float)
    coef_variacao_revenda = Column(Float)
    
    preco_medio_distribuicao = Column(Text)
    desvio_padrao_distribuicao = Column(Text)
    preco_min_distribuicao = Column(Text)
    preco_max_distribuicao = Column(Text)
    coef_variacao_distribuicao = Column(Text)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="master", nullable=False)

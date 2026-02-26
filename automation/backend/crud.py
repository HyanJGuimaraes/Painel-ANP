from sqlalchemy.orm import Session
from . import models, schemas
from sqlalchemy import func
import datetime

def get_history(db: Session, limit: int = 1000, start_date: str = None):
    # Fetch all records, sorted by date desc
    # We need to process them in Python to pivot
    # Optimizing: Fetch only necessary columns
    query = db.query(models.FuelHistory).filter(
        models.FuelHistory.produto.in_(['ETANOL HIDRATADO', 'GASOLINA COMUM', 'OLEO DIESEL', 'GASOLINA'])
    )
    
    if start_date:
        # Assuming start_date is "YYYY-MM-DD"
        try:
            # Validate format
            datetime.datetime.strptime(start_date, "%Y-%m-%d")
            # Don't pass datetime object directly to SQLAlchemy to avoid PostgreSQL timestamp vs date cast error
            query = query.filter(models.FuelHistory.data_final >= start_date)
        except ValueError:
            pass # ignore invalid date
            
    results = query.order_by(models.FuelHistory.data_final.desc()).limit(limit * 2).all() 
    # Limit * 2 because we have 2 rows per record roughly
    
    # Python pivoting
    # Key: (estado, data_final) -> {etanol: float, gasolina: float}
    data_map = {}
    
    for row in results:
        # Format date: "DD/MM/YYYY - DD/MM/YYYY"
        d1 = row.data_inicial.strftime("%d/%m/%Y")
        d2 = row.data_final.strftime("%d/%m/%Y")
        datas = f"{d1} - {d2}"
        key = (row.estado, datas)
        
        if key not in data_map:
            data_map[key] = {"etanol": None, "gasolina": None}
            
        prod = row.produto.upper()
        if "ETANOL" in prod:
            data_map[key]["etanol"] = row.preco_medio_revenda
        elif "GASOLINA" in prod:
            data_map[key]["gasolina"] = row.preco_medio_revenda

    # Convert to FuelRecord list
    records = []
    for (estado, datas), values in data_map.items():
        e = values["etanol"]
        g = values["gasolina"]
        
        if e is not None and g is not None:
            dif = round(g - e, 2)
            par = round((e / g) * 100, 2)
            
            # B2B Metrics
            headroom = round((g * 0.70) - e, 2)
            
            signal = "NEUTRAL"
            if par < 66.0:
                signal = "STRONG" # Buy Aggressively
            elif par > 70.0:
                signal = "WEAK"   # Sell / Hold
                
            records.append(schemas.FuelRecord(
                estado=estado,
                datas=datas,
                etanol=e,
                gasolina=g,
                difNom=dif,
                paridade=par,
                headroom=headroom,
                demand_signal=signal,
                # TODO: We need to aggregate min/max from rows if available
                # For now, defaulting to None as pivot logic needs complex aggregation
                # to support min/max correctly across multiple rows if un-aggregated.
            ))
            
    return records

def get_last_update(db: Session):
    latest_valid = db.query(models.FuelHistoryMunicipality.data_final)\
        .filter(models.FuelHistoryMunicipality.data_final.like("20%"))\
        .order_by(models.FuelHistoryMunicipality.data_final.desc())\
        .first()
        
    count = db.query(models.FuelHistoryMunicipality).count()
    
    max_date = None
    if latest_valid:
        d = latest_valid[0]
        if isinstance(d, datetime.date):
            max_date = d
        elif isinstance(d, str):
            try:
                if " " in d:
                    max_date = datetime.datetime.strptime(d.split(" ")[0], "%Y-%m-%d").date()
                else:
                    max_date = datetime.datetime.strptime(d, "%Y-%m-%d").date()
            except:
                pass

    return schemas.LastUpdate(
        last_updated=str(max_date) if max_date else "N/A",
        total_records=count
    )

def get_municipalities(db: Session, product: str = None, state: str = None, region: str = None, start_date: str = None, end_date: str = None, limit: int = 50000):
    # 1. Determine Date Range
    query = db.query(models.FuelHistoryMunicipality)
    
    # Filter for valid 20XX dates first to avoid garbage
    query = query.filter(models.FuelHistoryMunicipality.data_final.like("20%"))

    if start_date:
        query = query.filter(models.FuelHistoryMunicipality.data_final >= start_date)
    else:
        # Default behavior: Last 5 weeks if no start_date provided
        latest_valid = db.query(models.FuelHistoryMunicipality.data_final)\
            .filter(models.FuelHistoryMunicipality.data_final.like("20%"))\
            .order_by(models.FuelHistoryMunicipality.data_final.desc())\
            .first()
        
        max_date = None
        if latest_valid:
            d = latest_valid[0]
            if isinstance(d, datetime.date):
                max_date = d
            elif isinstance(d, str):
                try:
                    if " " in d:
                        max_date = datetime.datetime.strptime(d.split(" ")[0], "%Y-%m-%d").date()
                    else:
                        max_date = datetime.datetime.strptime(d, "%Y-%m-%d").date()
                except:
                    pass
        
        if max_date:
            auto_start_date = max_date - datetime.timedelta(weeks=5)
            query = query.filter(models.FuelHistoryMunicipality.data_final >= auto_start_date.strftime("%Y-%m-%d"))

    if end_date:
        query = query.filter(models.FuelHistoryMunicipality.data_final <= end_date)
    
    # 2. Apply Filters
    if product:
        query = query.filter(models.FuelHistoryMunicipality.produto == product)
    if state:
        query = query.filter(models.FuelHistoryMunicipality.estado == state)
    if region:
        query = query.filter(models.FuelHistoryMunicipality.regiao == region)
        
    # Return raw list
    return query.order_by(models.FuelHistoryMunicipality.data_final.desc()).limit(limit).all()

def get_regions(db: Session, product: str = None, limit: int = 5000):
    # 1. Find the latest valid date efficiently (SQL Filter)
    latest_valid = db.query(models.FuelHistoryRegion.data_final)\
        .filter(models.FuelHistoryRegion.data_final.like("20%"))\
        .order_by(models.FuelHistoryRegion.data_final.desc())\
        .first()
    
    max_date = None
    if latest_valid:
        d = latest_valid[0]
        if isinstance(d, datetime.date):
            max_date = d
        elif isinstance(d, str):
            try:
                if " " in d:
                    max_date = datetime.datetime.strptime(d.split(" ")[0], "%Y-%m-%d").date()
                else:
                    max_date = datetime.datetime.strptime(d, "%Y-%m-%d").date()
            except:
                pass
                    
    if not max_date:
        return []
                    
    if not max_date:
        return []

    start_date = max_date - datetime.timedelta(weeks=5)
    
    query = db.query(models.FuelHistoryRegion).filter(
        models.FuelHistoryRegion.data_final >= start_date.strftime("%Y-%m-%d")
    )
    # Filter out garbage dates from results too
    query = query.filter(models.FuelHistoryRegion.data_final.like("20%"))
    
    if product:
        query = query.filter(models.FuelHistoryRegion.produto == product)
        
    return query.order_by(models.FuelHistoryRegion.data_final.desc()).limit(limit).all()

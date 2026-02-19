from backend import crud, database, models
from sqlalchemy.orm import Session
import os

# Setup DB
db = next(database.get_db())

print("Testing get_history logic...")
records = crud.get_history(db, limit=100)
print(f"Records returned: {len(records)}")

if len(records) == 0:
    print("Debug: Querying raw rows...")
    results = db.query(models.FuelHistory).filter(
        models.FuelHistory.produto.in_(['ETANOL HIDRATADO', 'GASOLINA COMUM'])
    ).order_by(models.FuelHistory.data_final.desc()).limit(10).all()
    
    print(f"Raw rows found: {len(results)}")
    for r in results:
        print(f" - {r.estado} | {r.data_final} | {r.produto} | {r.preco_medio_revenda}")
else:
    print(records[0])

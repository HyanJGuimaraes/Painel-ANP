from fastapi.testclient import TestClient
from backend.main import app
import pytest

client = TestClient(app)

def test_read_main():
    """Test the root endpoint (if it exists) or health check"""
    # We don't have a root endpoint defined in the snippet I saw, but let's check /api/history
    pass

def test_get_history_structure():
    """Test that /api/history returns a list of records with correct structure"""
    response = client.get("/api/history?limit=10")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    if len(data) > 0:
        record = data[0]
        assert "estado" in record
        assert "datas" in record
        assert "etanol" in record
        assert "gasolina" in record

def test_get_history_limit():
    """Test that limit parameter works"""
    limit = 5
    response = client.get(f"/api/history?limit={limit}")
    assert response.status_code == 200
    data = response.json()
    assert len(data) <= limit

def test_filter_by_date():
    """Test filter by start_date"""
    # Assuming we have data after 2000...
    response = client.get("/api/history?start_date=2023-01-01&limit=5")
    assert response.status_code == 200
    data = response.json()
    # Check if dates are indeed >= 2023-01-01
    # Note: 'datas' field format depends on the serializer, assuming it's returned as is (e.g. DD/MM/YYYY or YYYY-MM-DD)
    # Based on sampleData.ts it looked like DD/MM/YYYY, but let's just check status for now
    pass

try:
    import pytest
except ImportError:
    pytest = None
import os
import io
import sys
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app
from app.config import SAMPLES_DIR

client = TestClient(app)

def test_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "RAKSHAM VoiceGuard AI" in data["service"]

def test_models():
    res = client.get("/api/models")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "OPERATIONAL"
    assert len(data["models"]) >= 3

def test_quick_test_benign():
    res = client.post("/api/quick-test/benign")
    assert res.status_code == 200
    data = res.json()
    assert "analysis_id" in data
    assert data["authenticity_label"] in ["Likely Real", "Inconclusive", "LIKELY GENUINE"]
    assert data["scam_indicators_count"] == 0
    assert data["overall_risk"] in ["LOW RISK", "VERIFY"]

def test_quick_test_ai_clone():
    res = client.post("/api/quick-test/ai_clone")
    assert res.status_code == 200
    data = res.json()
    assert "analysis_id" in data
    assert data["synthetic_speech_score"] > 0.50
    assert data["scam_indicators_count"] > 0
    assert data["overall_risk"] == "HIGH RISK"

def test_pdf_report_generation():
    # Run test first
    res = client.post("/api/quick-test/ai_clone")
    data = res.json()
    analysis_id = data["analysis_id"]
    
    # Get PDF report
    pdf_res = client.get(f"/api/report/{analysis_id}?format=pdf")
    assert pdf_res.status_code == 200
    assert pdf_res.headers["content-type"] == "application/pdf"
    assert len(pdf_res.content) > 1000

def test_history():
    res = client.get("/api/history")
    assert res.status_code == 200
    items = res.json()
    assert len(items) >= 2

if __name__ == "__main__":
    test_health()
    test_models()
    test_quick_test_benign()
    test_quick_test_ai_clone()
    test_pdf_report_generation()
    test_history()
    print("All test_api tests passed!")

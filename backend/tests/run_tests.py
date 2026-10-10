import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from app.main import app

def run_all_tests():
    client = TestClient(app)
    
    print("Testing /api/health...")
    h = client.get("/api/health")
    assert h.status_code == 200
    print("Health response:", h.json())
    
    print("\nTesting /api/models...")
    m = client.get("/api/models")
    assert m.status_code == 200
    print("Models count:", len(m.json()["models"]))
    
    print("\nTesting /api/quick-test/benign...")
    b = client.post("/api/quick-test/benign")
    assert b.status_code == 200
    b_data = b.json()
    print(f"Benign Result: label={b_data['authenticity_label']}, score={b_data['synthetic_speech_score']}, risk={b_data['overall_risk']}, indicators={b_data['scam_indicators_count']}")
    
    print("\nTesting /api/quick-test/ai_clone...")
    c = client.post("/api/quick-test/ai_clone")
    assert c.status_code == 200
    c_data = c.json()
    print(f"AI Clone Result: label={c_data['authenticity_label']}, score={c_data['synthetic_speech_score']}, risk={c_data['overall_risk']}, indicators={c_data['scam_indicators_count']}")
    
    print("\nTesting /api/report PDF export...")
    pdf = client.get(f"/api/report/{c_data['analysis_id']}?format=pdf")
    assert pdf.status_code == 200
    assert len(pdf.content) > 500
    print(f"PDF generated: {len(pdf.content)} bytes")
    
    print("\nTesting /api/history...")
    hist = client.get("/api/history")
    assert hist.status_code == 200
    print(f"History items retrieved: {len(hist.json())}")
    
    print("\nALL BACKEND TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_all_tests()

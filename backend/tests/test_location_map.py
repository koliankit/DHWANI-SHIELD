import os
import sys
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app
from app.services.events_service import (
    haversine_distance, point_in_ring, point_in_polygon_geojson
)

client = TestClient(app)

def test_haversine_distance():
    # Distance between New Delhi (28.6139, 77.2090) and Mumbai (19.0760, 72.8777) is ~1148 km
    dist = haversine_distance(28.6139, 77.2090, 19.0760, 72.8777)
    assert 1140000 < dist < 1160000

    # Distance to itself must be 0
    assert haversine_distance(28.6139, 77.2090, 28.6139, 77.2090) == 0.0

def test_point_in_ring():
    # A box from lng 10 to 20, lat 10 to 20
    box_ring = [
        [10.0, 10.0],
        [20.0, 10.0],
        [20.0, 20.0],
        [10.0, 20.0],
        [10.0, 10.0]
    ]
    # Center (15, 15) is inside
    assert point_in_ring(15.0, 15.0, box_ring) is True
    # Point outside (25, 25)
    assert point_in_ring(25.0, 25.0, box_ring) is False

def test_point_in_polygon_geojson():
    polygon_geo = {
        "type": "Polygon",
        "coordinates": [
            [[0.0, 0.0], [10.0, 0.0], [10.0, 10.0], [0.0, 10.0], [0.0, 0.0]],
            # Hole from 2,2 to 4,4
            [[2.0, 2.0], [4.0, 2.0], [4.0, 4.0], [2.0, 4.0], [2.0, 2.0]]
        ]
    }
    # Point (5, 5) is inside polygon and not in hole
    assert point_in_polygon_geojson(5.0, 5.0, polygon_geo) is True
    # Point (3, 3) is inside the hole -> should be False
    assert point_in_polygon_geojson(3.0, 3.0, polygon_geo) is False
    # Point (15, 15) is outside -> False
    assert point_in_polygon_geojson(15.0, 15.0, polygon_geo) is False

def test_get_events_endpoint():
    res = client.get("/api/events")
    assert res.status_code == 200
    events = res.json()
    assert len(events) == 7
    
    # EVT-0001 must have sample coordinates
    evt1 = next((e for e in events if e["id"] == "EVT-0001"), None)
    assert evt1 is not None
    assert evt1["location_source"] == "SAMPLE"
    assert evt1["lat"] is not None
    assert evt1["lng"] is not None
    assert evt1["case_id"] == "CASE-DEMO-01"

    # EVT-0005 must have null coordinates and UNAVAILABLE source
    evt5 = next((e for e in events if e["id"] == "EVT-0005"), None)
    assert evt5 is not None
    assert evt5["location_source"] == "UNAVAILABLE"
    assert evt5["lat"] is None
    assert evt5["lng"] is None

def test_get_single_event_endpoint():
    res = client.get("/api/events/EVT-0002")
    assert res.status_code == 200
    evt2 = res.json()
    assert evt2["id"] == "EVT-0002"
    assert evt2["location_source"] == "ESTIMATED"
    assert evt2["lat"] == 19.0760
    assert evt2["lng"] == 72.8777
    assert evt2["verdict"] == "REVIEW REQUIRED"

    # Non-existent event returns 404
    res_not_found = client.get("/api/events/EVT-9999")
    assert res_not_found.status_code == 404

def test_geocode_proxy_endpoint():
    # Empty query validation
    res_empty = client.get("/api/geocode?q=")
    assert res_empty.status_code == 422

if __name__ == "__main__":
    print("Running test_haversine_distance...")
    test_haversine_distance()
    print("Running test_point_in_ring...")
    test_point_in_ring()
    print("Running test_point_in_polygon_geojson...")
    test_point_in_polygon_geojson()
    print("Running test_get_events_endpoint...")
    test_get_events_endpoint()
    print("Running test_get_single_event_endpoint...")
    test_get_single_event_endpoint()
    print("Running test_geocode_proxy_endpoint...")
    test_geocode_proxy_endpoint()
    print("\nALL LOCATION MAP TESTS PASSED SUCCESSFULLY!")


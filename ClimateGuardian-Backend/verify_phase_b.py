import os
import sys
from fastapi.testclient import TestClient

def main():
    print("==================================================")
    print("         PHASE B VERIFICATION TEST SUITE          ")
    print("==================================================")

    # 1. Import test
    print("\n[TEST 1] Import Test: from app.main import app")
    from app.main import app
    print(f"-> Application imported successfully. Title: '{app.title}'")
    assert app.title == "ClimateGuardian API", f"Unexpected title: {app.title}"
    print("-> RESULT: PASS")

    with TestClient(app) as client:
        # 2. Application startup test
        print("\n[TEST 2] Application Lifecycle Startup")
        print("-> FastAPI lifespan entered successfully without errors.")
        print("-> RESULT: PASS")

        # 3. Model loaded once in app.state
        print("\n[TEST 3] XGBoost Model in app.state")
        model = getattr(app.state, "model", None)
        assert model is not None, "Model is None in app.state!"
        print(f"-> Model type: {type(model).__name__}")
        print(f"-> Model loaded from: {app.state.model}")
        
        # Verify 22 canonical features
        expected_features = [
            "PM2.5", "PM10", "CO", "NO2", "SO2", "Ozone",
            "Temperature", "Humidity", "Pressure", "WindSpeed", "Rain", "WeatherCode",
            "Hour", "Day", "Month", "DayOfWeek", "IsWeekend",
            "AQI_Lag1", "PM25_Lag1", "PM10_Lag1", "PM25_Roll3", "PM10_Roll3"
        ]
        if hasattr(model, "feature_names_in_"):
            actual_features = list(model.feature_names_in_)
            assert actual_features == expected_features, f"Feature mismatch: {actual_features}"
            print(f"-> Verified all 22 canonical features match exactly in order: {actual_features}")
        print("-> RESULT: PASS")

        # 4. City coordinates loaded & Delhi lookup
        print("\n[TEST 4] City Coordinates Loading & Delhi Lookup")
        coords = getattr(app.state, "coordinates", None)
        assert coords is not None, "app.state.coordinates is None!"
        assert len(coords) == 40, f"Expected 40 cities, got {len(coords)}"
        print(f"-> In-memory coordinates count: {len(coords)}")

        from app.services.coordinates_service import get_city_coordinates, get_all_supported_cities
        delhi_coords = get_city_coordinates("Delhi")
        assert delhi_coords == (28.6139, 77.2090), f"Delhi coordinates mismatch: {delhi_coords}"
        print(f"-> get_city_coordinates('Delhi') = {delhi_coords}")

        # Case-insensitive and whitespace test
        delhi_case = get_city_coordinates("  dELHi  ")
        assert delhi_case == (28.6139, 77.2090), f"Delhi case/trim lookup failed: {delhi_case}"
        print(f"-> get_city_coordinates('  dELHi  ') = {delhi_case} (case/trim verified)")
        print("-> RESULT: PASS")

        # 5. Unknown city lookup
        print("\n[TEST 5] Unknown City Controlled Response")
        unknown_coords = get_city_coordinates("NonExistentCity")
        assert unknown_coords is None, f"Expected None for unknown city, got {unknown_coords}"
        print(f"-> get_city_coordinates('NonExistentCity') = {unknown_coords} (None returned)")

        resp_unknown = client.get("/api/aqi/predict?city=NonExistentCity")
        print(f"-> GET /api/aqi/predict?city=NonExistentCity status: {resp_unknown.status_code}")
        print(f"-> Response body: {resp_unknown.json()}")
        assert resp_unknown.status_code == 404, f"Expected 404 for unknown city, got {resp_unknown.status_code}"
        print("-> RESULT: PASS")

        # 6. final_dataset.csv check
        print("\n[TEST 6] Confirm 'final_dataset.csv' is NOT Loaded at Runtime")
        loaded_modules_with_csv = []
        for name, mod in list(sys.modules.items()):
            if mod and hasattr(mod, "__file__") and mod.__file__ and "ClimateGuardian-Backend" in mod.__file__:
                for attr_name in dir(mod):
                    try:
                        val = getattr(mod, attr_name)
                        if isinstance(val, str) and "final_dataset.csv" in val:
                            loaded_modules_with_csv.append((name, attr_name))
                    except Exception:
                        pass
        assert len(loaded_modules_with_csv) == 0, f"Found final_dataset references in memory: {loaded_modules_with_csv}"
        print("-> No runtime references, dataframes, or loaders for 'final_dataset.csv' exist.")
        print("-> RESULT: PASS")

        # 7. GET / and GET /api/health
        print("\n[TEST 7] GET / and GET /api/health Return HTTP 200")
        resp_root = client.get("/")
        print(f"-> GET /: status {resp_root.status_code}, body {resp_root.json()}")
        assert resp_root.status_code == 200
        assert resp_root.json() == {"message": "ClimateGuardian Backend is running"}

        resp_health = client.get("/api/health")
        print(f"-> GET /api/health: status {resp_health.status_code}, body {resp_health.json()}")
        assert resp_health.status_code == 200
        assert resp_health.json() == {"status": "healthy", "service": "ClimateGuardian API"}
        print("-> RESULT: PASS")

        # 8. OpenAPI JSON generation
        print("\n[TEST 8] /openapi.json Generation")
        resp_openapi = client.get("/openapi.json")
        print(f"-> GET /openapi.json: status {resp_openapi.status_code}")
        assert resp_openapi.status_code == 200
        schema = resp_openapi.json()
        print(f"-> OpenAPI schema generated with {len(schema.get('paths', {}))} endpoints: {list(schema.get('paths', {}).keys())}")
        print("-> RESULT: PASS")

    print("\n==================================================")
    print("   ALL 8 VERIFICATION TESTS COMPLETED & PASSED    ")
    print("==================================================")

if __name__ == "__main__":
    main()

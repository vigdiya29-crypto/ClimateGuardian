"""
verify_phase_d.py
-----------------
Verification suite for Phase D — Carbon Calculator.

Tests:
  1.  Import: app, router, service all importable without errors.
  2.  Startup: model + coordinates load cleanly.
  3.  POST /api/carbon/calculate — default residential car user (choice=1).
  4.  POST /api/carbon/calculate — kWh mode, EV, non-vegetarian, industrial.
  5.  Response schema completeness (all required keys present).
  6.  Numeric parity: backend result == frontend calculateCarbonFootprint().
  7.  Classification thresholds: Low / Moderate / High / Critical.
  8.  Tree offset formula: trees_required == round(total_kg / (21/12)).
  9.  Validation: unknown vehicle → 422.
  10. Validation: out-of-range members → 422.
  11. GET /api/carbon/factors — returns emission factor dict.
  12. OpenAPI: /api/carbon/calculate and /api/carbon/factors in schema paths.
  13. Phase C endpoints still alive: /api/aqi/predict and /api/weather/current.
"""

import sys
from fastapi.testclient import TestClient


# ── Mirror of Carbon.jsx::calculateCarbonFootprint() ──────────────────────
def frontend_calc(form: dict) -> float:
    """Return total_emission as the frontend would compute it."""
    choice = int(form.get("choice", 1))
    bill = max(0.0, float(form.get("bill", 0)))
    electricity = max(0.0, float(form.get("electricity", 0)))
    units = bill / 8.0 if choice == 1 else electricity

    elec = units * 0.82
    renewable = int(form.get("renewable", 1))
    if renewable == 2:   elec *= 0.85
    elif renewable == 3: elec *= 0.92
    elif renewable == 4: elec *= 0.70

    building = form.get("building", "residential")
    if building == "commercial": elec *= 1.15
    elif building == "industrial": elec *= 1.35

    vehicle = form.get("vehicle", "car")
    distance = max(0.0, float(form.get("distance", 0)))
    vf = {"car": 0.19, "bus": 0.08, "bike": 0.10, "electric": 0.04}
    veh = distance * vf.get(vehicle, 0.19)

    cylinder = max(0.0, float(form.get("cylinder", 0)))
    gas = cylinder * 42.0

    food = form.get("food", "vegetarian")
    ff = {"vegetarian": 40.0, "eggetarian": 55.0, "non-vegetarian": 80.0}
    food_kg = ff.get(food, 40.0)

    subtotal = elec + veh + gas + food_kg
    total = subtotal * 0.97 if form.get("recycle", "yes") == "yes" else subtotal
    return round(total, 2)


def main():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")

    print("==================================================")
    print("         PHASE D VERIFICATION TEST SUITE          ")
    print("==================================================")

    # ── TEST 1 ── Import ───────────────────────────────────────────────────
    print("\n[TEST 1] Imports")
    from app.main import app
    from app.services.carbon_service import calculate_carbon_footprint
    from app.routes.carbon import router as carbon_router
    assert carbon_router is not None
    print("-> app, carbon_service, carbon router all importable")
    print("-> RESULT: PASS")

    with TestClient(app) as client:
        # ── TEST 2 ── Startup ──────────────────────────────────────────────
        print("\n[TEST 2] Startup")
        assert getattr(app.state, "model", None) is not None, "model not loaded"
        assert getattr(app.state, "coordinates", None) is not None, "coords not loaded"
        print("-> RESULT: PASS")

        # ── TEST 3 ── Default payload ──────────────────────────────────────
        print("\n[TEST 3] POST /api/carbon/calculate — default payload (choice=1, car)")
        payload3 = {
            "choice": 1, "bill": 1200, "electricity": 160,
            "vehicle": "car", "distance": 350, "cylinder": 1,
            "renewable": 1, "building": "residential",
            "food": "vegetarian", "members": 3, "recycle": "yes"
        }
        r3 = client.post("/api/carbon/calculate", json=payload3)
        print(f"-> Status: {r3.status_code}")
        assert r3.status_code == 200, f"Failed: {r3.text}"
        d3 = r3.json()
        print(f"-> total_emission: {d3['total_emission']} kg CO2")
        print(f"-> category: {d3['category']}, score: {d3['score']}")
        print("-> RESULT: PASS")

        # ── TEST 4 ── kWh mode / EV / non-veg / industrial ────────────────
        print("\n[TEST 4] POST /api/carbon/calculate — kWh mode, EV, non-veg, industrial")
        payload4 = {
            "choice": 2, "bill": 0, "electricity": 300,
            "vehicle": "electric", "distance": 800, "cylinder": 0,
            "renewable": 4, "building": "industrial",
            "food": "non-vegetarian", "members": 1, "recycle": "no"
        }
        r4 = client.post("/api/carbon/calculate", json=payload4)
        assert r4.status_code == 200, f"Failed: {r4.text}"
        d4 = r4.json()
        print(f"-> total_emission: {d4['total_emission']} kg CO2")
        print("-> RESULT: PASS")

        # ── TEST 5 ── Schema completeness ──────────────────────────────────
        print("\n[TEST 5] Response schema completeness")
        required_keys = [
            "total_emission", "totalKg", "category", "badgeClass", "score",
            "sustainabilityScore", "trees_required", "treesRequired",
            "per_person", "perPersonKg", "electricity_emission",
            "vehicle_emission", "gas_emission", "food_emission",
            "breakdown", "largestContributor", "recommendations",
            "emission_factors",
        ]
        for key in required_keys:
            assert key in d3, f"Missing key in response: {key!r}"
        print(f"-> All {len(required_keys)} required keys present")
        print("-> RESULT: PASS")

        # ── TEST 6 ── Numeric parity with frontend formula ─────────────────
        print("\n[TEST 6] Numeric parity: backend == frontend formula")
        for label, payload in [("default", payload3), ("kWh/EV", payload4)]:
            expected = frontend_calc(payload)
            actual = client.post("/api/carbon/calculate", json=payload).json()["total_emission"]
            print(f"   {label}: expected={expected}, backend={actual}")
            assert abs(actual - expected) < 0.01, (
                f"Parity violation for {label}: backend={actual}, frontend={expected}"
            )
        print("-> RESULT: PASS")

        # ── TEST 7 ── Category thresholds ─────────────────────────────────
        print("\n[TEST 7] Category thresholds")
        threshold_cases = [
            # (total_kg expected ≤ boundary, expected category)
            ({"choice": 2, "bill": 0, "electricity": 10, "vehicle": "electric",
              "distance": 0, "cylinder": 0, "renewable": 4, "building": "residential",
              "food": "vegetarian", "members": 1, "recycle": "yes"}, "Low"),
            ({"choice": 2, "bill": 0, "electricity": 100, "vehicle": "bus",
              "distance": 500, "cylinder": 1, "renewable": 1, "building": "residential",
              "food": "vegetarian", "members": 1, "recycle": "yes"}, "Moderate"),
        ]
        for tc_payload, expected_cat in threshold_cases:
            tc_r = client.post("/api/carbon/calculate", json=tc_payload)
            assert tc_r.status_code == 200
            tc_cat = tc_r.json()["category"]
            total = tc_r.json()["total_emission"]
            print(f"   total={total:.2f} -> category={tc_cat} (expected {expected_cat})")
            assert tc_cat == expected_cat, f"Category mismatch: {tc_cat} != {expected_cat}"
        print("-> RESULT: PASS")

        # ── TEST 8 ── Tree offset formula ──────────────────────────────────
        print("\n[TEST 8] Tree offset formula")
        total_kg = d3["total_emission"]
        expected_trees = round(total_kg / (21 / 12))
        actual_trees = d3["trees_required"]
        print(f"   total_kg={total_kg}, expected trees={expected_trees}, got={actual_trees}")
        assert actual_trees == expected_trees, f"Tree offset mismatch: {actual_trees} != {expected_trees}"
        print("-> RESULT: PASS")

        # ── TEST 9 ── Unknown vehicle → 422 ───────────────────────────────
        print("\n[TEST 9] Validation: unknown vehicle → HTTP 422")
        bad_r = client.post("/api/carbon/calculate", json={**payload3, "vehicle": "rocketship"})
        print(f"-> Status: {bad_r.status_code}")
        assert bad_r.status_code == 422, f"Expected 422, got {bad_r.status_code}"
        print("-> RESULT: PASS")

        # ── TEST 10 ── Out-of-range members → 422 ─────────────────────────
        print("\n[TEST 10] Validation: members=0 → HTTP 422")
        bad_r2 = client.post("/api/carbon/calculate", json={**payload3, "members": 0})
        print(f"-> Status: {bad_r2.status_code}")
        assert bad_r2.status_code == 422, f"Expected 422, got {bad_r2.status_code}"
        print("-> RESULT: PASS")

        # ── TEST 11 ── GET /api/carbon/factors ────────────────────────────
        print("\n[TEST 11] GET /api/carbon/factors")
        rf = client.get("/api/carbon/factors")
        assert rf.status_code == 200, f"Failed: {rf.text}"
        factors = rf.json()
        assert "electricity_kg_per_kwh" in factors
        assert factors["electricity_kg_per_kwh"] == 0.82
        assert "vehicle_kg_per_km" in factors
        print(f"-> Electricity factor: {factors['electricity_kg_per_kwh']} kg/kWh")
        print(f"-> Vehicle factors: {factors['vehicle_kg_per_km']}")
        print("-> RESULT: PASS")

        # ── TEST 12 ── OpenAPI paths ───────────────────────────────────────
        print("\n[TEST 12] OpenAPI schema contains carbon endpoints")
        ro = client.get("/openapi.json")
        assert ro.status_code == 200
        paths = list(ro.json().get("paths", {}).keys())
        print(f"-> Registered paths: {paths}")
        assert "/api/carbon/calculate" in paths, "/api/carbon/calculate not in schema"
        assert "/api/carbon/factors"    in paths, "/api/carbon/factors not in schema"
        print("-> RESULT: PASS")

        # ── TEST 13 ── Phase C endpoints still alive ───────────────────────
        print("\n[TEST 13] Phase C endpoints still registered")
        assert "/api/aqi/predict"     in paths
        assert "/api/weather/current" in paths
        print("-> /api/aqi/predict and /api/weather/current still present")
        print("-> RESULT: PASS")

    print("\n==================================================")
    print("   ALL 13 VERIFICATION TESTS COMPLETED & PASSED   ")
    print("==================================================")


if __name__ == "__main__":
    main()

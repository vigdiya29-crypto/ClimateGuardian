"""
verify_phase_f.py
-----------------
Verification suite for Phase F — Insights & Atmospheric Chemistry Standards.

Tests:
  1.  Import: app, router, and insights service all importable without errors.
  2.  Lifespan startup: model + coordinates loaded.
  3.  GET /api/insights/aqi-categories — verifies all 6 CPCB NAQI standard brackets.
  4.  GET /api/insights/pollutants — verifies all 6 regulated ambient pollutants.
  5.  GET /api/insights/preventive-measures — health guidelines & respirators.
  6.  GET /api/insights/guidelines — statutory policies (GRAP, NCAP, BS-VI).
  7.  GET /api/insights — composite knowledge bundle.
  8.  OpenAPI schema — confirms all insights routes registered.
  9.  Prior Phase endpoints intact — confirms no regressions.
"""

import sys
from fastapi.testclient import TestClient


def main():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")

    print("==================================================")
    print("         PHASE F VERIFICATION TEST SUITE          ")
    print("==================================================")

    # ── TEST 1 ── Imports ───────────────────────────────────────────────────
    print("\n[TEST 1] Imports")
    from app.main import app
    from app.services.insights_service import (
        get_aqi_categories,
        get_pollutant_info,
        get_preventive_measures,
        get_government_guidelines,
        get_all_insights,
    )
    from app.routes.insights import router as insights_router

    assert insights_router is not None
    print("-> app, insights router, and insights service importable")
    print("-> RESULT: PASS")

    with TestClient(app) as client:
        # ── TEST 2 ── Startup ──────────────────────────────────────────────
        print("\n[TEST 2] Startup")
        assert getattr(app.state, "model", None) is not None, "Model not loaded"
        assert getattr(app.state, "coordinates", None) is not None, "Coords not loaded"
        print("-> RESULT: PASS")

        # ── TEST 3 ── GET /api/insights/aqi-categories ─────────────────────
        print("\n[TEST 3] GET /api/insights/aqi-categories")
        r_cat = client.get("/api/insights/aqi-categories")
        assert r_cat.status_code == 200, f"Failed: {r_cat.text}"
        cats = r_cat.json()
        assert isinstance(cats, list) and len(cats) == 6, f"Expected 6 categories, got {len(cats)}"
        expected_labels = ["Good", "Satisfactory", "Moderate", "Poor", "Very Poor", "Severe"]
        for i, c in enumerate(cats):
            assert c["label"] == expected_labels[i], f"Mismatch at {i}: {c['label']} != {expected_labels[i]}"
            assert "range" in c and "effect" in c and "color" in c
            print(f"   ✓ AQI {c['range']}: {c['label']} -> {c['effect']}")
        print("-> RESULT: PASS")

        # ── TEST 4 ── GET /api/insights/pollutants ─────────────────────────
        print("\n[TEST 4] GET /api/insights/pollutants")
        r_pol = client.get("/api/insights/pollutants")
        assert r_pol.status_code == 200, f"Failed: {r_pol.text}"
        pollutants = r_pol.json()
        assert isinstance(pollutants, list) and len(pollutants) == 6
        expected_keys = ["pm25", "pm10", "no2", "so2", "co", "ozone"]
        found_keys = [p["key"] for p in pollutants]
        assert found_keys == expected_keys, f"Pollutant keys mismatch: {found_keys} != {expected_keys}"
        for p in pollutants:
            assert "name" in p and "desc" in p and "safe_limit" in p and "unit" in p
            print(f"   ✓ {p['name']} ({p['key']}): safe limit={p['safe_limit']} {p['unit']}")
        print("-> RESULT: PASS")

        # ── TEST 5 ── GET /api/insights/preventive-measures ────────────────
        print("\n[TEST 5] GET /api/insights/preventive-measures")
        r_prev = client.get("/api/insights/preventive-measures")
        assert r_prev.status_code == 200, f"Failed: {r_prev.text}"
        prev_measures = r_prev.json()
        assert isinstance(prev_measures, list) and len(prev_measures) >= 4
        for pm in prev_measures:
            assert "id" in pm and "title" in pm and "desc" in pm
            print(f"   ✓ {pm['title']}")
        print("-> RESULT: PASS")

        # ── TEST 6 ── GET /api/insights/guidelines ─────────────────────────
        print("\n[TEST 6] GET /api/insights/guidelines")
        r_gov = client.get("/api/insights/guidelines")
        assert r_gov.status_code == 200, f"Failed: {r_gov.text}"
        guidelines = r_gov.json()
        assert isinstance(guidelines, list) and len(guidelines) >= 4
        for g in guidelines:
            assert "id" in g and "title" in g and "desc" in g
            print(f"   ✓ {g['title']}")
        print("-> RESULT: PASS")

        # ── TEST 7 ── GET /api/insights ────────────────────────────────────
        print("\n[TEST 7] GET /api/insights (Composite knowledge bundle)")
        r_all = client.get("/api/insights")
        assert r_all.status_code == 200, f"Failed: {r_all.text}"
        all_data = r_all.json()
        assert "aqi_categories" in all_data
        assert "pollutants" in all_data
        assert "preventive_measures" in all_data
        assert "government_guidelines" in all_data
        print(f"-> Composite bundle contains all 4 knowledge sections")
        print("-> RESULT: PASS")

        # ── TEST 8 ── OpenAPI schema paths ────────────────────────────────
        print("\n[TEST 8] OpenAPI schema contains all Phase F endpoints")
        r_open = client.get("/openapi.json")
        assert r_open.status_code == 200
        paths = r_open.json().get("paths", {})
        expected_paths = [
            "/api/insights",
            "/api/insights/aqi-categories",
            "/api/insights/pollutants",
            "/api/insights/preventive-measures",
            "/api/insights/guidelines",
        ]
        for ep in expected_paths:
            assert ep in paths, f"Path {ep} missing from OpenAPI schema!"
            print(f"   ✓ {ep}")
        print("-> RESULT: PASS")

        # ── TEST 9 ── Prior Phase endpoints intact ────────────────────────
        print("\n[TEST 9] Prior Phase endpoints intact")
        prior_endpoints = [
            "/api/aqi/predict",
            "/api/weather/current",
            "/api/carbon/calculate",
            "/api/carbon/factors",
            "/api/reports/metrics",
            "/api/alerts",
            "/api/news/environment",
            "/api/health",
        ]
        for ep in prior_endpoints:
            assert ep in paths, f"Prior endpoint {ep} missing!"
            print(f"   ✓ {ep}")
        print("-> RESULT: PASS")

    print("\n==================================================")
    print("   ALL 9 VERIFICATION TESTS COMPLETED & PASSED    ")
    print("==================================================")


if __name__ == "__main__":
    main()

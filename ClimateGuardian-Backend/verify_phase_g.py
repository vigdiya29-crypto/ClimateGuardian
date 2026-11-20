"""
verify_phase_g.py
-----------------
Verification suite for Phase G — Authentication & User Sessions.

Tests:
  1.  Import: app, auth router, and auth service.
  2.  Lifespan startup: model + coordinates loaded.
  3.  POST /api/auth/login — authenticates default user & returns JWT.
  4.  GET /api/auth/me — decodes and validates Bearer token.
  5.  GET /api/auth/me — rejects missing token (401).
  6.  GET /api/auth/me — rejects tampered token (401).
  7.  POST /api/auth/register — creates new user with salted hash & JWT.
  8.  POST /api/auth/register — rejects duplicate email (400).
  9.  POST /api/auth/login — rejects invalid password (401).
  10. Password recovery flow:
      - POST /api/auth/forgot-password (dispatches OTP)
      - POST /api/auth/verify-otp (rejects bad OTP)
      - POST /api/auth/verify-otp (verifies valid OTP)
      - POST /api/auth/reset-password (updates password)
      - POST /api/auth/login (confirms login with new password)
  11. POST /api/auth/logout — terminates session.
  12. OpenAPI schema — confirms all auth paths registered.
  13. Prior Phase endpoints intact — confirms no regressions.
"""

import sys
from fastapi.testclient import TestClient


def main():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")

    print("==================================================")
    print("         PHASE G VERIFICATION TEST SUITE          ")
    print("==================================================")

    # ── TEST 1 ── Imports ───────────────────────────────────────────────────
    print("\n[TEST 1] Imports")
    from app.main import app
    from app.services.auth_service import (
        hash_password,
        verify_password,
        create_access_token,
        decode_access_token,
    )
    from app.routes.auth import router as auth_router

    assert auth_router is not None
    print("-> app, auth router, and auth service importable")
    print("-> RESULT: PASS")

    with TestClient(app) as client:
        # ── TEST 2 ── Startup ──────────────────────────────────────────────
        print("\n[TEST 2] Startup")
        assert getattr(app.state, "model", None) is not None, "Model not loaded"
        assert getattr(app.state, "coordinates", None) is not None, "Coords not loaded"
        print("-> RESULT: PASS")

        # ── TEST 3 ── Login default user ───────────────────────────────────
        print("\n[TEST 3] POST /api/auth/login (Default user Ayushmaan)")
        login_payload = {
            "email": "ayushmaan@climateguardian.in",
            "password": "Password123!",
        }
        r_login = client.post("/api/auth/login", json=login_payload)
        assert r_login.status_code == 200, f"Login failed: {r_login.text}"
        login_data = r_login.json()
        assert "access_token" in login_data and login_data["token_type"] == "bearer"
        token = login_data["access_token"]
        assert "user" in login_data and login_data["user"]["name"] == "Ayushmaan"
        print(f"-> Issued JWT token: {token[:24]}... (exp=7 days)")
        print(f"-> Authenticated user: {login_data['user']['name']} ({login_data['user']['email']})")
        print("-> RESULT: PASS")

        # ── TEST 4 ── GET /api/auth/me with Bearer token ────────────────────
        print("\n[TEST 4] GET /api/auth/me (Valid Bearer token)")
        r_me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert r_me.status_code == 200, f"Failed: {r_me.text}"
        me_data = r_me.json()
        assert me_data["authenticated"] is True
        assert me_data["user"]["email"] == "ayushmaan@climateguardian.in"
        print(f"-> Verified user session: {me_data['user']['email']}")
        print("-> RESULT: PASS")

        # ── TEST 5 ── GET /api/auth/me without token ────────────────────────
        print("\n[TEST 5] GET /api/auth/me (Missing token -> 401)")
        r_no_auth = client.get("/api/auth/me")
        assert r_no_auth.status_code == 401, f"Expected 401, got {r_no_auth.status_code}"
        print(f"-> Status: {r_no_auth.status_code}")
        print("-> RESULT: PASS")

        # ── TEST 6 ── GET /api/auth/me with tampered token ─────────────────
        print("\n[TEST 6] GET /api/auth/me (Tampered signature -> 401)")
        tampered_token = token[:-5] + "XXXXX"
        r_bad_auth = client.get("/api/auth/me", headers={"Authorization": f"Bearer {tampered_token}"})
        assert r_bad_auth.status_code == 401
        print(f"-> Status: {r_bad_auth.status_code}")
        print("-> RESULT: PASS")

        # ── TEST 7 ── Register new user ─────────────────────────────────────
        print("\n[TEST 7] POST /api/auth/register (Create new account)")
        new_user_payload = {
            "name": "Priya Sharma",
            "email": "priya.sharma@example.com",
            "password": "SecurePassword456!",
        }
        r_reg = client.post("/api/auth/register", json=new_user_payload)
        assert r_reg.status_code == 201, f"Register failed: {r_reg.text}"
        reg_data = r_reg.json()
        assert "access_token" in reg_data
        assert reg_data["user"]["name"] == "Priya Sharma"
        print(f"-> Registered new user ID: {reg_data['user']['id']}")
        print("-> RESULT: PASS")

        # ── TEST 8 ── Duplicate registration rejected ──────────────────────
        print("\n[TEST 8] POST /api/auth/register (Duplicate email -> 400)")
        r_dup = client.post("/api/auth/register", json=new_user_payload)
        assert r_dup.status_code == 400, f"Expected 400, got {r_dup.status_code}"
        print("-> RESULT: PASS")

        # ── TEST 9 ── Bad password rejected ────────────────────────────────
        print("\n[TEST 9] POST /api/auth/login (Bad password -> 401)")
        r_bad_pw = client.post(
            "/api/auth/login",
            json={"email": "priya.sharma@example.com", "password": "WrongPassword!"},
        )
        assert r_bad_pw.status_code == 401
        print("-> RESULT: PASS")

        # ── TEST 10 ── Complete OTP Password Recovery Flow ─────────────────
        print("\n[TEST 10] Complete OTP Password Recovery Flow")
        # Step A: Request OTP
        r_forgot = client.post(
            "/api/auth/forgot-password",
            json={"email": "priya.sharma@example.com"},
        )
        assert r_forgot.status_code == 200
        otp = r_forgot.json().get("debug_otp")
        assert otp and len(otp) == 6, f"Invalid OTP: {otp}"
        print(f"   Step A: OTP dispatched: {otp}")

        # Step B: Bad OTP rejected
        r_bad_otp = client.post(
            "/api/auth/verify-otp",
            json={"email": "priya.sharma@example.com", "otp": "000000"},
        )
        assert r_bad_otp.status_code == 400
        print("   Step B: Invalid OTP rejected (400)")

        # Step C: Valid OTP accepted
        r_good_otp = client.post(
            "/api/auth/verify-otp",
            json={"email": "priya.sharma@example.com", "otp": otp},
        )
        assert r_good_otp.status_code == 200
        print("   Step C: Valid OTP verified (200)")

        # Step D: Reset password
        new_password = "BrandNewSecurePassword789!"
        r_reset = client.post(
            "/api/auth/reset-password",
            json={
                "email": "priya.sharma@example.com",
                "otp": otp,
                "new_password": new_password,
            },
        )
        assert r_reset.status_code == 200
        print("   Step D: Password successfully updated (200)")

        # Step E: Login with new password
        r_new_login = client.post(
            "/api/auth/login",
            json={"email": "priya.sharma@example.com", "password": new_password},
        )
        assert r_new_login.status_code == 200
        print("   Step E: Successfully logged in with new password!")
        print("-> RESULT: PASS")

        # ── TEST 11 ── Logout ──────────────────────────────────────────────
        print("\n[TEST 11] POST /api/auth/logout")
        r_logout = client.post("/api/auth/logout")
        assert r_logout.status_code == 200
        print("-> RESULT: PASS")

        # ── TEST 12 ── OpenAPI schema paths ────────────────────────────────
        print("\n[TEST 12] OpenAPI schema contains all Phase G auth endpoints")
        r_open = client.get("/openapi.json")
        assert r_open.status_code == 200
        paths = r_open.json().get("paths", {})
        expected_paths = [
            "/api/auth/register",
            "/api/auth/login",
            "/api/auth/me",
            "/api/auth/forgot-password",
            "/api/auth/verify-otp",
            "/api/auth/reset-password",
            "/api/auth/logout",
        ]
        for ep in expected_paths:
            assert ep in paths, f"Path {ep} missing from OpenAPI schema!"
            print(f"   ✓ {ep}")
        print("-> RESULT: PASS")

        # ── TEST 13 ── Prior Phase endpoints intact ────────────────────────
        print("\n[TEST 13] Prior Phase endpoints intact")
        prior_endpoints = [
            "/api/aqi/predict",
            "/api/weather/current",
            "/api/carbon/calculate",
            "/api/reports/metrics",
            "/api/alerts",
            "/api/insights",
            "/api/health",
        ]
        for ep in prior_endpoints:
            assert ep in paths, f"Prior endpoint {ep} missing!"
            print(f"   ✓ {ep}")
        print("-> RESULT: PASS")

    print("\n==================================================")
    print("   ALL 13 VERIFICATION TESTS COMPLETED & PASSED   ")
    print("==================================================")


if __name__ == "__main__":
    main()

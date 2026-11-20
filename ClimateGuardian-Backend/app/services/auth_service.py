"""
auth_service.py
---------------
Authentication service providing PBKDF2 password hashing, HS256 JWT token issuance,
OTP generation & verification for password recovery, and user session management.
Zero external library dependencies (uses Python standard library: hashlib, hmac, base64).
"""

import time
import json
import hmac
import base64
import secrets
import hashlib
from typing import Dict, Any, Optional
from app.config import get_settings

settings = get_settings()


# ── Password Hashing with Salt & PBKDF2 ─────────────────────────────────────
def hash_password(password: str) -> str:
    """Hashes a password using PBKDF2-HMAC-SHA256 with a unique 16-byte random salt."""
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100_000)
    return f"{salt}${key.hex()}"


def verify_password(plain_password: str, hashed_record: str) -> bool:
    """Verifies a plain password against the stored salt$hash record."""
    try:
        salt, key_hex = hashed_record.split("$", 1)
        expected_key = hashlib.pbkdf2_hmac("sha256", plain_password.encode("utf-8"), salt.encode("utf-8"), 100_000)
        return hmac.compare_digest(expected_key.hex(), key_hex)
    except Exception:
        return False


# ── HS256 Standard JWT Token Implementation ───────────────────────────────
def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode("utf-8").rstrip("=")


def _b64url_decode(s: str) -> bytes:
    padding = "=" * ((4 - len(s) % 4) % 4)
    return base64.urlsafe_b64decode(s + padding)


def create_access_token(payload: Dict[str, Any], expires_minutes: Optional[int] = None) -> str:
    """
    Creates an RFC-7519 compliant JSON Web Token (JWT) with HS256 signature.
    """
    secret = settings.JWT_SECRET.encode("utf-8")
    ttl = expires_minutes or settings.ACCESS_TOKEN_EXPIRE_MINUTES
    exp = int(time.time()) + (ttl * 60)

    token_payload = {**payload, "exp": exp, "iat": int(time.time())}

    header_bytes = json.dumps({"alg": "HS256", "typ": "JWT"}, separators=(",", ":")).encode("utf-8")
    payload_bytes = json.dumps(token_payload, separators=(",", ":")).encode("utf-8")

    head_b64 = _b64url_encode(header_bytes)
    payload_b64 = _b64url_encode(payload_bytes)

    signing_input = f"{head_b64}.{payload_b64}".encode("utf-8")
    signature = hmac.new(secret, signing_input, hashlib.sha256).digest()
    sig_b64 = _b64url_encode(signature)

    return f"{head_b64}.{payload_b64}.{sig_b64}"


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Validates the HS256 JWT signature and verifies token expiration.
    Returns decoded payload dictionary or None if invalid/expired.
    """
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None

        head_b64, payload_b64, sig_b64 = parts
        secret = settings.JWT_SECRET.encode("utf-8")
        signing_input = f"{head_b64}.{payload_b64}".encode("utf-8")

        expected_sig = hmac.new(secret, signing_input, hashlib.sha256).digest()
        provided_sig = _b64url_decode(sig_b64)

        if not hmac.compare_digest(expected_sig, provided_sig):
            return None

        payload = json.loads(_b64url_decode(payload_b64).decode("utf-8"))
        if payload.get("exp", 0) < time.time():
            return None

        return payload
    except Exception:
        return None


# ── In-Memory User Database & OTP Store ─────────────────────────────────────
# Initialized with the default user seen in Login.jsx
_USERS: Dict[str, Dict[str, Any]] = {
    "ayushmaan@climateguardian.in": {
        "id": "usr-1",
        "email": "ayushmaan@climateguardian.in",
        "name": "Ayushmaan",
        "password_hash": hash_password("Password123!"),
        "role": "user",
        "created_at": "2026-01-01T00:00:00Z",
    }
}

# Stores active OTPs: { email: {"otp": "123456", "expires_at": timestamp} }
_OTP_STORE: Dict[str, Dict[str, Any]] = {}


def register_user(name: str, email: str, password: str) -> Optional[Dict[str, Any]]:
    """Registers a new user; returns user dict or None if email is already taken."""
    norm_email = email.strip().lower()
    if norm_email in _USERS:
        return None

    user = {
        "id": f"usr-{secrets.token_hex(4)}",
        "email": norm_email,
        "name": name.strip(),
        "password_hash": hash_password(password),
        "role": "user",
        "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }
    _USERS[norm_email] = user
    return {k: v for k, v in user.items() if k != "password_hash"}


def authenticate_user(email: str, password: str) -> Optional[Dict[str, Any]]:
    """Validates user credentials; returns user dict on success, None on failure."""
    norm_email = email.strip().lower()
    user = _USERS.get(norm_email)
    if not user:
        return None

    if not verify_password(password, user["password_hash"]):
        return None

    return {k: v for k, v in user.items() if k != "password_hash"}


def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    """Looks up user by email address."""
    norm_email = email.strip().lower()
    user = _USERS.get(norm_email)
    if not user:
        return None
    return {k: v for k, v in user.items() if k != "password_hash"}


def request_password_reset_otp(email: str) -> Optional[str]:
    """
    Generates a 6-digit numeric OTP for password recovery valid for 10 minutes.
    Returns the OTP code (or None if email is unregistered).
    """
    norm_email = email.strip().lower()
    if norm_email not in _USERS:
        return None

    otp = f"{secrets.randbelow(1_000_000):06d}"
    _OTP_STORE[norm_email] = {
        "otp": otp,
        "expires_at": time.time() + 600,  # 10 minutes
    }
    return otp


def verify_password_reset_otp(email: str, otp_code: str) -> bool:
    """Verifies if the submitted 6-digit OTP is valid and unexpired."""
    norm_email = email.strip().lower()
    record = _OTP_STORE.get(norm_email)
    if not record:
        return False

    if time.time() > record["expires_at"]:
        _OTP_STORE.pop(norm_email, None)
        return False

    return hmac.compare_digest(record["otp"], otp_code.strip())


def reset_password(email: str, otp_code: str, new_password: str) -> bool:
    """Resets password if OTP is verified."""
    norm_email = email.strip().lower()
    if not verify_password_reset_otp(norm_email, otp_code):
        return False

    if norm_email in _USERS:
        _USERS[norm_email]["password_hash"] = hash_password(new_password)
        _OTP_STORE.pop(norm_email, None)
        return True

    return False

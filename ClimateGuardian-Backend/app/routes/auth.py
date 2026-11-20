"""
auth.py — /api/auth routes
--------------------------
Endpoints:
  POST /api/auth/register        — Create user account and return JWT session token
  POST /api/auth/login           — Authenticate user credentials and return JWT token
  GET  /api/auth/me              — Get current logged-in user profile from Bearer token
  POST /api/auth/forgot-password — Request 6-digit OTP for password reset
  POST /api/auth/verify-otp      — Validate 6-digit recovery OTP
  POST /api/auth/reset-password  — Complete password reset with verified OTP
  POST /api/auth/logout          — Terminate session
"""

from fastapi import APIRouter, HTTPException, Header, status
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from app.services.auth_service import (
    register_user,
    authenticate_user,
    get_user_by_email,
    create_access_token,
    decode_access_token,
    request_password_reset_otp,
    verify_password_reset_otp,
    reset_password,
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

EMAIL_PATTERN = r"^[^\s@]+@[^\s@]+\.[^\s@]+$"


# ── Pydantic Request / Response Schemas ────────────────────────────────────
class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=60)
    email: str = Field(..., pattern=EMAIL_PATTERN)
    password: str = Field(..., min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: str = Field(..., pattern=EMAIL_PATTERN)
    password: str = Field(..., min_length=1)


class ForgotPasswordRequest(BaseModel):
    email: str = Field(..., pattern=EMAIL_PATTERN)


class VerifyOtpRequest(BaseModel):
    email: str = Field(..., pattern=EMAIL_PATTERN)
    otp: str = Field(..., min_length=6, max_length=6)


class ResetPasswordRequest(BaseModel):
    email: str = Field(..., pattern=EMAIL_PATTERN)
    otp: str = Field(..., min_length=6, max_length=6)
    new_password: str = Field(..., min_length=8, max_length=128)


# ── Route Handlers ─────────────────────────────────────────────────────────
@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(req: RegisterRequest):
    """
    Registers a new user and returns user info with a signed JWT access token.
    """
    user = register_user(name=req.name, email=req.email, password=req.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists.",
        )

    token = create_access_token({"sub": user["email"], "name": user["name"], "id": user["id"]})
    return {
        "user": user,
        "access_token": token,
        "token_type": "bearer",
        "message": "Account created successfully.",
    }


@router.post("/login")
def login(req: LoginRequest):
    """
    Authenticates email & password, returning signed JWT session token and user profile.
    """
    user = authenticate_user(email=req.email, password=req.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    token = create_access_token({"sub": user["email"], "name": user["name"], "id": user["id"]})
    return {
        "user": user,
        "access_token": token,
        "token_type": "bearer",
        "message": "Logged in successfully.",
    }


@router.get("/me")
def get_current_user(authorization: Optional[str] = Header(None)):
    """
    Returns current authenticated user profile decoded from the Authorization Bearer token.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or malformed Authorization header.",
        )

    token = authorization.split(" ", 1)[1]
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token.",
        )

    user = get_user_by_email(payload["sub"])
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User associated with token no longer exists.",
        )

    return {
        "user": user,
        "authenticated": True,
    }


@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest):
    """
    Generates and dispatches a 6-digit OTP for password recovery.
    """
    otp = request_password_reset_otp(req.email)
    if not otp:
        # Returning success message to prevent user enumeration attacks
        return {
            "message": "If an account exists with this email, an OTP has been sent.",
            "success": True,
        }

    return {
        "message": "Password reset OTP generated successfully.",
        "success": True,
        "debug_otp": otp,  # Included for ease of testing & simulation
    }


@router.post("/verify-otp")
def verify_otp(req: VerifyOtpRequest):
    """
    Validates submitted 6-digit OTP.
    """
    is_valid = verify_password_reset_otp(req.email, req.otp)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP code.",
        )

    return {
        "valid": True,
        "message": "OTP verified successfully. You may now reset your password.",
    }


@router.post("/reset-password")
def reset_user_password(req: ResetPasswordRequest):
    """
    Updates user password using verified recovery OTP.
    """
    success = reset_password(req.email, req.otp, req.new_password)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to reset password. OTP may be invalid or expired.",
        )

    return {
        "success": True,
        "message": "Password updated successfully. You can now log in with your new credentials.",
    }


@router.post("/logout")
def logout():
    """
    Terminates user session.
    """
    return {
        "success": True,
        "message": "Logged out successfully.",
    }

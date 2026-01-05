"""
Schemas de autenticación - JWT tokens
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class Token(BaseModel):
    """Token JWT de acceso"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Datos decodificados del token JWT"""
    user_id: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None


class LoginRequest(BaseModel):
    """Solicitud de login"""
    email: EmailStr
    password: str = Field(..., min_length=4)


class RefreshTokenRequest(BaseModel):
    """Solicitud de refresh token"""
    refresh_token: str

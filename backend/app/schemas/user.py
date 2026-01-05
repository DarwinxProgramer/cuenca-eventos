"""
Schemas de Usuario - Validación de datos
"""
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional, List
from enum import Enum


class UserGender(str, Enum):
    HOMBRE = "Hombre"
    MUJER = "Mujer"
    OTRO = "Otro"


class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"


# ============================================
# CREAR USUARIO (registro)
# ============================================
class UserCreate(BaseModel):
    """Schema para registro de usuario"""
    name: str = Field(..., min_length=2, max_length=100, example="Darwin Chuqui")
    email: EmailStr = Field(..., example="darwin@ejemplo.com")
    password: str = Field(..., min_length=6, max_length=100, example="miPassword123")
    phone: Optional[str] = Field(None, example="0991234567")
    gender: Optional[UserGender] = None
    city: str = Field("Cuenca", example="Cuenca")
    preferences: List[str] = Field(default=[], example=["cultural", "gastronomico"])


# ============================================
# ACTUALIZAR USUARIO
# ============================================
class UserUpdate(BaseModel):
    """Schema para actualización de perfil"""
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    phone: Optional[str] = None
    age: Optional[int] = Field(None, ge=13, le=120)
    gender: Optional[UserGender] = None
    city: Optional[str] = None
    preferences: Optional[List[str]] = None


# ============================================
# RESPUESTA DE USUARIO (sin password)
# ============================================
class UserResponse(BaseModel):
    """Schema de respuesta de usuario"""
    id: str = Field(..., alias="_id")
    name: str
    email: EmailStr
    phone: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[UserGender] = None
    city: str
    member_since: datetime
    preferences: List[str] = []
    role: UserRole
    avatar_url: Optional[str] = None
    
    class Config:
        from_attributes = True
        populate_by_name = True


# ============================================
# USUARIO EN LISTA (resumido)
# ============================================
class UserSummary(BaseModel):
    """Resumen de usuario para listas"""
    id: str = Field(..., alias="_id")
    name: str
    email: EmailStr
    role: UserRole
    member_since: datetime
    
    class Config:
        from_attributes = True
        populate_by_name = True

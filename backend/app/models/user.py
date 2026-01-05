"""
Modelo User - Usuario de la aplicación
"""
from beanie import Document, PydanticObjectId
from pydantic import EmailStr, Field
from datetime import datetime
from typing import Optional, List
from enum import Enum


class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"


class UserGender(str, Enum):
    HOMBRE = "Hombre"
    MUJER = "Mujer"
    OTRO = "Otro"


class User(Document):
    """Modelo de usuario para MongoDB"""
    
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr = Field(..., unique=True)
    password_hash: str
    avatar_id: Optional[PydanticObjectId] = None
    phone: Optional[str] = None
    age: Optional[int] = Field(None, ge=13, le=120)
    gender: Optional[UserGender] = None
    city: str = "Cuenca"
    member_since: datetime = Field(default_factory=datetime.utcnow)
    preferences: List[str] = []
    role: UserRole = UserRole.USER
    refresh_token: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "users"
        indexes = [
            "email",
        ]
    
    class Config:
        json_schema_extra = {
            "example": {
                "name": "Darwin Chuqui",
                "email": "darwin@ejemplo.com",
                "city": "Cuenca",
                "preferences": ["cultural", "gastronomico"]
            }
        }

"""
Schemas comunes reutilizables
"""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class Coordinates(BaseModel):
    """Coordenadas geográficas"""
    lat: float = Field(..., ge=-90, le=90, description="Latitud")
    lng: float = Field(..., ge=-180, le=180, description="Longitud")


class MessageResponse(BaseModel):
    """Respuesta con mensaje simple"""
    message: str


class PaginatedResponse(BaseModel):
    """Respuesta paginada"""
    total: int
    page: int
    per_page: int
    pages: int

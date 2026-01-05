"""
Schemas de Ruta Turística - Validación de datos
"""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
from enum import Enum

from app.schemas.common import Coordinates


class RouteCategory(str, Enum):
    GASTRONOMICA = "gastronomica"
    CULTURAL = "cultural"
    RELIGIOSA = "religiosa"
    AVENTURA = "aventura"


class RouteDifficulty(str, Enum):
    FACIL = "facil"
    MODERADA = "moderada"
    DIFICIL = "dificil"


class RouteStop(BaseModel):
    """Parada en una ruta"""
    name: str = Field(..., example="Mercado 10 de Agosto")
    coordinates: Coordinates


# ============================================
# CREAR RUTA (admin)
# ============================================
class RouteCreate(BaseModel):
    """Schema para crear ruta turística"""
    name: str = Field(..., min_length=3, max_length=200, example="Ruta Gastronómica del Centro")
    description: str = Field(..., example="Descubre los sabores tradicionales de Cuenca")
    category: RouteCategory
    duration: str = Field(..., example="4 horas")
    distance: str = Field(..., example="2.5 km")
    difficulty: RouteDifficulty
    image_id: Optional[str] = None
    events: List[str] = []  # IDs de eventos relacionados
    stops: List[RouteStop] = []


# ============================================
# ACTUALIZAR RUTA (admin)
# ============================================
class RouteUpdate(BaseModel):
    """Schema para actualizar ruta"""
    name: Optional[str] = Field(None, min_length=3, max_length=200)
    description: Optional[str] = None
    category: Optional[RouteCategory] = None
    duration: Optional[str] = None
    distance: Optional[str] = None
    difficulty: Optional[RouteDifficulty] = None
    image_id: Optional[str] = None
    events: Optional[List[str]] = None
    stops: Optional[List[RouteStop]] = None


# ============================================
# RESPUESTA DE RUTA
# ============================================
class RouteResponse(BaseModel):
    """Schema de respuesta de ruta"""
    id: str = Field(..., alias="_id")
    name: str
    description: str
    category: RouteCategory
    duration: str
    distance: str
    difficulty: RouteDifficulty
    image_url: Optional[str] = None
    events: List[str] = []
    stops: List[RouteStop] = []
    created_at: datetime
    
    class Config:
        from_attributes = True
        populate_by_name = True

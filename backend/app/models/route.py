"""
Modelo Route - Ruta turística
"""
from beanie import Document, PydanticObjectId, Indexed
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
from enum import Enum

from app.models.event import GeoJSONPoint


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
    """Parada en una ruta turística"""
    name: str
    coordinates: GeoJSONPoint  # GeoJSON format


class Route(Document):
    """Modelo de ruta turística para MongoDB"""
    
    name: str = Field(..., min_length=3, max_length=200)
    description: str
    category: RouteCategory  # Índice en Settings
    duration: str
    distance: str
    difficulty: RouteDifficulty  # Índice en Settings
    image_id: Optional[PydanticObjectId] = None
    events: List[PydanticObjectId] = []
    stops: List[RouteStop] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "routes"
        indexes = [
            # Índice compuesto para filtros comunes
            [("category", 1), ("difficulty", 1)],
        ]


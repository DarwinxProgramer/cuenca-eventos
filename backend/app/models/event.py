"""
Modelo Event - Evento cultural
"""
from beanie import Document, PydanticObjectId, Indexed
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List, Literal
from enum import Enum
import pymongo


class EventCategory(str, Enum):
    CULTURAL = "cultural"
    RELIGIOSO = "religioso"
    GASTRONOMICO = "gastronomico"
    ARTISTICO = "artistico"
    TRADICIONAL = "tradicional"


class GeoJSONPoint(BaseModel):
    """Coordenadas en formato GeoJSON para índices geoespaciales"""
    type: Literal["Point"] = "Point"
    coordinates: List[float] = Field(..., min_length=2, max_length=2)  # [lng, lat]
    
    @classmethod
    def from_lat_lng(cls, lat: float, lng: float) -> "GeoJSONPoint":
        """Crear GeoJSONPoint desde latitud y longitud"""
        return cls(coordinates=[lng, lat])
    
    @property
    def lat(self) -> float:
        return self.coordinates[1]
    
    @property
    def lng(self) -> float:
        return self.coordinates[0]


class ItineraryItem(BaseModel):
    """Item del itinerario de un evento"""
    time: str
    activity: str


class Testimonial(BaseModel):
    """Testimonio de un usuario sobre un evento"""
    user_id: Optional[PydanticObjectId] = None
    name: str
    comment: str
    rating: int = Field(..., ge=1, le=5)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Event(Document):
    """Modelo de evento cultural para MongoDB"""
    
    title: str = Field(..., min_length=3, max_length=200)
    description: str = Field(..., min_length=10, max_length=500)
    long_description: Optional[str] = None
    date: datetime  # Índice definido en Settings
    time: str
    end_time: Optional[str] = None
    location: str
    address: Optional[str] = None
    coordinates: GeoJSONPoint  # GeoJSON para índice 2dsphere
    category: EventCategory  # Índice definido en Settings
    image_id: Optional[PydanticObjectId] = None
    gallery: List[PydanticObjectId] = []
    itinerary: List[ItineraryItem] = []
    closed_streets: List[str] = []
    testimonials: List[Testimonial] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "events"
        indexes = [
            # Índice geoespacial 2dsphere para búsquedas por ubicación
            [("coordinates", pymongo.GEOSPHERE)],
            # Índice compuesto para búsquedas comunes
            [("date", pymongo.ASCENDING), ("category", pymongo.ASCENDING)],
        ]
    
    class Config:
        json_schema_extra = {
            "example": {
                "title": "Festival de Luces 2025",
                "description": "El Centro Histórico se ilumina con instalaciones artísticas",
                "date": "2025-12-25T18:00:00",
                "time": "18:00",
                "location": "Centro Histórico",
                "coordinates": {"type": "Point", "coordinates": [-79.0045, -2.8974]},
                "category": "cultural"
            }
        }


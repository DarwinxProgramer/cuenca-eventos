"""
Schemas de Evento - Validación de datos
"""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
from enum import Enum

from app.schemas.common import Coordinates


class EventCategory(str, Enum):
    CULTURAL = "cultural"
    RELIGIOSO = "religioso"
    GASTRONOMICO = "gastronomico"
    ARTISTICO = "artistico"
    TRADICIONAL = "tradicional"


class ItineraryItem(BaseModel):
    """Item del itinerario"""
    time: str = Field(..., example="18:00")
    activity: str = Field(..., example="Encendido oficial")


class TestimonialCreate(BaseModel):
    """Crear testimonio"""
    comment: str = Field(..., min_length=10, max_length=500)
    rating: int = Field(..., ge=1, le=5)


class TestimonialResponse(BaseModel):
    """Respuesta de testimonio"""
    user_id: Optional[str] = None
    name: str
    comment: str
    rating: int
    created_at: datetime


# ============================================
# CREAR EVENTO (admin)
# ============================================
class EventCreate(BaseModel):
    """Schema para crear evento"""
    title: str = Field(..., min_length=3, max_length=200, example="Festival de Luces 2025")
    description: str = Field(..., min_length=10, max_length=500, example="El Centro Histórico se ilumina")
    long_description: Optional[str] = None
    date: datetime = Field(..., example="2025-12-25T18:00:00")
    time: str = Field(..., example="18:00")
    end_time: Optional[str] = Field(None, example="23:00")
    location: str = Field(..., example="Centro Histórico")
    address: Optional[str] = Field(None, example="Parque Calderón")
    coordinates: Coordinates
    category: EventCategory
    image_id: Optional[str] = None
    gallery: List[str] = []
    itinerary: List[ItineraryItem] = []
    closed_streets: List[str] = []


# ============================================
# ACTUALIZAR EVENTO (admin)
# ============================================
class EventUpdate(BaseModel):
    """Schema para actualizar evento"""
    title: Optional[str] = Field(None, min_length=3, max_length=200)
    description: Optional[str] = Field(None, min_length=10, max_length=500)
    long_description: Optional[str] = None
    date: Optional[datetime] = None
    time: Optional[str] = None
    end_time: Optional[str] = None
    location: Optional[str] = None
    address: Optional[str] = None
    coordinates: Optional[Coordinates] = None
    category: Optional[EventCategory] = None
    image_id: Optional[str] = None
    gallery: Optional[List[str]] = None
    itinerary: Optional[List[ItineraryItem]] = None
    closed_streets: Optional[List[str]] = None


# ============================================
# RESPUESTA DE EVENTO
# ============================================
class EventResponse(BaseModel):
    """Schema de respuesta de evento"""
    id: str = Field(..., alias="_id")
    title: str
    description: str
    long_description: Optional[str] = None
    date: datetime
    time: str
    end_time: Optional[str] = None
    location: str
    address: Optional[str] = None
    coordinates: Coordinates
    category: EventCategory
    image_url: Optional[str] = None
    gallery: List[str] = []
    itinerary: List[ItineraryItem] = []
    closed_streets: List[str] = []
    testimonials: List[TestimonialResponse] = []
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
        populate_by_name = True


# ============================================
# EVENTO EN LISTA (resumido)
# ============================================
class EventSummary(BaseModel):
    """Resumen de evento para listas"""
    id: str = Field(..., alias="_id")
    title: str
    description: str
    date: datetime
    time: str
    location: str
    coordinates: Coordinates
    category: EventCategory
    image_url: Optional[str] = None
    
    class Config:
        from_attributes = True
        populate_by_name = True

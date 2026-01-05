"""
Modelo Alert - Alerta de tránsito
"""
from beanie import Document, PydanticObjectId, Indexed
from pydantic import Field
from datetime import datetime
from typing import Optional
from enum import Enum
import pymongo

from app.models.event import GeoJSONPoint


class AlertType(str, Enum):
    CIERRE = "cierre"
    DESVIO = "desvio"
    CONGESTION = "congestion"


class Alert(Document):
    """Modelo de alerta de tránsito para MongoDB"""
    
    title: str = Field(..., min_length=3, max_length=200)
    description: str
    type: AlertType  # Índice en Settings
    location: str
    coordinates: GeoJSONPoint  # GeoJSON para índice 2dsphere
    start_date: datetime  # Índice en Settings
    end_date: datetime
    image_id: Optional[PydanticObjectId] = None
    is_active: bool = True  # Índice en Settings
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "alerts"
        indexes = [
            # Índice geoespacial 2dsphere para búsquedas por ubicación
            [("coordinates", pymongo.GEOSPHERE)],
            # Índice compuesto para alertas activas por fecha
            [("is_active", pymongo.ASCENDING), ("start_date", pymongo.ASCENDING)],
        ]


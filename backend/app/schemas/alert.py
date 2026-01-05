"""
Schemas de Alerta - Validación de datos
"""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from enum import Enum

from app.schemas.common import Coordinates


class AlertType(str, Enum):
    CIERRE = "cierre"
    DESVIO = "desvio"
    CONGESTION = "congestion"


# ============================================
# CREAR ALERTA (admin)
# ============================================
class AlertCreate(BaseModel):
    """Schema para crear alerta"""
    title: str = Field(..., min_length=3, max_length=200, example="Cierre vial por evento")
    description: str = Field(..., example="Cierre de calles en el Centro Histórico")
    type: AlertType
    location: str = Field(..., example="Benigno Malo y Simón Bolívar")
    coordinates: Coordinates
    start_date: datetime
    end_date: datetime
    image_id: Optional[str] = None


# ============================================
# ACTUALIZAR ALERTA (admin)
# ============================================
class AlertUpdate(BaseModel):
    """Schema para actualizar alerta"""
    title: Optional[str] = Field(None, min_length=3, max_length=200)
    description: Optional[str] = None
    type: Optional[AlertType] = None
    location: Optional[str] = None
    coordinates: Optional[Coordinates] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    image_id: Optional[str] = None
    is_active: Optional[bool] = None


# ============================================
# RESPUESTA DE ALERTA
# ============================================
class AlertResponse(BaseModel):
    """Schema de respuesta de alerta"""
    id: str = Field(..., alias="_id")
    title: str
    description: str
    type: AlertType
    location: str
    coordinates: Coordinates
    start_date: datetime
    end_date: datetime
    image_url: Optional[str] = None
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True
        populate_by_name = True

"""
Schemas de Agenda Personal - Validación de datos
"""
from pydantic import BaseModel, Field
from typing import List, Optional


# ============================================
# RESPUESTA DE AGENDA
# ============================================
class AgendaResponse(BaseModel):
    """Schema de respuesta de agenda personal"""
    id: str = Field(..., alias="_id")
    user_id: str
    attending: List[str] = []      # IDs de eventos
    interested: List[str] = []
    not_going: List[str] = []
    created_routes: List[str] = []
    completed_routes: List[str] = []
    
    class Config:
        from_attributes = True
        populate_by_name = True


# ============================================
# ACTUALIZAR AGENDA
# ============================================
class AgendaEventAction(BaseModel):
    """Acción sobre un evento en la agenda"""
    event_id: str = Field(..., description="ID del evento")

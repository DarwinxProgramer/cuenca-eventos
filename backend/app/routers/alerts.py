"""
Router de alertas - /alerts
CRUD para gestión de alertas de tránsito
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from datetime import datetime
from beanie import PydanticObjectId

from app.core.dependencies import require_admin
from app.core.cache import invalidate_alerts_cache
from app.models.user import User
from app.models.alert import Alert, AlertType
from app.models.event import GeoJSONPoint
from app.schemas.alert import AlertCreate, AlertUpdate, AlertResponse

router = APIRouter(prefix="/alerts")


# ============================================
# ENDPOINTS PÚBLICOS
# ============================================

@router.get("/", response_model=List[AlertResponse])
async def get_alerts(
    active_only: bool = Query(True, description="Solo alertas activas"),
    alert_type: Optional[AlertType] = Query(None, description="Filtrar por tipo")
):
    """
    Listar alertas activas
    """
    query = {}
    
    if active_only:
        now = datetime.utcnow()
        query["is_active"] = True
        query["start_date"] = {"$lte": now}
        query["end_date"] = {"$gte": now}
    
    if alert_type:
        query["type"] = alert_type
    
    if query:
        alerts = await Alert.find(query).sort("-created_at").to_list()
    else:
        alerts = await Alert.find_all().sort("-created_at").to_list()
    
    return [
        AlertResponse(
            _id=str(alert.id),
            title=alert.title,
            description=alert.description,
            type=alert.type,
            location=alert.location,
            coordinates={"lat": alert.coordinates.lat, "lng": alert.coordinates.lng},
            start_date=alert.start_date,
            end_date=alert.end_date,
            image_url=f"/api/v1/images/{alert.image_id}" if alert.image_id else None,
            is_active=alert.is_active,
            created_at=alert.created_at
        )
        for alert in alerts
    ]


@router.get("/{alert_id}", response_model=AlertResponse)
async def get_alert(alert_id: str):
    """
    Obtener detalle de una alerta
    """
    try:
        alert = await Alert.get(alert_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Alerta no encontrada")
    
    if not alert:
        raise HTTPException(status_code=404, detail="Alerta no encontrada")
    
    return AlertResponse(
        _id=str(alert.id),
        title=alert.title,
        description=alert.description,
        type=alert.type,
        location=alert.location,
        coordinates={"lat": alert.coordinates.lat, "lng": alert.coordinates.lng},
        start_date=alert.start_date,
        end_date=alert.end_date,
        image_url=f"/api/v1/images/{alert.image_id}" if alert.image_id else None,
        is_active=alert.is_active,
        created_at=alert.created_at
    )


# ============================================
# ENDPOINTS ADMIN
# ============================================

@router.post("/", response_model=AlertResponse, status_code=status.HTTP_201_CREATED)
async def create_alert(
    alert_data: AlertCreate,
    admin: User = Depends(require_admin)
):
    """
    Crear nueva alerta (solo admin)
    """
    coordinates = GeoJSONPoint.from_lat_lng(
        lat=alert_data.coordinates.lat,
        lng=alert_data.coordinates.lng
    )
    
    alert = Alert(
        title=alert_data.title,
        description=alert_data.description,
        type=alert_data.type,
        location=alert_data.location,
        coordinates=coordinates,
        start_date=alert_data.start_date,
        end_date=alert_data.end_date,
        image_id=PydanticObjectId(alert_data.image_id) if alert_data.image_id else None,
        is_active=True
    )
    
    await alert.insert()
    
    return AlertResponse(
        _id=str(alert.id),
        title=alert.title,
        description=alert.description,
        type=alert.type,
        location=alert.location,
        coordinates={"lat": alert.coordinates.lat, "lng": alert.coordinates.lng},
        start_date=alert.start_date,
        end_date=alert.end_date,
        image_url=f"/api/v1/images/{alert.image_id}" if alert.image_id else None,
        is_active=alert.is_active,
        created_at=alert.created_at
    )


@router.put("/{alert_id}", response_model=AlertResponse)
async def update_alert(
    alert_id: str,
    alert_data: AlertUpdate,
    admin: User = Depends(require_admin)
):
    """
    Actualizar alerta (solo admin)
    """
    try:
        alert = await Alert.get(alert_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Alerta no encontrada")
    
    if not alert:
        raise HTTPException(status_code=404, detail="Alerta no encontrada")
    
    update_data = alert_data.model_dump(exclude_unset=True)
    
    if "coordinates" in update_data and update_data["coordinates"]:
        update_data["coordinates"] = GeoJSONPoint.from_lat_lng(
            lat=update_data["coordinates"]["lat"],
            lng=update_data["coordinates"]["lng"]
        )
    
    if "image_id" in update_data and update_data["image_id"]:
        update_data["image_id"] = PydanticObjectId(update_data["image_id"])
    
    await alert.update({"$set": update_data})
    alert = await Alert.get(alert_id)
    
    return AlertResponse(
        _id=str(alert.id),
        title=alert.title,
        description=alert.description,
        type=alert.type,
        location=alert.location,
        coordinates={"lat": alert.coordinates.lat, "lng": alert.coordinates.lng},
        start_date=alert.start_date,
        end_date=alert.end_date,
        image_url=f"/api/v1/images/{alert.image_id}" if alert.image_id else None,
        is_active=alert.is_active,
        created_at=alert.created_at
    )


@router.delete("/{alert_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_alert(
    alert_id: str,
    admin: User = Depends(require_admin)
):
    """
    Eliminar alerta (solo admin)
    """
    try:
        alert = await Alert.get(alert_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Alerta no encontrada")
    
    if not alert:
        raise HTTPException(status_code=404, detail="Alerta no encontrada")
    
    await alert.delete()
    return None

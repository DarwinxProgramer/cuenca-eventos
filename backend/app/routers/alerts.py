"""
Router de alertas - /alerts
CRUD para gestión de alertas de tránsito con soporte Real-time (SSE)
"""
import json
import asyncio
import redis.asyncio as redis
from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import StreamingResponse
from typing import List, Optional
from datetime import datetime
from beanie import PydanticObjectId

from app.core.dependencies import require_admin
# from app.core.cache import invalidate_alerts_cache # Not used explicitly here but kept for architecture
from app.config import settings
from app.models.user import User
from app.models.alert import Alert, AlertType
from app.models.event import GeoJSONPoint
from app.schemas.alert import AlertCreate, AlertUpdate, AlertResponse

router = APIRouter(prefix="/alerts")

ALERTS_CHANNEL = "alerts_channel"

async def get_redis_client():
    """Obtener cliente de Redis para Pub/Sub"""
    return redis.from_url(settings.REDIS_URL, encoding="utf-8", decode_responses=True)

async def publish_alert_event(event_type: str, data: dict):
    """Publicar evento de alerta en Redis"""
    try:
        r = await get_redis_client()
        message = {
            "type": event_type,  # create, update, delete
            "data": data
        }
        await r.publish(ALERTS_CHANNEL, json.dumps(message))
        await r.close()
    except Exception as e:
        print(f"Error publishing to Redis: {e}")

# ============================================
# ENDPOINTS PÚBLICOS
# ============================================

@router.get("/stream")
async def stream_alerts():
    """
    Endpoint SSE (Server-Sent Events) para recibir alertas en tiempo real.
    El cliente debe conectarse usando EventSource.
    """
    async def event_generator():
        r = await get_redis_client()
        pubsub = r.pubsub()
        await pubsub.subscribe(ALERTS_CHANNEL)
        try:
            # Enviar mensaje de conexión establecida
            yield f"data: {json.dumps({'type': 'connected'})}\n\n"
            
            async for message in pubsub.listen():
                if message["type"] == "message":
                    yield f"data: {message['data']}\n\n"
        except asyncio.CancelledError:
            print("Client disconnected from SSE")
        finally:
            await pubsub.unsubscribe(ALERTS_CHANNEL)
            await r.close()

    return StreamingResponse(event_generator(), media_type="text/event-stream")

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
    
    response_data = AlertResponse(
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

    # Publish Real-time Event
    await publish_alert_event("create", json.loads(response_data.model_dump_json()))

    return response_data


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
    
    response_data = AlertResponse(
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
    
    # Publish Real-time Event
    await publish_alert_event("update", json.loads(response_data.model_dump_json()))

    return response_data


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

    # Publish Real-time Event
    await publish_alert_event("delete", {"_id": alert_id})

    return None

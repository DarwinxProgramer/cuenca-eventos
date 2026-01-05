"""
Router de agenda personal - /agenda
Gestión de la agenda del usuario
"""
from fastapi import APIRouter, Depends, HTTPException, status
from beanie import PydanticObjectId

from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.agenda import Agenda
from app.models.event import Event
from app.schemas.agenda import AgendaResponse

router = APIRouter(prefix="/agenda")


async def get_or_create_agenda(user_id: PydanticObjectId) -> Agenda:
    """Obtener o crear agenda del usuario"""
    agenda = await Agenda.find_one(Agenda.user_id == user_id)
    if not agenda:
        agenda = Agenda(user_id=user_id)
        await agenda.insert()
    return agenda


@router.get("/", response_model=AgendaResponse)
async def get_user_agenda(user: User = Depends(get_current_user)):
    """
    Obtener agenda del usuario autenticado
    """
    agenda = await get_or_create_agenda(user.id)
    
    return AgendaResponse(
        _id=str(agenda.id),
        user_id=str(agenda.user_id),
        attending=[str(e) for e in agenda.attending],
        interested=[str(e) for e in agenda.interested],
        not_going=[str(e) for e in agenda.not_going],
        created_routes=[str(r) for r in agenda.created_routes],
        completed_routes=[str(r) for r in agenda.completed_routes]
    )


@router.post("/attending/{event_id}", response_model=AgendaResponse)
async def mark_attending(
    event_id: str,
    user: User = Depends(get_current_user)
):
    """
    Marcar asistencia a un evento
    """
    # Verificar que el evento existe
    try:
        event = await Event.get(event_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    
    if not event:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    
    agenda = await get_or_create_agenda(user.id)
    event_oid = PydanticObjectId(event_id)
    
    # Quitar de otras listas si está
    if event_oid in agenda.interested:
        agenda.interested.remove(event_oid)
    if event_oid in agenda.not_going:
        agenda.not_going.remove(event_oid)
    
    # Agregar a attending si no está
    if event_oid not in agenda.attending:
        agenda.attending.append(event_oid)
    
    await agenda.save()
    
    return AgendaResponse(
        _id=str(agenda.id),
        user_id=str(agenda.user_id),
        attending=[str(e) for e in agenda.attending],
        interested=[str(e) for e in agenda.interested],
        not_going=[str(e) for e in agenda.not_going],
        created_routes=[str(r) for r in agenda.created_routes],
        completed_routes=[str(r) for r in agenda.completed_routes]
    )


@router.post("/interested/{event_id}", response_model=AgendaResponse)
async def mark_interested(
    event_id: str,
    user: User = Depends(get_current_user)
):
    """
    Marcar interés en un evento
    """
    try:
        event = await Event.get(event_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    
    if not event:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    
    agenda = await get_or_create_agenda(user.id)
    event_oid = PydanticObjectId(event_id)
    
    # Quitar de otras listas si está
    if event_oid in agenda.attending:
        agenda.attending.remove(event_oid)
    if event_oid in agenda.not_going:
        agenda.not_going.remove(event_oid)
    
    # Agregar a interested si no está
    if event_oid not in agenda.interested:
        agenda.interested.append(event_oid)
    
    await agenda.save()
    
    return AgendaResponse(
        _id=str(agenda.id),
        user_id=str(agenda.user_id),
        attending=[str(e) for e in agenda.attending],
        interested=[str(e) for e in agenda.interested],
        not_going=[str(e) for e in agenda.not_going],
        created_routes=[str(r) for r in agenda.created_routes],
        completed_routes=[str(r) for r in agenda.completed_routes]
    )


@router.post("/not-going/{event_id}", response_model=AgendaResponse)
async def mark_not_going(
    event_id: str,
    user: User = Depends(get_current_user)
):
    """
    Marcar que no asistirá al evento
    """
    try:
        event = await Event.get(event_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    
    if not event:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    
    agenda = await get_or_create_agenda(user.id)
    event_oid = PydanticObjectId(event_id)
    
    # Quitar de otras listas si está
    if event_oid in agenda.attending:
        agenda.attending.remove(event_oid)
    if event_oid in agenda.interested:
        agenda.interested.remove(event_oid)
    
    # Agregar a not_going si no está
    if event_oid not in agenda.not_going:
        agenda.not_going.append(event_oid)
    
    await agenda.save()
    
    return AgendaResponse(
        _id=str(agenda.id),
        user_id=str(agenda.user_id),
        attending=[str(e) for e in agenda.attending],
        interested=[str(e) for e in agenda.interested],
        not_going=[str(e) for e in agenda.not_going],
        created_routes=[str(r) for r in agenda.created_routes],
        completed_routes=[str(r) for r in agenda.completed_routes]
    )


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_from_agenda(
    event_id: str,
    user: User = Depends(get_current_user)
):
    """
    Quitar evento de la agenda (de todas las listas)
    """
    agenda = await get_or_create_agenda(user.id)
    event_oid = PydanticObjectId(event_id)
    
    # Quitar de todas las listas
    if event_oid in agenda.attending:
        agenda.attending.remove(event_oid)
    if event_oid in agenda.interested:
        agenda.interested.remove(event_oid)
    if event_oid in agenda.not_going:
        agenda.not_going.remove(event_oid)
    
    await agenda.save()
    return None

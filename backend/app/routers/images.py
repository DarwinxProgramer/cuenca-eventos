"""
Router de imágenes - /images
Subida y obtención de imágenes con GridFS
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import StreamingResponse
from motor.motor_asyncio import AsyncIOMotorGridFSBucket
from beanie import PydanticObjectId
from bson import ObjectId
import io

from app.core.dependencies import require_admin
from app.models.user import User
from app.database import get_database

router = APIRouter(prefix="/images")


def get_gridfs_bucket():
    """Obtener bucket de GridFS"""
    db = get_database()
    return AsyncIOMotorGridFSBucket(db)


@router.post("/upload")
async def upload_image(
    file: UploadFile = File(...),
    admin: User = Depends(require_admin)
):
    """
    Subir imagen a GridFS (solo admin)
    
    Retorna el ID de la imagen guardada
    """
    # Validar tipo de archivo
    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Tipo de archivo no permitido. Permitidos: {allowed_types}"
        )
    
    # Validar tamaño (max 5MB)
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El archivo es muy grande. Máximo 5MB"
        )
    
    # Guardar en GridFS
    bucket = get_gridfs_bucket()
    file_id = await bucket.upload_from_stream(
        file.filename,
        io.BytesIO(contents),
        metadata={
            "content_type": file.content_type,
            "uploaded_by": str(admin.id)
        }
    )
    
    return {
        "id": str(file_id),
        "filename": file.filename,
        "content_type": file.content_type,
        "size": len(contents),
        "url": f"/api/v1/images/{file_id}"
    }


@router.get("/{image_id}")
async def get_image(image_id: str):
    """
    Obtener imagen por ID (público)
    """
    try:
        oid = ObjectId(image_id)
    except Exception:
        raise HTTPException(status_code=400, detail="ID de imagen inválido")
    
    bucket = get_gridfs_bucket()
    
    try:
        # Obtener stream de la imagen
        grid_out = await bucket.open_download_stream(oid)
        
        # Leer contenido
        contents = await grid_out.read()
        
        # Obtener content type de metadata
        content_type = "image/jpeg"
        if grid_out.metadata and "content_type" in grid_out.metadata:
            content_type = grid_out.metadata["content_type"]
        
        return StreamingResponse(
            io.BytesIO(contents),
            media_type=content_type,
            headers={
                "Cache-Control": "public, max-age=31536000",  # 1 año
                "Content-Disposition": f"inline; filename={grid_out.filename}"
            }
        )
        
    except Exception:
        raise HTTPException(status_code=404, detail="Imagen no encontrada")


@router.delete("/{image_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_image(
    image_id: str,
    admin: User = Depends(require_admin)
):
    """
    Eliminar imagen (solo admin)
    """
    try:
        oid = ObjectId(image_id)
    except Exception:
        raise HTTPException(status_code=400, detail="ID de imagen inválido")
    
    bucket = get_gridfs_bucket()
    
    try:
        await bucket.delete(oid)
    except Exception:
        raise HTTPException(status_code=404, detail="Imagen no encontrada")
    
    return None

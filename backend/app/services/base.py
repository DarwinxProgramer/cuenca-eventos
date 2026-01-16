from typing import Generic, TypeVar, List, Optional, Type, Any, Union
from beanie import Document, PydanticObjectId
from pydantic import BaseModel
from fastapi import HTTPException, status

# Tipos genéricos
ModelType = TypeVar("ModelType", bound=Document)
CreateSchemaType = TypeVar("CreateSchemaType", bound=BaseModel)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=BaseModel)


class BaseService(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    """
    Clase base para servicios CRUD con Beanie.
    Implementa operaciones básicas: get, get_multi, create, update, delete.
    """

    def __init__(self, model: Type[ModelType]):
        """
        Constructor del servicio.
        
        Args:
            model: Clase del modelo de Beanie (Subclase de Document)
        """
        self.model = model

    async def get(self, id: Union[PydanticObjectId, str]) -> Optional[ModelType]:
        """Obtener un documento por ID"""
        return await self.model.get(id)

    async def get_all(self, skip: int = 0, limit: int = 100) -> List[ModelType]:
        """Obtener todos los documentos con paginación"""
        return await self.model.find_all().skip(skip).limit(limit).to_list()

    async def create(self, schema_in: CreateSchemaType) -> ModelType:
        """
        Crear un nuevo documento.
        
        Args:
            schema_in: Esquema Pydantic con datos de creación
        """
        # Convertir esquema a diccionario, excluyendo None
        obj_in_data = schema_in.model_dump(exclude_unset=True)
        
        # Crear instancia del modelo
        db_obj = self.model(**obj_in_data)
        
        # Guardar en BD
        await db_obj.insert()
        return db_obj

    async def update(
        self, 
        db_obj: ModelType, 
        schema_in: Union[UpdateSchemaType, dict[str, Any]]
    ) -> ModelType:
        """
        Actualizar un documento existente.
        
        Args:
            db_obj: Instancia actual del documento (traída de BD)
            schema_in: Datos a actualizar (Esquema Pydantic o Dict)
        """
        if isinstance(schema_in, dict):
            update_data = schema_in
        else:
            update_data = schema_in.model_dump(exclude_unset=True)

        # Actualizar campos
        await db_obj.set(update_data)
        return db_obj

    async def delete(self, id: Union[PydanticObjectId, str]) -> Optional[ModelType]:
        """Eliminar un documento por ID"""
        obj = await self.model.get(id)
        if obj:
            await obj.delete()
            return obj
        return None

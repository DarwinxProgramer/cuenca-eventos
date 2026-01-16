from typing import Optional
from fastapi import HTTPException, status
from datetime import datetime

from app.models.user import User, UserRole
from app.schemas.user import UserCreate
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token
from app.services.base import BaseService

class AuthService(BaseService[User, UserCreate, UserCreate]):
    """
    Servicio para lógica de negocio de Autenticación y Usuarios
    Centraliza validaciones y generación de tokens.
    """
    def __init__(self):
        super().__init__(User)

    async def register_user(self, user_data: UserCreate) -> User:
        """
        Registrar un nuevo usuario con validaciones de negocio.
        """
        # Validación 1: Email único
        existing_user = await self.model.find_one(self.model.email == user_data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El email ya está registrado"
            )
        
        # Creación de usuario
        user = User(
            name=user_data.name,
            email=user_data.email,
            password_hash=hash_password(user_data.password),
            phone=user_data.phone,
            gender=user_data.gender,
            city=user_data.city,
            preferences=user_data.preferences,
            role=UserRole.USER,
            member_since=datetime.utcnow()
        )
        
        await user.insert()
        return user

    async def authenticate_user(self, email: str, password: str) -> dict:
        """
        Autenticar usuario y generar tokens.
        """
        user = await self.model.find_one(self.model.email == email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email o contraseña incorrectos",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        if not verify_password(password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email o contraseña incorrectos",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
        return await self._generate_tokens(user)

    async def refresh_access_token(self, refresh_token: str) -> dict:
        """
        Refrescar tokens validando el refresh token previo.
        """
        # Nota: verify_token debería moverse a una capa de utilidad pura si no lo está
        # Aquí asumimos que la validación del JWT ya ocurrió en el router o se hace aquí
        # Por simplicidad delegaremos la verificación de JWT al router y aquí validamos logica de negocio
        # Pero lo ideal es que el servicio reciba el user_id ya decodificado o el token crudo
        pass 
        # Esta lógica requiere mover verify_token de core/dependencies o security
        # Para esta iteración, mantendremos la lógica simple de generación en el router
        # y migraremos solo register/login que tienen más lógica de negocio.

    async def _generate_tokens(self, user: User) -> dict:
        """Generar par de tokens y guardar refresh token"""
        token_data = {
            "sub": str(user.id),
            "email": user.email,
            "role": user.role.value
        }
        
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)
        
        user.refresh_token = refresh_token
        await user.save()
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer"
        }

auth_service = AuthService()

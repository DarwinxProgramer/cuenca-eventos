"""
Script de migración de datos mock a MongoDB
Migra eventos, alertas, rutas y usuarios desde el frontend TypeScript
Convierte fechas de 2025 a 2026
"""
import asyncio
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
import bcrypt

# Configuración
MONGODB_URL = "mongodb://mongodb:27017"
DATABASE_NAME = "cuenca_eventos"


def hash_password(password: str) -> str:
    """Hash password usando bcrypt directamente"""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')


def convert_date_2025_to_2026(date_str: str) -> str:
    """Convierte fechas de 2025 a 2026"""
    return date_str.replace("2025", "2026").replace("2024", "2026")


# ============================================
# DATOS MOCK (extraídos del frontend)
# ============================================

MOCK_EVENTS = [
    {
        "title": "Festival de Luces 2026",
        "description": "El Centro Histórico de Cuenca se ilumina con más de 50 instalaciones lumínicas artísticas.",
        "long_description": "El Festival de Luces transforma el Centro Histórico de Cuenca en un escenario mágico. Durante tres noches consecutivas, más de 50 instalaciones lumínicas artísticas iluminan las calles empedradas, plazas y edificios patrimoniales. Artistas locales e internacionales presentan sus obras de luz, creando un recorrido inolvidable que celebra la luz, el arte y la tradición cuencana.",
        "date": "2026-12-25T18:00:00",
        "time": "18:00",
        "end_time": "23:00",
        "location": "Centro Histórico",
        "address": "Parque Calderón y calles aledañas",
        "coordinates": {"type": "Point", "coordinates": [-79.0045, -2.8974]},
        "category": "cultural",
        "itinerary": [
            {"time": "18:00", "activity": "Encendido oficial en Parque Calderón"},
            {"time": "19:00", "activity": "Recorrido guiado por instalaciones"},
            {"time": "20:30", "activity": "Show de mapping en la Catedral"},
            {"time": "22:00", "activity": "Concierto de cierre"},
        ],
        "closed_streets": ["Benigno Malo", "Simón Bolívar", "Luis Cordero"],
        "testimonials": [
            {"name": "María García", "comment": "¡Espectacular! Las luces en la Catedral fueron increíbles.", "rating": 5},
            {"name": "Carlos Andrade", "comment": "Una experiencia mágica para toda la familia.", "rating": 5},
        ],
    },
    {
        "title": "Corpus Christi - Fiesta del Septenario",
        "description": "Siete días de festividades religiosas y culturales con procesiones y dulces típicos.",
        "long_description": "El Corpus Christi en Cuenca es una celebración única que combina la fe católica con tradiciones ancestrales. Durante siete días, la ciudad se llena de procesiones solemnes, fuegos artificiales espectaculares, y los famosos dulces típicos que se venden en el Parque Calderón.",
        "date": "2026-06-19T08:00:00",
        "time": "08:00",
        "end_time": "22:00",
        "location": "Catedral de la Inmaculada",
        "address": "Parque Calderón, Centro Histórico",
        "coordinates": {"type": "Point", "coordinates": [-79.0042, -2.8973]},
        "category": "religioso",
        "itinerary": [
            {"time": "08:00", "activity": "Misa solemne en la Catedral"},
            {"time": "11:00", "activity": "Procesión por las calles del centro"},
            {"time": "14:00", "activity": "Feria de dulces típicos"},
            {"time": "19:00", "activity": "Castillos y fuegos artificiales"},
        ],
        "closed_streets": ["Sucre", "Benigno Malo", "Presidente Córdova"],
        "testimonials": [
            {"name": "Rosa Calle", "comment": "Los dulces de Corpus son los mejores del año.", "rating": 5},
            {"name": "Pedro Vélez", "comment": "La procesión es muy emotiva y tradicional.", "rating": 4},
        ],
    },
    {
        "title": "Expo Arte Contemporáneo",
        "description": "Exposición con obras de artistas locales e internacionales en el Museo de Arte Moderno.",
        "long_description": "El Museo de Arte Moderno de Cuenca presenta su exposición anual de arte contemporáneo, reuniendo obras de más de 30 artistas locales e internacionales.",
        "date": "2026-01-15T09:00:00",
        "time": "09:00",
        "end_time": "17:00",
        "location": "Museo de Arte Moderno",
        "address": "Calle Sucre 15-27 y Coronel Tálbot",
        "coordinates": {"type": "Point", "coordinates": [-79.0078, -2.8992]},
        "category": "artistico",
        "itinerary": [
            {"time": "09:00", "activity": "Apertura de puertas"},
            {"time": "11:00", "activity": "Visita guiada gratuita"},
            {"time": "15:00", "activity": "Charla con artistas"},
        ],
        "closed_streets": [],
        "testimonials": [
            {"name": "Ana Mora", "comment": "Arte de primer nivel en nuestra ciudad.", "rating": 5},
        ],
    },
    {
        "title": "Pase del Niño Viajero",
        "description": "El desfile navideño más grande y colorido del Ecuador.",
        "long_description": "El Pase del Niño Viajero es la procesión navideña más importante del Ecuador y una de las más grandes de Latinoamérica.",
        "date": "2026-12-24T10:00:00",
        "time": "10:00",
        "end_time": "18:00",
        "location": "Calles del Centro",
        "address": "Desde San Sebastián hasta el Parque Calderón",
        "coordinates": {"type": "Point", "coordinates": [-79.0055, -2.8985]},
        "category": "tradicional",
        "itinerary": [
            {"time": "10:00", "activity": "Concentración en San Sebastián"},
            {"time": "11:00", "activity": "Inicio del desfile"},
            {"time": "14:00", "activity": "Paso por el Parque Calderón"},
            {"time": "17:00", "activity": "Llegada a la Catedral"},
        ],
        "closed_streets": ["Simón Bolívar", "Gran Colombia", "Mariscal Sucre", "Presidente Córdova"],
        "testimonials": [
            {"name": "Miguel Zhingri", "comment": "Tradición cuencana que emociona hasta las lágrimas.", "rating": 5},
            {"name": "Lucía Parra", "comment": "Los carros alegóricos son impresionantes cada año.", "rating": 5},
        ],
    },
    {
        "title": "Carnaval Cuencano 2026",
        "description": "Celebración del carnaval con desfiles, música y tradiciones en toda la ciudad.",
        "long_description": "El Carnaval en Cuenca combina las tradiciones andinas con la alegría de esta festividad.",
        "date": "2026-03-01T09:00:00",
        "time": "09:00",
        "end_time": "20:00",
        "location": "Ciudad de Cuenca",
        "address": "Múltiples ubicaciones",
        "coordinates": {"type": "Point", "coordinates": [-79.0128, -2.9055]},
        "category": "tradicional",
        "itinerary": [
            {"time": "09:00", "activity": "Desfile de comparsas"},
            {"time": "12:00", "activity": "Festival gastronómico"},
            {"time": "16:00", "activity": "Concurso de disfraces"},
            {"time": "19:00", "activity": "Concierto de cierre"},
        ],
        "closed_streets": ["Av. Solano", "Av. 12 de Abril"],
        "testimonials": [
            {"name": "Jorge Sánchez", "comment": "¡El mejor carnaval de la sierra!", "rating": 4},
        ],
    },
    {
        "title": "Desfile de la Cuencanidad",
        "description": "Desfile cívico celebrando la fundación de Cuenca con bandas y delegaciones.",
        "long_description": "El 12 de abril, Cuenca celebra su fundación española con un gran desfile cívico.",
        "date": "2026-04-12T09:00:00",
        "time": "09:00",
        "end_time": "13:00",
        "location": "Av. Solano - Centro",
        "address": "Desde Universidad de Cuenca hasta Parque Calderón",
        "coordinates": {"type": "Point", "coordinates": [-79.0089, -2.9012]},
        "category": "cultural",
        "itinerary": [
            {"time": "09:00", "activity": "Concentración en Universidad de Cuenca"},
            {"time": "10:00", "activity": "Inicio del desfile"},
            {"time": "12:00", "activity": "Acto cívico en Parque Calderón"},
        ],
        "closed_streets": ["Av. Solano", "Calle Larga", "Benigno Malo"],
        "testimonials": [
            {"name": "Patricia Mora", "comment": "Orgullo cuencano en cada banda que pasa.", "rating": 5},
        ],
    },
    {
        "title": "Feria de Artesanías",
        "description": "Exposición y venta de artesanías tradicionales cuencanas y del Azuay.",
        "long_description": "La Feria de Artesanías reúne a los mejores artesanos de Cuenca y la provincia del Azuay.",
        "date": "2026-11-03T09:00:00",
        "time": "09:00",
        "end_time": "18:00",
        "location": "Plaza de San Francisco",
        "address": "Presidente Córdova y Padre Aguirre",
        "coordinates": {"type": "Point", "coordinates": [-79.0035, -2.8945]},
        "category": "cultural",
        "itinerary": [
            {"time": "09:00", "activity": "Apertura de stands"},
            {"time": "11:00", "activity": "Demostración de tejido de paja toquilla"},
            {"time": "14:00", "activity": "Taller de cerámica"},
            {"time": "16:00", "activity": "Música tradicional en vivo"},
        ],
        "closed_streets": ["Presidente Córdova (tramo)"],
        "testimonials": [
            {"name": "Sandra Crespo", "comment": "Compré un hermoso sombrero de paja toquilla.", "rating": 5},
        ],
    },
]

MOCK_ALERTS = [
    {
        "title": "Cierre vial por Festival de Luces",
        "description": "Cierre de calles en el Centro Histórico por instalación de equipos lumínicos. Use rutas alternativas.",
        "type": "cierre",
        "location": "Benigno Malo y Simón Bolívar",
        "coordinates": {"type": "Point", "coordinates": [-79.0045, -2.8974]},
        "start_date": "2026-12-24T00:00:00",
        "end_date": "2026-12-26T23:59:59",
        "is_active": True,
    },
    {
        "title": "Desvío por Pase del Niño",
        "description": "Desvío obligatorio para vehículos en el centro. Siga las indicaciones de tránsito.",
        "type": "desvio",
        "location": "Gran Colombia y Tarqui",
        "coordinates": {"type": "Point", "coordinates": [-79.0060, -2.8990]},
        "start_date": "2026-12-24T00:00:00",
        "end_date": "2026-12-24T23:59:59",
        "is_active": True,
    },
    {
        "title": "Zona de congestión - Corpus Christi",
        "description": "Alta afluencia de vehículos y peatones en zona del Parque Calderón.",
        "type": "congestion",
        "location": "Parque Calderón",
        "coordinates": {"type": "Point", "coordinates": [-79.0042, -2.8973]},
        "start_date": "2026-06-19T00:00:00",
        "end_date": "2026-06-26T23:59:59",
        "is_active": True,
    },
    {
        "title": "Cierre Presidente Córdova",
        "description": "Calle cerrada por mantenimiento y preparación para evento cultural.",
        "type": "cierre",
        "location": "Presidente Córdova y Tarqui",
        "coordinates": {"type": "Point", "coordinates": [-79.0052, -2.8960]},
        "start_date": "2026-12-20T00:00:00",
        "end_date": "2026-12-22T23:59:59",
        "is_active": True,
    },
]

MOCK_ROUTES = [
    {
        "name": "Ruta Gastronómica del Centro",
        "description": "Descubre los sabores tradicionales de Cuenca visitando los mejores restaurantes y mercados del centro histórico.",
        "category": "gastronomica",
        "duration": "4 horas",
        "distance": "2.5 km",
        "difficulty": "facil",
        "stops": [
            {"name": "Mercado 10 de Agosto", "coordinates": {"type": "Point", "coordinates": [-79.0008, -2.8952]}},
            {"name": "Restaurante Raymipampa", "coordinates": {"type": "Point", "coordinates": [-79.0040, -2.8975]}},
            {"name": "Café Austria", "coordinates": {"type": "Point", "coordinates": [-79.0048, -2.8968]}},
            {"name": "Mercado 9 de Octubre", "coordinates": {"type": "Point", "coordinates": [-79.0088, -2.8995]}},
        ],
    },
    {
        "name": "Ruta de las Iglesias",
        "description": "Recorre las iglesias más emblemáticas de Cuenca, desde la majestuosa Catedral Nueva hasta las pequeñas capillas coloniales.",
        "category": "religiosa",
        "duration": "3 horas",
        "distance": "3 km",
        "difficulty": "facil",
        "stops": [
            {"name": "Catedral de la Inmaculada", "coordinates": {"type": "Point", "coordinates": [-79.0042, -2.8973]}},
            {"name": "Catedral Vieja", "coordinates": {"type": "Point", "coordinates": [-79.0050, -2.8970]}},
            {"name": "Iglesia de San Sebastián", "coordinates": {"type": "Point", "coordinates": [-79.0095, -2.8985]}},
            {"name": "Iglesia de Santo Domingo", "coordinates": {"type": "Point", "coordinates": [-79.0068, -2.8955]}},
            {"name": "Iglesia de Todos Santos", "coordinates": {"type": "Point", "coordinates": [-79.0025, -2.9015]}},
        ],
    },
    {
        "name": "Ruta Turi - Mirador",
        "description": "Sube al mirador de Turi para disfrutar de la mejor vista panorámica de Cuenca.",
        "category": "aventura",
        "duration": "2 horas",
        "distance": "5 km",
        "difficulty": "moderada",
        "stops": [
            {"name": "Inicio en El Vergel", "coordinates": {"type": "Point", "coordinates": [-79.0100, -2.9080]}},
            {"name": "Mirador de Turi", "coordinates": {"type": "Point", "coordinates": [-79.0050, -2.9180]}},
            {"name": "Iglesia de Turi", "coordinates": {"type": "Point", "coordinates": [-79.0055, -2.9175]}},
            {"name": "Columpio de Turi", "coordinates": {"type": "Point", "coordinates": [-79.0048, -2.9185]}},
        ],
    },
]

MOCK_USERS = [
    {
        "name": "Administrador",
        "email": "admin@gmail.com",
        "password": "admin",
        "phone": "+593 99 123 4567",
        "gender": "Hombre",
        "city": "Cuenca",
        "member_since": "2026-01-01T00:00:00",
        "preferences": ["cultural", "gastronomico", "tradicional"],
        "role": "admin",
    },
    {
        "name": "Darwin Chuqui",
        "email": "darwin.chuqui@gmail.com",
        "password": "darwin0502",
        "phone": "0968442437",
        "gender": "Hombre",
        "city": "Cuenca",
        "member_since": "2026-01-15T00:00:00",
        "preferences": ["cultural", "artistico"],
        "role": "user",
    },
    {
        "name": "Gabriela Cruz",
        "email": "gabriela.cruz@gmail.com",
        "password": "gabriela0502",
        "phone": "0968442459",
        "age": 18,
        "gender": "Mujer",
        "city": "Cuenca",
        "member_since": "2026-01-20T00:00:00",
        "preferences": ["tradicional", "gastronomico"],
        "role": "user",
    },
]


async def migrate_data():
    """Ejecutar migración de todos los datos"""
    print("=" * 60)
    print("🚀 Iniciando migración de datos a MongoDB")
    print("=" * 60)
    
    # Conectar a MongoDB
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    
    # Limpiar colecciones existentes
    print("\n🗑️  Limpiando colecciones existentes...")
    await db.events.drop()
    await db.alerts.drop()
    await db.routes.drop()
    await db.users.drop()
    await db.agendas.drop()
    print("   ✅ Colecciones limpiadas")
    
    # Migrar usuarios
    print("\n👥 Migrando usuarios...")
    for user_data in MOCK_USERS:
        user = {
            **user_data,
            "password_hash": hash_password(user_data["password"]),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }
        del user["password"]
        await db.users.insert_one(user)
        print(f"   ✅ Usuario: {user_data['name']} ({user_data['email']}) - Rol: {user_data['role']}")
    
    # Migrar eventos
    print("\n📅 Migrando eventos (fechas actualizadas a 2026)...")
    for event_data in MOCK_EVENTS:
        event = {
            **event_data,
            "date": datetime.fromisoformat(event_data["date"]),
            "gallery": [],
            "image_id": None,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }
        # Convertir testimonials created_at
        for t in event.get("testimonials", []):
            t["created_at"] = datetime.utcnow()
        
        await db.events.insert_one(event)
        print(f"   ✅ Evento: {event_data['title']}")
    
    # Migrar alertas
    print("\n⚠️  Migrando alertas...")
    for alert_data in MOCK_ALERTS:
        alert = {
            **alert_data,
            "start_date": datetime.fromisoformat(alert_data["start_date"]),
            "end_date": datetime.fromisoformat(alert_data["end_date"]),
            "image_id": None,
            "created_at": datetime.utcnow(),
        }
        await db.alerts.insert_one(alert)
        print(f"   ✅ Alerta: {alert_data['title']}")
    
    # Migrar rutas
    print("\n🛤️  Migrando rutas turísticas...")
    for route_data in MOCK_ROUTES:
        route = {
            **route_data,
            "events": [],
            "image_id": None,
            "created_at": datetime.utcnow(),
        }
        await db.routes.insert_one(route)
        print(f"   ✅ Ruta: {route_data['name']}")
    
    # Crear índices geoespaciales
    print("\n📍 Creando índices geoespaciales...")
    await db.events.create_index([("coordinates", "2dsphere")])
    await db.alerts.create_index([("coordinates", "2dsphere")])
    print("   ✅ Índices 2dsphere creados")
    
    # Crear índices adicionales
    print("\n🔍 Creando índices adicionales...")
    await db.events.create_index("date")
    await db.events.create_index("category")
    await db.users.create_index("email", unique=True)
    await db.alerts.create_index("is_active")
    print("   ✅ Índices adicionales creados")
    
    # Resumen
    events_count = await db.events.count_documents({})
    alerts_count = await db.alerts.count_documents({})
    routes_count = await db.routes.count_documents({})
    users_count = await db.users.count_documents({})
    
    print("\n" + "=" * 60)
    print("✅ MIGRACIÓN COMPLETADA")
    print("=" * 60)
    print(f"   📅 Eventos:  {events_count}")
    print(f"   ⚠️  Alertas:  {alerts_count}")
    print(f"   🛤️  Rutas:    {routes_count}")
    print(f"   👥 Usuarios: {users_count}")
    print("=" * 60)
    
    # Cerrar conexión
    client.close()


if __name__ == "__main__":
    asyncio.run(migrate_data())

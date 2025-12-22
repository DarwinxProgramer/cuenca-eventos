// Mock data for events with coordinates in Cuenca, Ecuador

// Import event images
import FestivalLuces from '../icons/eventos/Festival de luces.jpg';
import CorpusChristi from '../icons/eventos/corpus christi.jpg';
import ExpoArte from '../icons/eventos/expo arte.jpeg';
import PaseNino from '../icons/eventos/pase del niño.jpg';
import Carnaval from '../icons/eventos/carnaval.jpg';
import Desfile from '../icons/eventos/desfile.jpg';
import FeriasArtesanas from '../icons/eventos/feriasartesanas.jpg';
import CalleCerrada from '../icons/eventos/callecerrada.jpg';
import ViaCerrada from '../icons/eventos/via cerrada.jpg';
import RutaGastronomica from '../icons/eventos/rutagastronomica.jpg';
import RutaIglesias from '../icons/eventos/ruta de las igleais.jpg';
import RutaTuri from '../icons/eventos/ruta turi.jpg';

export interface Event {
    id: number;
    title: string;
    description: string;
    longDescription?: string;
    date: string;
    time: string;
    endTime?: string;
    location: string;
    address?: string;
    coordinates: { lat: number; lng: number };
    category: 'cultural' | 'religioso' | 'gastronomico' | 'artistico' | 'tradicional';
    image: string;
    gallery?: string[];
    itinerary?: { time: string; activity: string }[];
    closedStreets?: string[];
    testimonials?: { name: string; comment: string; rating: number }[];
}

export interface Alert {
    id: number;
    title: string;
    description: string;
    type: 'cierre' | 'desvio' | 'congestion';
    location: string;
    coordinates: { lat: number; lng: number };
    startDate: string;
    endDate: string;
    image?: string;
}

export interface Route {
    id: number;
    name: string;
    description: string;
    category: 'gastronomica' | 'cultural' | 'religiosa' | 'aventura';
    duration: string;
    distance: string;
    difficulty: 'facil' | 'moderada' | 'dificil';
    image: string;
    events: number[]; // Event IDs
    stops: { name: string; coordinates: { lat: number; lng: number } }[];
}

// Cuenca city center coordinates: -2.9001, -79.0059

export const mockEvents: Event[] = [
    {
        id: 1,
        title: 'Festival de Luces 2025',
        description: 'El Centro Histórico de Cuenca se ilumina con más de 50 instalaciones lumínicas artísticas.',
        longDescription: 'El Festival de Luces transforma el Centro Histórico de Cuenca en un escenario mágico. Durante tres noches consecutivas, más de 50 instalaciones lumínicas artísticas iluminan las calles empedradas, plazas y edificios patrimoniales. Artistas locales e internacionales presentan sus obras de luz, creando un recorrido inolvidable que celebra la luz, el arte y la tradición cuencana.',
        date: '2025-12-25',
        time: '18:00',
        endTime: '23:00',
        location: 'Centro Histórico',
        address: 'Parque Calderón y calles aledañas',
        coordinates: { lat: -2.8974, lng: -79.0045 },
        category: 'cultural',
        image: FestivalLuces,
        itinerary: [
            { time: '18:00', activity: 'Encendido oficial en Parque Calderón' },
            { time: '19:00', activity: 'Recorrido guiado por instalaciones' },
            { time: '20:30', activity: 'Show de mapping en la Catedral' },
            { time: '22:00', activity: 'Concierto de cierre' },
        ],
        closedStreets: ['Benigno Malo', 'Simón Bolívar', 'Luis Cordero'],
        testimonials: [
            { name: 'María García', comment: '¡Espectacular! Las luces en la Catedral fueron increíbles.', rating: 5 },
            { name: 'Carlos Andrade', comment: 'Una experiencia mágica para toda la familia.', rating: 5 },
        ],
    },
    {
        id: 2,
        title: 'Corpus Christi - Fiesta del Septenario',
        description: 'Siete días de festividades religiosas y culturales con procesiones y dulces típicos.',
        longDescription: 'El Corpus Christi en Cuenca es una celebración única que combina la fe católica con tradiciones ancestrales. Durante siete días, la ciudad se llena de procesiones solemnes, fuegos artificiales espectaculares, y los famosos dulces típicos que se venden en el Parque Calderón. Esta fiesta declarada Patrimonio Cultural Inmaterial del Ecuador atrae a miles de visitantes cada año.',
        date: '2025-06-19',
        time: '08:00',
        endTime: '22:00',
        location: 'Catedral de la Inmaculada',
        address: 'Parque Calderón, Centro Histórico',
        coordinates: { lat: -2.8973, lng: -79.0042 },
        category: 'religioso',
        image: CorpusChristi,
        itinerary: [
            { time: '08:00', activity: 'Misa solemne en la Catedral' },
            { time: '11:00', activity: 'Procesión por las calles del centro' },
            { time: '14:00', activity: 'Feria de dulces típicos' },
            { time: '19:00', activity: 'Castillos y fuegos artificiales' },
        ],
        closedStreets: ['Sucre', 'Benigno Malo', 'Presidente Córdova'],
        testimonials: [
            { name: 'Rosa Calle', comment: 'Los dulces de Corpus son los mejores del año.', rating: 5 },
            { name: 'Pedro Vélez', comment: 'La procesión es muy emotiva y tradicional.', rating: 4 },
        ],
    },
    {
        id: 3,
        title: 'Expo Arte Contemporáneo',
        description: 'Exposición con obras de artistas locales e internacionales en el Museo de Arte Moderno.',
        longDescription: 'El Museo de Arte Moderno de Cuenca presenta su exposición anual de arte contemporáneo, reuniendo obras de más de 30 artistas locales e internacionales. La muestra incluye pinturas, esculturas, instalaciones y arte digital que exploran temas de identidad, naturaleza y sociedad contemporánea.',
        date: '2025-01-15',
        time: '09:00',
        endTime: '17:00',
        location: 'Museo de Arte Moderno',
        address: 'Calle Sucre 15-27 y Coronel Tálbot',
        coordinates: { lat: -2.8992, lng: -79.0078 },
        category: 'artistico',
        image: ExpoArte,
        itinerary: [
            { time: '09:00', activity: 'Apertura de puertas' },
            { time: '11:00', activity: 'Visita guiada gratuita' },
            { time: '15:00', activity: 'Charla con artistas' },
        ],
        closedStreets: [],
        testimonials: [
            { name: 'Ana Mora', comment: 'Arte de primer nivel en nuestra ciudad.', rating: 5 },
        ],
    },
    {
        id: 4,
        title: 'Pase del Niño Viajero',
        description: 'El desfile navideño más grande y colorido del Ecuador.',
        longDescription: 'El Pase del Niño Viajero es la procesión navideña más importante del Ecuador y una de las más grandes de Latinoamérica. Miles de participantes, incluyendo niños disfrazados de personajes bíblicos, carros alegóricos elaborados y danzantes tradicionales, recorren las calles del centro de Cuenca llevando ofrendas al Niño Jesús.',
        date: '2025-12-24',
        time: '10:00',
        endTime: '18:00',
        location: 'Calles del Centro',
        address: 'Desde San Sebastián hasta el Parque Calderón',
        coordinates: { lat: -2.8985, lng: -79.0055 },
        category: 'tradicional',
        image: PaseNino,
        itinerary: [
            { time: '10:00', activity: 'Concentración en San Sebastián' },
            { time: '11:00', activity: 'Inicio del desfile' },
            { time: '14:00', activity: 'Paso por el Parque Calderón' },
            { time: '17:00', activity: 'Llegada a la Catedral' },
        ],
        closedStreets: ['Simón Bolívar', 'Gran Colombia', 'Mariscal Sucre', 'Presidente Córdova'],
        testimonials: [
            { name: 'Miguel Zhingri', comment: 'Tradición cuencana que emociona hasta las lágrimas.', rating: 5 },
            { name: 'Lucía Parra', comment: 'Los carros alegóricos son impresionantes cada año.', rating: 5 },
        ],
    },
    {
        id: 5,
        title: 'Carnaval Cuencano 2025',
        description: 'Celebración del carnaval con desfiles, música y tradiciones en toda la ciudad.',
        longDescription: 'El Carnaval en Cuenca combina las tradiciones andinas con la alegría de esta festividad. Desfiles coloridos, comparsas, música en vivo y por supuesto, el tradicional juego con agua y carioca llenan las calles de la ciudad durante tres días de fiesta.',
        date: '2025-03-01',
        time: '09:00',
        endTime: '20:00',
        location: 'Ciudad de Cuenca',
        address: 'Múltiples ubicaciones',
        coordinates: { lat: -2.9055, lng: -79.0128 },
        category: 'tradicional',
        image: Carnaval,
        itinerary: [
            { time: '09:00', activity: 'Desfile de comparsas' },
            { time: '12:00', activity: 'Festival gastronómico' },
            { time: '16:00', activity: 'Concurso de disfraces' },
            { time: '19:00', activity: 'Concierto de cierre' },
        ],
        closedStreets: ['Av. Solano', 'Av. 12 de Abril'],
        testimonials: [
            { name: 'Jorge Sánchez', comment: '¡El mejor carnaval de la sierra!', rating: 4 },
        ],
    },
    {
        id: 6,
        title: 'Desfile de la Cuencanidad',
        description: 'Desfile cívico celebrando la fundación de Cuenca con bandas y delegaciones.',
        longDescription: 'El 12 de abril, Cuenca celebra su fundación española con un gran desfile cívico. Instituciones educativas, bandas de música, delegaciones barriales y autoridades recorren las principales calles del centro histórico en un homenaje a la ciudad.',
        date: '2025-04-12',
        time: '09:00',
        endTime: '13:00',
        location: 'Av. Solano - Centro',
        address: 'Desde Universidad de Cuenca hasta Parque Calderón',
        coordinates: { lat: -2.9012, lng: -79.0089 },
        category: 'cultural',
        image: Desfile,
        itinerary: [
            { time: '09:00', activity: 'Concentración en Universidad de Cuenca' },
            { time: '10:00', activity: 'Inicio del desfile' },
            { time: '12:00', activity: 'Acto cívico en Parque Calderón' },
        ],
        closedStreets: ['Av. Solano', 'Calle Larga', 'Benigno Malo'],
        testimonials: [
            { name: 'Patricia Mora', comment: 'Orgullo cuencano en cada banda que pasa.', rating: 5 },
        ],
    },
    {
        id: 7,
        title: 'Feria de Artesanías',
        description: 'Exposición y venta de artesanías tradicionales cuencanas y del Azuay.',
        longDescription: 'La Feria de Artesanías reúne a los mejores artesanos de Cuenca y la provincia del Azuay. Sombreros de paja toquilla, cerámicas, tejidos, joyería en filigrana y muchas otras expresiones del arte popular se exhiben y venden en esta feria que celebra la tradición artesanal de la región.',
        date: '2025-11-03',
        time: '09:00',
        endTime: '18:00',
        location: 'Plaza de San Francisco',
        address: 'Presidente Córdova y Padre Aguirre',
        coordinates: { lat: -2.8945, lng: -79.0035 },
        category: 'cultural',
        image: FeriasArtesanas,
        itinerary: [
            { time: '09:00', activity: 'Apertura de stands' },
            { time: '11:00', activity: 'Demostración de tejido de paja toquilla' },
            { time: '14:00', activity: 'Taller de cerámica' },
            { time: '16:00', activity: 'Música tradicional en vivo' },
        ],
        closedStreets: ['Presidente Córdova (tramo)'],
        testimonials: [
            { name: 'Sandra Crespo', comment: 'Compré un hermoso sombrero de paja toquilla.', rating: 5 },
        ],
    },
];

export const mockAlerts: Alert[] = [
    {
        id: 1,
        title: 'Cierre vial por Festival de Luces',
        description: 'Cierre de calles en el Centro Histórico por instalación de equipos lumínicos. Use rutas alternativas.',
        type: 'cierre',
        location: 'Benigno Malo y Simón Bolívar',
        coordinates: { lat: -2.8974, lng: -79.0045 },
        startDate: '2025-12-24',
        endDate: '2025-12-26',
        image: CalleCerrada,
    },
    {
        id: 2,
        title: 'Desvío por Pase del Niño',
        description: 'Desvío obligatorio para vehículos en el centro. Siga las indicaciones de tránsito.',
        type: 'desvio',
        location: 'Gran Colombia y Tarqui',
        coordinates: { lat: -2.8990, lng: -79.0060 },
        startDate: '2025-12-24',
        endDate: '2025-12-24',
        image: ViaCerrada,
    },
    {
        id: 3,
        title: 'Zona de congestión - Corpus Christi',
        description: 'Alta afluencia de vehículos y peatones en zona del Parque Calderón.',
        type: 'congestion',
        location: 'Parque Calderón',
        coordinates: { lat: -2.8973, lng: -79.0042 },
        startDate: '2025-06-19',
        endDate: '2025-06-26',
    },
    {
        id: 4,
        title: 'Cierre Presidente Córdova',
        description: 'Calle cerrada por mantenimiento y preparación para evento cultural.',
        type: 'cierre',
        location: 'Presidente Córdova y Tarqui',
        coordinates: { lat: -2.8960, lng: -79.0052 },
        startDate: '2025-12-20',
        endDate: '2025-12-22',
        image: ViaCerrada,
    },
];

export const mockRoutes: Route[] = [
    {
        id: 1,
        name: 'Ruta Gastronómica del Centro',
        description: 'Descubre los sabores tradicionales de Cuenca visitando los mejores restaurantes y mercados del centro histórico. Desde el tradicional hornado hasta los dulces de Corpus.',
        category: 'gastronomica',
        duration: '4 horas',
        distance: '2.5 km',
        difficulty: 'facil',
        image: RutaGastronomica,
        events: [2, 7], // Corpus Christi, Feria Artesanías
        stops: [
            { name: 'Mercado 10 de Agosto', coordinates: { lat: -2.8952, lng: -79.0008 } },
            { name: 'Restaurante Raymipampa', coordinates: { lat: -2.8975, lng: -79.0040 } },
            { name: 'Café Austria', coordinates: { lat: -2.8968, lng: -79.0048 } },
            { name: 'Mercado 9 de Octubre', coordinates: { lat: -2.8995, lng: -79.0088 } },
        ],
    },
    {
        id: 2,
        name: 'Ruta de las Iglesias',
        description: 'Recorre las iglesias más emblemáticas de Cuenca, desde la majestuosa Catedral Nueva hasta las pequeñas capillas coloniales. Un viaje espiritual y arquitectónico.',
        category: 'religiosa',
        duration: '3 horas',
        distance: '3 km',
        difficulty: 'facil',
        image: RutaIglesias,
        events: [2], // Corpus Christi
        stops: [
            { name: 'Catedral de la Inmaculada', coordinates: { lat: -2.8973, lng: -79.0042 } },
            { name: 'Catedral Vieja', coordinates: { lat: -2.8970, lng: -79.0050 } },
            { name: 'Iglesia de San Sebastián', coordinates: { lat: -2.8985, lng: -79.0095 } },
            { name: 'Iglesia de Santo Domingo', coordinates: { lat: -2.8955, lng: -79.0068 } },
            { name: 'Iglesia de Todos Santos', coordinates: { lat: -2.9015, lng: -79.0025 } },
        ],
    },
    {
        id: 3,
        name: 'Ruta Turi - Mirador',
        description: 'Sube al mirador de Turi para disfrutar de la mejor vista panorámica de Cuenca. Incluye paradas en miradores secundarios y el tradicional columpio de Turi.',
        category: 'aventura',
        duration: '2 horas',
        distance: '5 km',
        difficulty: 'moderada',
        image: RutaTuri,
        events: [1], // Festival de Luces
        stops: [
            { name: 'Inicio en El Vergel', coordinates: { lat: -2.9080, lng: -79.0100 } },
            { name: 'Mirador de Turi', coordinates: { lat: -2.9180, lng: -79.0050 } },
            { name: 'Iglesia de Turi', coordinates: { lat: -2.9175, lng: -79.0055 } },
            { name: 'Columpio de Turi', coordinates: { lat: -2.9185, lng: -79.0048 } },
        ],
    },
];

// User attendance tracking (simulated)
export interface UserAgenda {
    attending: number[]; // Event IDs
    interested: number[]; // Event IDs
    notGoing: number[]; // Event IDs
    createdRoutes: Route[];
    completedRoutes: number[]; // Route IDs
}

export const initialUserAgenda: UserAgenda = {
    attending: [1, 4], // Festival de Luces, Pase del Niño
    interested: [2, 3], // Corpus Christi, Expo Arte
    notGoing: [],
    createdRoutes: [],
    completedRoutes: [2], // Ruta Iglesias
};

// User interface with authentication
export interface User {
    id: number;
    name: string;
    email: string;
    password: string;
    avatar?: string;
    phone?: string;
    age?: number;
    gender: 'Hombre' | 'Mujer' | 'Otro';
    city: string;
    memberSince: string;
    preferences: string[];
}

// For backwards compatibility
export interface UserProfile {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    phone?: string;
    age?: number;
    gender?: string;
    city: string;
    memberSince: string;
    preferences: string[];
}

// Mock users database
export const mockUsers: User[] = [
    {
        id: 1,
        name: 'Administrador',
        email: 'admin@gmail.com',
        password: 'admin',
        phone: '+593 99 123 4567',
        gender: 'Hombre',
        city: 'Cuenca',
        memberSince: '2024-06-15',
        preferences: ['cultural', 'gastronomico', 'tradicional'],
    },
    {
        id: 2,
        name: 'Darwin Chuqui',
        email: 'darwin.chuqui@gmail.com',
        password: 'darwin0502',
        phone: '0968442437',
        gender: 'Hombre',
        city: 'Cuenca',
        memberSince: '2025-01-15',
        preferences: ['cultural', 'artistico'],
    },
    {
        id: 3,
        name: 'Gabriela Cruz',
        email: 'gabriela.cruz@gmail.com',
        password: 'gabriela0502',
        phone: '0968442459',
        age: 18,
        gender: 'Mujer',
        city: 'Cuenca',
        memberSince: '2025-01-20',
        preferences: ['tradicional', 'gastronomico'],
    },
];

// Default user profile (for backwards compatibility)
export const mockUserProfile: UserProfile = {
    id: 1,
    name: 'Administrador',
    email: 'admin@gmail.com',
    phone: '+593 99 123 4567',
    city: 'Cuenca',
    memberSince: '2024-06-15',
    preferences: ['cultural', 'gastronomico', 'tradicional'],
};

// Helper functions
export const getEventsByDate = (date: string): Event[] => {
    return mockEvents.filter(event => event.date === date);
};

export const getEventsByMonth = (year: number, month: number): Event[] => {
    return mockEvents.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.getFullYear() === year && eventDate.getMonth() === month;
    });
};

export const getUpcomingEvents = (limit: number = 5): Event[] => {
    const today = new Date();
    return mockEvents
        .filter(event => new Date(event.date) >= today)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, limit);
};

export const getEventById = (id: number): Event | undefined => {
    return mockEvents.find(event => event.id === id);
};

export const getRouteById = (id: number): Route | undefined => {
    return mockRoutes.find(route => route.id === id);
};

export const getCategoryLabel = (category: string): string => {
    const labels: Record<string, string> = {
        cultural: 'Cultural',
        religioso: 'Religioso',
        gastronomico: 'Gastronómico',
        artistico: 'Artístico',
        tradicional: 'Tradicional',
        aventura: 'Aventura',
    };
    return labels[category] || category;
};

export const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
        cultural: 'from-primary-500 to-primary-600',
        religioso: 'from-secondary-500 to-secondary-600',
        gastronomico: 'from-accent-500 to-accent-600',
        artistico: 'from-primary-600 to-secondary-500',
        tradicional: 'from-secondary-600 to-accent-500',
        aventura: 'from-accent-600 to-primary-500',
    };
    return colors[category] || 'from-surface-500 to-surface-600';
};

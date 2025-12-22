// Mock data for events - simulates database responses

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  imageUrl?: string;
  category: string;
}

export const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Festival de la Luz',
    description: 'Un espectáculo de luces y música en el centro histórico de Cuenca.',
    date: '2024-12-25',
    location: 'Parque Calderón',
    category: 'festival'
  },
  {
    id: '2',
    title: 'Concierto de Navidad',
    description: 'Orquesta Sinfónica de Cuenca presenta su concierto navideño anual.',
    date: '2024-12-24',
    location: 'Catedral de la Inmaculada',
    category: 'música'
  },
  {
    id: '3',
    title: 'Feria Gastronómica',
    description: 'Degustación de platos típicos de la región.',
    date: '2024-12-28',
    location: 'Plaza de San Francisco',
    category: 'gastronomía'
  }
];

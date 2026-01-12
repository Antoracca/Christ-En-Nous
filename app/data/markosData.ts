import { ImageSourcePropType } from 'react-native';

// --- TYPES ---

export interface MarkosEvent {
  id: string;
  title: string;
  type: 'sortie' | 'camping' | 'cinema' | 'sport' | 'spiritual';
  date: string;
  time: string;
  location: string;
  price: number; // 0 pour gratuit
  image: string;
  participants: number;
  isRegisted?: boolean;
  description?: string;
}

// QuizSession est maintenant défini dans quizData.ts
// On garde cette interface pour compatibilité avec les anciens composants
export interface QuizSession {
  id: string;
  title: string;
  status: 'live' | 'upcoming' | 'finished';
  participants: number;
  startTime?: string;
  xpReward: number;
  topic: string; // Bible, Culture G, Histoire de l'Église...
  winner?: string;
}

export interface MarketItem {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  sellerName: string;
  sellerAvatar?: string;
  category: 'vetement' | 'service' | 'alimentaire' | 'autre';
  image: string;
  whatsappLink: string;
}

export interface AcademyRequest {
  id: string;
  subject: string;
  level: string;
  description: string;
  studentName: string;
  studentAvatar?: string;
  type: 'demande' | 'offre';
  status: 'open' | 'resolved';
  tags: string[];
  responses: number;
  isUrgent?: boolean;
  isVerified?: boolean; // Pour les tuteurs certifiés
  postedAt: string;
}

// --- DATA MOCK ---

export const MARKOS_EVENTS: MarkosEvent[] = [
  {
    id: '1',
    title: 'Grand Camping "Peniel"',
    type: 'camping',
    date: '15 Août 2026',
    time: '08:00',
    location: 'Boali, Chutes',
    price: 15000,
    image: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=500',
    participants: 45,
    isRegisted: true,
    description: 'Un moment inoubliable de reconnexion avec Dieu et la nature. Au programme : feux de camp, adorations sous les étoiles, baignade et enseignements sur la montagne. Transport et restauration inclus.',
  },
  {
    id: '2',
    title: 'Sortie Cinéma: "The Chosen"',
    type: 'cinema',
    date: '20 Juin 2026',
    time: '18:00',
    location: 'Bangui Mall',
    price: 3000,
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500',
    participants: 12,
    description: 'Venez découvrir la nouvelle saison de la série événement sur la vie de Jésus. Séance privée réservée au groupe Markos, suivie d\'un débat et d\'un verre de l\'amitié.',
  },
  {
    id: '3',
    title: 'Match de Gala: Markos vs Chorale',
    type: 'sport',
    date: '05 Juil 2026',
    time: '15:30',
    location: 'Stade 20.000 Places',
    price: 500,
    image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=500',
    participants: 120,
    description: 'Le grand classique ! Venez supporter votre équipe préférée dans une ambiance électrique mais fraternelle. Qui remportera la coupe cette année ?',
  }
];

export const MARKOS_QUIZZES: QuizSession[] = [
  {
    id: '1',
    title: 'Le Livre de Daniel',
    status: 'live',
    participants: 34,
    xpReward: 500,
    topic: 'Bible',
  },
  {
    id: '2',
    title: 'Histoire de la RCA',
    status: 'upcoming',
    startTime: '19:00',
    participants: 156,
    xpReward: 300,
    topic: 'Culture',
  },
];

export const MARKOS_MARKET: MarketItem[] = [
  {
    id: '1',
    title: 'T-shirt "Christ En Nous" Collector',
    description: 'T-shirt officiel du ministère, toutes tailles disponibles.',
    price: 5000,
    currency: 'FCFA',
    sellerName: 'Boutique Markos',
    category: 'vetement',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
    whatsappLink: 'https://wa.me/23600000000',
  },
  {
    id: '2',
    title: 'Service Traiteur pour vos fêtes',
    description: 'Gâteaux, petits fours et jus naturels pour anniversaires.',
    price: 0,
    currency: 'Sur devis',
    sellerName: 'Sœur Sarah',
    category: 'alimentaire',
    image: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=500',
    whatsappLink: 'https://wa.me/23600000000',
  },
];

export const MARKOS_ACADEMY: AcademyRequest[] = [
  {
    id: '1',
    subject: 'Mathématiques',
    level: 'Terminale C',
    description: 'URGENT ! Je bloque sur les intégrales pour le bac blanc de lundi. J\'ai besoin d\'une explication claire sur la méthode par parties.',
    studentName: 'Jean-Marc',
    type: 'demande',
    status: 'open',
    tags: ['#Bac', '#Intégrales', '#Urgent'],
    responses: 3,
    isUrgent: true,
    postedAt: 'Il y a 2h',
  },
  {
    id: '2',
    subject: 'Anglais',
    level: 'Tous niveaux',
    description: 'Tuteur certifié Cambridge propose Club d\'Anglais gratuit chaque samedi après la chorale. Améliorez votre accent !',
    studentName: 'Coach Fidèle',
    type: 'offre',
    status: 'open',
    tags: ['#Speaking', '#Gratuit', '#Formation'],
    responses: 12,
    isVerified: true,
    postedAt: 'Hier',
  },
  {
    id: '3',
    subject: 'Physique',
    level: 'Première S',
    description: 'Qui a le corrigé du TD de M. Konan sur l\'énergie cinétique ? Je ne comprends pas l\'exercice 4.',
    studentName: 'Sarah B.',
    type: 'demande',
    status: 'open',
    tags: ['#Devoirs', '#Mécanique'],
    responses: 5,
    postedAt: 'Il y a 5h',
  },
  {
    id: '4',
    subject: 'Philosophie',
    level: 'Terminale A',
    description: 'Méthodologie de la dissertation : Je partage mes fiches de révision complètes sur la Conscience et l\'Inconscient.',
    studentName: 'Paul Elite',
    type: 'offre',
    status: 'open',
    tags: ['#Fiches', '#Révisions', '#Philo'],
    responses: 28,
    isVerified: true,
    postedAt: 'Il y a 1j',
  },
  {
    id: '5',
    subject: 'Informatique',
    level: 'Débutant',
    description: 'Mon PC ne démarre plus pour mes recherches. Quelqu\'un s\'y connait en maintenance ? C\'est pour l\'école.',
    studentName: 'Junior',
    type: 'demande',
    status: 'open',
    tags: ['#Maintenance', '#Help'],
    responses: 0,
    isUrgent: true,
    postedAt: 'À l\'instant',
  },
];

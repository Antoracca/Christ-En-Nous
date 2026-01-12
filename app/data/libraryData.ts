// Types et données pour la Bibliothèque et Archives

export type MediaType = 'podcast' | 'book' | 'video' | 'audio' | 'text' | 'reference';
export type MediaCategory = 'enseignement' | 'doctrine' | 'histoire' | 'priere' | 'evangelisation' | 'leadership' | 'famille' | 'jeunesse';
export type AccessType = 'free' | 'premium' | 'subscription' | 'purchase';
export type SubscriptionPlan = 'monthly' | 'yearly' | 'lifetime';

export interface MediaItem {
  id: string;
  title: string;
  author: string;
  authorAvatar?: string;
  description: string;
  thumbnail: string;
  type: MediaType;
  category: MediaCategory;
  duration?: string; // Pour audio/video
  pages?: number; // Pour livres
  views: number;
  likes: number;
  publishedAt: string;
  accessType: AccessType;
  price?: number; // En FCFA si purchase
  subscriptionRequired?: boolean;
  tags: string[];
  language: 'fr' | 'en' | 'sango';
  isNew?: boolean;
  isFeatured?: boolean;
  rating?: number;
}

export interface PodcastEpisode extends MediaItem {
  type: 'podcast';
  episodeNumber: number;
  season?: number;
  transcript?: string; // Texte de l'épisode
  audioUrl?: string;
  videoUrl?: string;
}

export interface Book extends MediaItem {
  type: 'book';
  isbn?: string;
  publisher: string;
  year: number;
  chapters: number;
  downloadUrl?: string;
  previewUrl?: string;
}

export interface Reference extends MediaItem {
  type: 'reference';
  source: string;
  citation: string;
}

export interface SubscriptionBundle {
  id: string;
  name: string;
  description: string;
  price: number; // En FCFA
  plan: SubscriptionPlan;
  features: string[];
  mediaCount: number;
  discount?: number; // Pourcentage
  isPopular?: boolean;
  color: string;
}

// Données mockées
export const SUBSCRIPTION_BUNDLES: SubscriptionBundle[] = [
  {
    id: 'basic',
    name: 'Bouquet Essentiel',
    description: 'Accès à tous les contenus premium de base',
    price: 1500,
    plan: 'monthly',
    features: [
      'Accès à 50+ livres premium',
      'Podcasts exclusifs',
      'Vidéos d\'enseignement',
      'Sans publicité',
    ],
    mediaCount: 50,
    color: '#3B82F6',
  },
  {
    id: 'premium',
    name: 'Bouquet Premium',
    description: 'Accès complet à toute la bibliothèque',
    price: 3000,
    plan: 'monthly',
    features: [
      'Accès illimité à tous les contenus',
      'Téléchargements hors ligne',
      'Nouveautés en avant-première',
      'Support prioritaire',
      'Sans publicité',
    ],
    mediaCount: 200,
    discount: 20,
    isPopular: true,
    color: '#8B5CF6',
  },
  {
    id: 'yearly',
    name: 'Abonnement Annuel',
    description: 'Économisez avec l\'abonnement annuel',
    price: 30000,
    plan: 'yearly',
    features: [
      'Tous les avantages Premium',
      'Économie de 20%',
      'Accès à vie aux archives',
      'Contenus exclusifs',
    ],
    mediaCount: 200,
    discount: 20,
    color: '#10B981',
  },
];

export const LIBRARY_MEDIA: MediaItem[] = [
  // Podcasts
  {
    id: 'podcast-1',
    title: 'La Foi qui Déplace les Montagnes',
    author: 'Pasteur Visionnaire',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    description: 'Une série d\'enseignements puissants sur la foi et son impact dans notre vie quotidienne.',
    thumbnail: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=500',
    type: 'podcast',
    category: 'enseignement',
    duration: '45:30',
    views: 1250,
    likes: 89,
    publishedAt: '2026-01-10',
    accessType: 'free',
    tags: ['foi', 'enseignement', 'spiritualité'],
    language: 'fr',
    isNew: true,
    isFeatured: true,
    rating: 4.8,
  } as PodcastEpisode,
  {
    id: 'podcast-2',
    title: 'Les Fondements de la Doctrine',
    author: 'Apôtre Enseignant',
    authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    description: 'Enseignement approfondi sur les doctrines fondamentales de la foi chrétienne.',
    thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500',
    type: 'podcast',
    category: 'doctrine',
    duration: '52:15',
    views: 980,
    likes: 67,
    publishedAt: '2026-01-08',
    accessType: 'premium',
    tags: ['doctrine', 'fondements', 'théologie'],
    language: 'fr',
    rating: 4.9,
  } as PodcastEpisode,
  {
    id: 'podcast-3',
    title: 'Prière et Intercession',
    author: 'Sœur Intercesseur',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    description: 'Découvrez les secrets d\'une vie de prière efficace et puissante.',
    thumbnail: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=500',
    type: 'podcast',
    category: 'priere',
    duration: '38:20',
    views: 750,
    likes: 54,
    publishedAt: '2026-01-05',
    accessType: 'free',
    tags: ['prière', 'intercession', 'spiritualité'],
    language: 'fr',
    rating: 4.7,
  } as PodcastEpisode,

  // Livres
  {
    id: 'book-1',
    title: 'Vivre par l\'Esprit',
    author: 'Dr. Théologien',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    description: 'Un guide complet pour comprendre et vivre selon l\'Esprit de Dieu dans notre vie quotidienne.',
    thumbnail: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500',
    type: 'book',
    category: 'enseignement',
    pages: 320,
    views: 2100,
    likes: 145,
    publishedAt: '2025-12-15',
    accessType: 'purchase',
    price: 2500,
    tags: ['Esprit Saint', 'vie chrétienne', 'spiritualité'],
    language: 'fr',
    isFeatured: true,
    rating: 4.9,
    publisher: 'Éditions Christ En Nous',
    year: 2025,
    chapters: 12,
  } as Book,
  {
    id: 'book-2',
    title: 'Histoire de l\'Église en Afrique',
    author: 'Prof. Historien',
    description: 'Une analyse approfondie de l\'histoire et du développement de l\'Église en Afrique.',
    thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500',
    type: 'book',
    category: 'histoire',
    pages: 450,
    views: 1800,
    likes: 120,
    publishedAt: '2025-11-20',
    accessType: 'subscription',
    subscriptionRequired: true,
    tags: ['histoire', 'Afrique', 'Église'],
    language: 'fr',
    rating: 4.8,
    publisher: 'Éditions Christ En Nous',
    year: 2025,
    chapters: 18,
  } as Book,
  {
    id: 'book-3',
    title: 'Leadership Serviteur',
    author: 'Pasteur Leader',
    description: 'Les principes bibliques du leadership selon le modèle de Jésus-Christ.',
    thumbnail: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500',
    type: 'book',
    category: 'leadership',
    pages: 280,
    views: 1500,
    likes: 98,
    publishedAt: '2025-10-10',
    accessType: 'premium',
    tags: ['leadership', 'serviteur', 'ministère'],
    language: 'fr',
    rating: 4.7,
    publisher: 'Éditions Christ En Nous',
    year: 2025,
    chapters: 10,
  } as Book,

  // Vidéos
  {
    id: 'video-1',
    title: 'Série : Les Paraboles de Jésus',
    author: 'Pasteur Enseignant',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    description: 'Une série complète d\'enseignements vidéo sur les paraboles de Jésus et leurs significations profondes.',
    thumbnail: 'https://images.unsplash.com/photo-1490127252417-7c393f993ee4?w=500',
    type: 'video',
    category: 'enseignement',
    duration: '1h 25min',
    views: 3200,
    likes: 234,
    publishedAt: '2026-01-12',
    accessType: 'free',
    tags: ['Jésus', 'paraboles', 'enseignement'],
    language: 'fr',
    isNew: true,
    isFeatured: true,
    rating: 5.0,
  },
  {
    id: 'video-2',
    title: 'Conférence : Réveil Spirituel',
    author: 'Évangéliste Réveil',
    description: 'Enregistrement complet de la conférence sur le réveil spirituel.',
    thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500',
    type: 'video',
    category: 'evangelisation',
    duration: '2h 15min',
    views: 4500,
    likes: 312,
    publishedAt: '2025-12-20',
    accessType: 'premium',
    tags: ['réveil', 'conférence', 'évangélisation'],
    language: 'fr',
    rating: 4.9,
  },

  // Références
  {
    id: 'ref-1',
    title: 'Commentaires Bibliques - Genèse',
    author: 'Équipe Théologique',
    description: 'Commentaires détaillés et références croisées pour le livre de la Genèse.',
    thumbnail: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500',
    type: 'reference',
    category: 'doctrine',
    views: 890,
    likes: 56,
    publishedAt: '2025-12-01',
    accessType: 'free',
    tags: ['Bible', 'commentaires', 'références'],
    language: 'fr',
    source: 'École Biblique Christ En Nous',
    citation: 'Commentaires basés sur les textes originaux hébreux et grecs',
  } as Reference,
];

// Catégories pour filtres
export const MEDIA_CATEGORIES: Array<{ id: MediaCategory; label: string; icon: string; color: string }> = [
  { id: 'enseignement', label: 'Enseignements', icon: 'book-open', color: '#3B82F6' },
  { id: 'doctrine', label: 'Doctrine', icon: 'shield', color: '#8B5CF6' },
  { id: 'histoire', label: 'Histoire', icon: 'clock', color: '#10B981' },
  { id: 'priere', label: 'Prière', icon: 'heart', color: '#EC4899' },
  { id: 'evangelisation', label: 'Évangélisation', icon: 'megaphone', color: '#F59E0B' },
  { id: 'leadership', label: 'Leadership', icon: 'account-group', color: '#06B6D4' },
  { id: 'famille', label: 'Famille', icon: 'home', color: '#EF4444' },
  { id: 'jeunesse', label: 'Jeunesse', icon: 'account-multiple', color: '#6366F1' },
];

// Types de médias
export const MEDIA_TYPES: Array<{ id: MediaType; label: string; icon: string }> = [
  { id: 'podcast', label: 'Podcasts', icon: 'microphone' },
  { id: 'book', label: 'Livres', icon: 'book' },
  { id: 'video', label: 'Vidéos', icon: 'video' },
  { id: 'audio', label: 'Audios', icon: 'headphones' },
  { id: 'text', label: 'Textes', icon: 'file-text' },
  { id: 'reference', label: 'Références', icon: 'bookmark' },
];

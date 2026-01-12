export interface PrayerRequest {
  id: string;
  user: string;
  avatar?: string;
  title: string;
  content: string;
  category: 'Santé' | 'Famille' | 'Travail' | 'Ministère' | 'Autre' | 'Reconnaissance';
  timestamp: string;
  intercessionCount: number;
  isPrivate: boolean;
  isAnswered: boolean;
}

export const MOCK_PRAYERS: PrayerRequest[] = [
  {
    id: '1',
    user: 'Marie L.',
    title: 'Restauration de ma santé',
    content: 'Je demande vos prières pour mon opération de mardi prochain. Que la main du Seigneur dirige les médecins.',
    category: 'Santé',
    timestamp: 'Il y a 2h',
    intercessionCount: 12,
    isPrivate: false,
    isAnswered: false,
  },
  {
    id: '2',
    user: 'Jean D.',
    title: 'Orientation professionnelle',
    content: 'Seigneur, ouvre-moi une porte pour ce nouvel emploi. Que Ta volonté soit faite.',
    category: 'Travail',
    timestamp: 'Il y a 5h',
    intercessionCount: 8,
    isPrivate: false,
    isAnswered: false,
  },
  {
    id: '3',
    user: 'Famille T.',
    title: 'Action de grâce : Nouveau-né !',
    content: 'Le petit Samuel est né en parfaite santé ! Merci Seigneur pour Ta fidélité.',
    category: 'Reconnaissance',
    timestamp: 'Hier',
    intercessionCount: 45,
    isPrivate: false,
    isAnswered: true,
  },
];

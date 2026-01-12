export interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: 'Urgent' | 'Église' | 'Jeunesse' | 'Célébration' | 'Communauté';
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  image: string;
  date: string;
  readTime: string;
  isFeatured?: boolean;
}

export const NEWS_DATA: NewsItem[] = [
  {
    id: '1',
    title: 'Nuit de la Traversée : Préparez vos cœurs',
    excerpt: 'Le 31 Décembre approche. Le Pasteur Principal nous donne les directives pour entrer dans la nouvelle année avec puissance.',
    content: '...',
    category: 'Célébration',
    author: {
      name: 'Pasteur Principal',
      role: 'Leader',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800',
    date: 'Aujourd\'u00e0i',
    readTime: '3 min',
    isFeatured: true,
  },
  {
    id: '2',
    title: 'Changement d\'horaire des cultes',
    excerpt: 'À partir de février, le culte de l\'aube débutera à 06h30 précises pour permettre aux travailleurs de participer.',
    content: '...',
    category: 'Urgent',
    author: {
      name: 'Secrétariat',
      role: 'Admin',
      avatar: 'https://ui-avatars.com/api/?name=Secrétariat&background=0D8ABC&color=fff',
    },
    image: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=500',
    date: 'Il y a 2h',
    readTime: '1 min',
  },
  {
    id: '3',
    title: 'Retour sur la sortie Markos à Boali',
    excerpt: 'Les photos exclusives de notre magnifique journée aux chutes. Une communion fraternelle inoubliable.',
    content: '...',
    category: 'Jeunesse',
    author: {
      name: 'Sarah K.',
      role: 'Reporter',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    },
    image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=500',
    date: 'Hier',
    readTime: '5 min',
  },
  {
    id: '4',
    title: 'Appel aux bénévoles : BOMI',
    excerpt: 'La prochaine campagne médicale nécessite 10 infirmiers et 5 logisticiens. Inscrivez-vous avant dimanche.',
    content: '...',
    category: 'Communauté',
    author: {
      name: 'Dr. Michel',
      role: 'BOMI',
      avatar: 'https://ui-avatars.com/api/?name=Dr+Michel&background=10B981&color=fff',
    },
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500',
    date: '12 Jan',
    readTime: '2 min',
  },
  {
    id: '5',
    title: 'Travaux d\'agrandissement du temple',
    excerpt: 'La phase 2 commence la semaine prochaine. L\'accès au parking sud sera temporairement fermé.',
    content: '...',
    category: 'Église',
    author: {
      name: 'Comité Bâtir',
      role: 'Travaux',
      avatar: 'https://ui-avatars.com/api/?name=Batir&background=F59E0B&color=fff',
    },
    image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=500',
    date: '10 Jan',
    readTime: '4 min',
  },
];

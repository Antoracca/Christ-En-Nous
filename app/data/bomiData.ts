export interface MissionProject {
  id: string;
  title: string;
  description: string;
  location: string;
  image: string;
  targetAmount: number;
  currentAmount: number;
  donors: number;
  category: 'Evangélisation' | 'Humanitaire' | 'Construction' | 'Formation';
  status: 'active' | 'completed';
}

export interface ImpactStat {
  id: string;
  label: string;
  value: string;
  icon: string;
  color: string;
}

export interface Testimony {
  id: string;
  name: string;
  role: string; // Ex: "Bénéficiaire", "Missionnaire"
  avatar: string;
  content: string;
  location: string;
}

export const BOMI_STATS: ImpactStat[] = [
  { id: '1', label: 'Villes Touchées', value: '12', icon: 'map-pin', color: '#EF4444' },
  { id: '2', label: 'Âmes Sauvées', value: '1,500+', icon: 'users', color: '#3B82F6' },
  { id: '3', label: 'Missions', value: '45', icon: 'globe', color: '#10B981' },
];

export const BOMI_PROJECTS: MissionProject[] = [
  {
    id: '1',
    title: 'Croisade "Lumière à Bambari"',
    description: 'Une semaine d\'évangélisation intensive, distribution de Bibles et soins médicaux gratuits pour la population de Bambari.',
    location: 'Bambari, RCA',
    image: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=500',
    targetAmount: 5000000,
    currentAmount: 3250000,
    donors: 142,
    category: 'Evangélisation',
    status: 'active',
  },
  {
    id: '2',
    title: 'Construction Puits d\'Eau',
    description: 'Apporter de l\'eau potable au village de Zawa pour réduire les maladies hydriques et témoigner de l\'amour de Dieu.',
    location: 'Zawa, Yaloké',
    image: 'https://images.unsplash.com/photo-1574482620267-a3f5a050bb88?w=500',
    targetAmount: 2500000,
    currentAmount: 2100000,
    donors: 89,
    category: 'Humanitaire',
    status: 'active',
  },
  {
    id: '3',
    title: 'Formation des Disciples',
    description: 'Équiper 50 nouveaux leaders pour l\'implantation d\'églises dans les zones rurales.',
    location: 'Bangui',
    image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=500',
    targetAmount: 1000000,
    currentAmount: 1000000,
    donors: 45,
    category: 'Formation',
    status: 'completed',
  },
];

export const BOMI_TESTIMONIES: Testimony[] = [
  {
    id: '1',
    name: 'Maman Pauline',
    role: 'Bénéficiaire',
    avatar: 'https://images.unsplash.com/photo-1507152832244-10d45c7928f1?w=150',
    content: 'Grâce à la mission médicale, j\'ai pu être soignée gratuitement. C\'est là que j\'ai entendu parler de Jésus pour la première fois.',
    location: 'Bambari',
  },
  {
    id: '2',
    name: 'Frère Thomas',
    role: 'Missionnaire',
    avatar: 'https://i.pravatar.cc/150?u=thomas',
    content: 'Partir en mission avec BOMI a changé ma vie. Voir la soif de Dieu dans les yeux des gens est indescriptible.',
    location: 'Bangui',
  },
];

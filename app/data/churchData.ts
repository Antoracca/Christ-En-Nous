export interface Leader {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
  email?: string;
}

export interface Department {
  id: string;
  name: string;
  description: string;
  leader: string;
  meetingTime: string;
  image: string;
  icon: string;
  color: string;
}

export interface WeeklyEvent {
  id: string;
  day: string;
  events: {
    time: string;
    title: string;
    location: string;
    type: 'Culte' | 'Enseignement' | 'Prière' | 'Répétition';
  }[];
}

export const CHURCH_INFO = {
  name: 'Christ En Nous',
  slogan: 'Une famille pour vous, une armée pour Dieu.',
  vision: 'Bâtir une communauté de disciples affermis, remplis de l\'Esprit, transformant leur génération par l\'amour et la puissance de l\'Évangile.',
  mission: 'Évangéliser les perdus, Édifier les croyants, Équiper les ouvriers, Envoyer les missionnaires.',
  address: 'Avenue des Martyrs, Bangui, RCA',
  phone: '+236 75 00 00 00',
  email: 'contact@christennous.org',
  mainImage: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800',
};

export const LEADERS: Leader[] = [
  {
    id: '1',
    name: 'Pasteur Principal',
    role: 'Visionnaire',
    bio: 'Serviteur de Dieu depuis plus de 20 ans, le Pasteur porte la vision de Christ En Nous avec passion et intégrité. Son enseignement est centré sur la grâce et la transformation.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    email: 'pasteur@christennous.org'
  },
  {
    id: '2',
    name: 'Maman Pasteur',
    role: 'Responsable des Femmes',
    bio: 'Une mère pour la communauté, elle dirige le ministère des Femmes de Distinction avec sagesse et douceur.',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
  },
  {
    id: '3',
    name: 'Pasteur Jeunesse',
    role: 'Markos Leader',
    bio: 'Dynamique et proche des jeunes, il inspire la nouvelle génération à vivre pour Christ sans compromis.',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
  }
];

export const DEPARTMENTS: Department[] = [
  {
    id: '1',
    name: 'Hommes de Valeur',
    description: 'Bâtir des hommes intègres, pères responsables et leaders spirituels.',
    leader: 'Ancien Pierre',
    meetingTime: 'Mardi 18h00',
    image: 'https://images.unsplash.com/photo-1503443207922-dff7d543fd0e?w=400',
    icon: 'shield',
    color: '#1E3A8A'
  },
  {
    id: '2',
    name: 'Femmes de Distinction',
    description: 'Un espace d\'épanouissement et de soutien mutuel pour toutes les femmes.',
    leader: 'Maman Pasteur',
    meetingTime: 'Jeudi 17h30',
    image: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=400',
    icon: 'heart',
    color: '#BE185D'
  },
  {
    id: '3',
    name: 'École du Dimanche',
    description: 'Enseigner les voies du Seigneur aux enfants dès le bas âge.',
    leader: 'Sœur Claire',
    meetingTime: 'Dimanche 08h00',
    image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400',
    icon: 'smile',
    color: '#F59E0B'
  },
  {
    id: '4',
    name: 'Protocole & Accueil',
    description: 'L\'excellence dans le service et l\'hospitalité dans la maison de Dieu.',
    leader: 'Diacre Jean',
    meetingTime: 'Samedi 16h00',
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400',
    icon: 'user-check',
    color: '#059669'
  }
];

export const WEEKLY_PROGRAM: WeeklyEvent[] = [
  {
    id: '1',
    day: 'Dimanche',
    events: [
      { time: '08:00 - 10:00', title: 'Premier Culte', location: 'Grand Temple', type: 'Culte' },
      { time: '10:30 - 12:30', title: 'Second Culte', location: 'Grand Temple', type: 'Culte' },
    ]
  },
  {
    id: '2',
    day: 'Mardi',
    events: [
      { time: '18:00 - 19:30', title: 'Enseignement Biblique', location: 'Grand Temple', type: 'Enseignement' },
    ]
  },
  {
    id: '3',
    day: 'Jeudi',
    events: [
      { time: '18:00 - 19:30', title: 'Intercession & Délivrance', location: 'Grand Temple', type: 'Prière' },
    ]
  },
  {
    id: '4',
    day: 'Samedi',
    events: [
      { time: '16:00 - 18:00', title: 'Répétition Chorale', location: 'Salle Annexe', type: 'Répétition' },
      { time: '17:00 - 19:00', title: 'Réunion Jeunesse (Markos)', location: 'Salle Polyvalente', type: 'Enseignement' },
    ]
  }
];

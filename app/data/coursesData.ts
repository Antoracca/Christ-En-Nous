import { MaterialCommunityIcons } from '@expo/vector-icons';

export type CourseLevel = 'Débutant' | 'Intermédiaire' | 'Avancé' | 'Ministre';

export interface Module {
  id: string;
  title: string;
  duration: string;
  type: 'video' | 'text' | 'quiz' | 'assignment';
  isCompleted: boolean;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  level: CourseLevel;
  duration: string;
  image: string; // URL ou require
  category: string;
  modules: Module[];
  progress: number;
}

export interface CourseCategory {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
  courses: Course[];
}

export const COURSES_DATA: CourseCategory[] = [
  {
    id: 'fondements',
    title: 'Fondements & Affirmation',
    description: 'Les bases solides de la foi chrétienne et l\'engagement.',
    icon: 'foundation',
    color: '#0EA5E9', // Indigo
    courses: [
      {
        id: 'f1',
        title: 'Initiation au Baptême',
        description: 'Comprendre le sens de l\'engagement, la mort et la résurrection avec Christ. Préparation aux eaux.',
        instructor: 'Pasteur Principal',
        level: 'Débutant',
        duration: '4 semaines',
        image: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?w=500&q=80',
        category: 'fondements',
        progress: 0,
        modules: [
          { id: 'm1', title: 'Pourquoi le baptême ?', duration: '45 min', type: 'video', isCompleted: false },
          { id: 'm2', title: 'Le témoignage public', duration: '30 min', type: 'text', isCompleted: false },
        ]
      },
      {
        id: 'f2',
        title: 'Cours d\'Affirmation de la Foi',
        description: 'Pour ceux qui veulent consolider leurs certitudes et apprendre à défendre leur foi.',
        instructor: 'Équipe Pastorale',
        level: 'Intermédiaire',
        duration: '6 semaines',
        image: 'https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?w=500&q=80',
        category: 'fondements',
        progress: 0,
        modules: []
      }
    ]
  },
  {
    id: 'disciple',
    title: 'Parcours du Disciple',
    description: 'Grandir à la ressemblance de Christ au quotidien.',
    icon: 'account-group',
    color: '#10B981', // Emerald
    courses: [
      {
        id: 'd1',
        title: 'La vie de prière',
        description: 'Développer une intimité profonde avec le Père.',
        instructor: 'Responsable Prière',
        level: 'Tous niveaux',
        duration: '3 semaines',
        image: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=500&q=80',
        category: 'disciple',
        progress: 35,
        modules: []
      }
    ]
  },
  {
    id: 'ministere',
    title: 'École des Ministères (Éphésiens 4:11)',
    description: 'Formation théologique et pratique pour l\'appel apostolique.',
    icon: 'crown', // Ou 'fire'
    color: '#F59E0B', // Amber/Gold
    courses: [
      {
        id: 'min1',
        title: 'Formation Apostolique',
        description: 'Bâtir, planter et gouverner selon le modèle divin. Comprendre l\'architecture de l\'église.',
        instructor: 'Apôtre Visionnaire',
        level: 'Ministre',
        duration: '12 mois',
        image: 'https://images.unsplash.com/photo-1462206092226-f46025ffe607?w=500&q=80',
        category: 'ministere',
        progress: 0,
        modules: []
      },
      {
        id: 'min2',
        title: 'École des Prophètes',
        description: 'Entendre la voix de Dieu, discerner les temps et communiquer le cœur du Père.',
        instructor: 'Prophète Senior',
        level: 'Avancé',
        duration: '9 mois',
        image: 'https://images.unsplash.com/photo-1490127252417-7c393f993ee4?w=500&q=80',
        category: 'ministere',
        progress: 0,
        modules: []
      },
      {
        id: 'min3',
        title: 'Ministère Pastoral',
        description: 'Prendre soin des brebis, relation d\'aide et accompagnement des âmes.',
        instructor: 'Pasteur Associé',
        level: 'Ministre',
        duration: '12 mois',
        image: 'https://images.unsplash.com/photo-1470116073782-48ae2447109b?w=500&q=80',
        category: 'ministere',
        progress: 0,
        modules: []
      },
      {
        id: 'min4',
        title: 'L\'Évangéliste',
        description: 'Gagner des âmes, puissance du Saint-Esprit et démonstration de puissance.',
        instructor: 'Évangéliste International',
        level: 'Avancé',
        duration: '6 mois',
        image: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=500&q=80',
        category: 'ministere',
        progress: 0,
        modules: []
      },
      {
        id: 'min5',
        title: 'Docteur de la Bible',
        description: 'Exégèse, herméneutique et profondeur de la Parole. Enseigner la saine doctrine.',
        instructor: 'Docteur en Théologie',
        level: 'Expert',
        duration: '2 ans',
        image: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=500&q=80',
        category: 'ministere',
        progress: 0,
        modules: []
      }
    ]
  },
  {
    id: 'service',
    title: 'Académie des Serviteurs',
    description: 'L\'excellence dans le service pratique au sein de la maison.',
    icon: 'hand-heart',
    color: '#EC4899', // Pink/Rose
    courses: [
      {
        id: 'srv1',
        title: 'Louange & Cantique Nouveau',
        description: 'Pour les chantres et musiciens. Technique vocale, spiritualité de l\'adoration et flow prophétique.',
        instructor: 'Chef de Chœur',
        level: 'Intermédiaire',
        duration: 'Continu',
        image: 'https://images.unsplash.com/photo-1516280440614-6697288d5d38?w=500&q=80',
        category: 'service',
        progress: 0,
        modules: []
      },
      {
        id: 'srv2',
        title: 'Média & Communication',
        description: 'Photographie, vidéo, régie, streaming. L\'évangile par l\'image.',
        instructor: 'Dir. Communication',
        level: 'Tous niveaux',
        duration: '3 mois',
        image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&q=80',
        category: 'service',
        progress: 0,
        modules: []
      },
      {
        id: 'srv3',
        title: 'Protocole & Accueil',
        description: 'L\'art de recevoir comme Christ. Gestion des foules et excellence.',
        instructor: 'Chef du Protocole',
        level: 'Débutant',
        duration: '1 mois',
        image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=500&q=80',
        category: 'service',
        progress: 0,
        modules: []
      },
      {
        id: 'srv4',
        title: 'Logistique & Intendance',
        description: 'Organisation, technique et gestion pratique des événements.',
        instructor: 'Resp. Logistique',
        level: 'Débutant',
        duration: '1 mois',
        image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500&q=80',
        category: 'service',
        progress: 0,
        modules: []
      }
    ]
  }
];

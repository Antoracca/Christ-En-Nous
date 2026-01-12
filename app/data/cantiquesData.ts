// app/data/cantiquesData.ts
// Données des cantiques avec support bilingue Français/Sango

export interface Cantique {
  id: string;
  title: {
    fr: string;
    sg: string; // Sango
  };
  composer: string;
  category: 'adoration' | 'louange' | 'cantique' | 'nouveau';
  image: string;
  audioUrl?: string;
  duration: string;
  lyrics?: {
    fr: string[];
    sg: string[];
  };
  album?: string;
  releaseYear?: number;
  isFavorite?: boolean;
}

export interface CantiqueCategory {
  id: string;
  name: {
    fr: string;
    sg: string;
  };
  description: {
    fr: string;
    sg: string;
  };
  icon: string;
  color: string;
}

export const CATEGORIES: CantiqueCategory[] = [
  {
    id: 'adoration',
    name: {
      fr: 'Adorations',
      sg: 'Palɛ na Nzapä',
    },
    description: {
      fr: 'Cantiques d\'adoration profonde',
      sg: 'Alɛngɔ tî palɛ na Nzapä',
    },
    icon: 'heart',
    color: '#EC4899',
  },
  {
    id: 'louange',
    name: {
      fr: 'Louange',
      sg: 'Zɔngɔ tî Nzapä',
    },
    description: {
      fr: 'Chants de louange et célébration',
      sg: 'Alɛngɔ tî zɔngɔ na lɛkɛngɛ',
    },
    icon: 'music',
    color: '#F59E0B',
  },
  {
    id: 'cantique',
    name: {
      fr: 'Cantiques',
      sg: 'Alɛngɔ tî Lɛgbɛya',
    },
    description: {
      fr: 'Cantiques classiques et traditionnels',
      sg: 'Alɛngɔ tî kɔbɛla',
    },
    icon: 'book-open',
    color: '#3B82F6',
  },
  {
    id: 'nouveau',
    name: {
      fr: 'Nouveaux Morceaux',
      sg: 'Alɛngɔ Kuɛ',
    },
    description: {
      fr: 'Les derniers cantiques ajoutés',
      sg: 'Alɛngɔ tî sïönï',
    },
    icon: 'star',
    color: '#10B981',
  },
];

export const CANTIQUES_DATA: Cantique[] = [
  {
    id: '1',
    title: {
      fr: 'Jésus, Mon Roi',
      sg: 'Yesu, Kɔbɛla Tî Mbi',
    },
    composer: 'Ministère Cantiques Nouveaux',
    category: 'adoration',
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400',
    duration: '4:32',
    album: 'Adorons Le Roi',
    releaseYear: 2024,
    lyrics: {
      fr: [
        'Jésus, mon Roi, je t\'adore',
        'Dans ta présence, je trouve la paix',
        'Tu es mon refuge, ma forteresse',
        'Mon Sauveur, mon Rédempteur',
      ],
      sg: [
        'Yesu, Kɔbɛla tî mbi, ma palɛ mo',
        'Na kɔlɔ na mo, ma yeke na hɔrɔ',
        'Mo yeke ndako tî mbi, ngbɔngbɔ tî mbi',
        'Molɔngɔ̈ tî mbi, Molimbî tî mbi',
      ],
    },
  },
  {
    id: '2',
    title: {
      fr: 'Chantons à l\'Éternel',
      sg: 'Tene Lɛngɔ na Nzapä',
    },
    composer: 'Chorale CEN',
    category: 'louange',
    image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400',
    duration: '5:15',
    album: 'Joie du Seigneur',
    releaseYear: 2023,
    lyrics: {
      fr: [
        'Chantons à l\'Éternel un cantique nouveau',
        'Car il a fait des merveilles',
        'Sa droite et son bras saint l\'ont secouru',
        'Alléluia, Alléluia',
      ],
      sg: [
        'Tene lɛngɔ kuɛ na Nzapä',
        'Nzönî ï sɛ̈ kɔbɛla',
        'Kɔlɔ tî ï na koli tî ï sɛ̈ molɔngɔ̈ tî ï',
        'Aleluya, Aleluya',
      ],
    },
  },
  {
    id: '3',
    title: {
      fr: 'Dans Ta Maison',
      sg: 'Na Da Tî Mo',
    },
    composer: 'Pasteur Jean',
    category: 'cantique',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    duration: '3:45',
    album: 'Sanctuaire',
    releaseYear: 2022,
    lyrics: {
      fr: [
        'Dans ta maison, Seigneur',
        'Je viens t\'adorer',
        'Mon cœur est rempli de ta gloire',
        'Je lève mes mains vers toi',
      ],
      sg: [
        'Na da tî mo, Kɔbɛla',
        'Ma yeke na palɛ mo',
        'Kɔlɔ tî mbi yeke na nzönî tî mo',
        'Ma tɔngɔ mabɔkɔ tî mbi na mo',
      ],
    },
  },
  {
    id: '4',
    title: {
      fr: 'Esprit Saint, Viens',
      sg: 'Yɛ̈ Tî Nzapä, Gä',
    },
    composer: 'Ministère Cantiques Nouveaux',
    category: 'nouveau',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
    duration: '6:20',
    album: 'Présence Divine',
    releaseYear: 2024,
    lyrics: {
      fr: [
        'Esprit Saint, viens nous remplir',
        'De ta puissance et de ta gloire',
        'Transforme nos cœurs, renouvelle nos vies',
        'Que ton feu brûle en nous',
      ],
      sg: [
        'Yɛ̈ tî Nzapä, gä töndo ë',
        'Na ngunga na nzönî tî mo',
        'Fadɛsɔ kɔlɔ tî ë, fadɛsɔ nzönî tî ë',
        'Wä tî mo yeke na tûtû na ë',
      ],
    },
  },
  {
    id: '5',
    title: {
      fr: 'Gloire au Roi des Rois',
      sg: 'Nzönî na Kɔbɛla Tî Akɔbɛla',
    },
    composer: 'Groupe de Louange',
    category: 'louange',
    image: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400',
    duration: '4:50',
    album: 'Majesté',
    releaseYear: 2023,
    lyrics: {
      fr: [
        'Gloire au Roi des rois',
        'Seigneur de tous les seigneurs',
        'Tu règnes avec puissance',
        'Pour toujours et à jamais',
      ],
      sg: [
        'Nzönî na Kɔbɛla tî akɔbɛla',
        'Kɔbɛla tî akɔbɛla kɔ̈kɔ̈',
        'Mo yeke na kua na ngunga',
        'Na lɛngɔ kɔ̈kɔ̈',
      ],
    },
  },
  {
    id: '6',
    title: {
      fr: 'Mon Sauveur M\'aime',
      sg: 'Molɔngɔ̈ Tî Mbi Yeke Na Lɛ̈ngɔ Mbi',
    },
    composer: 'Sœur Marie',
    category: 'adoration',
    image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400',
    duration: '5:05',
    album: 'Amour Divin',
    releaseYear: 2024,
    lyrics: {
      fr: [
        'Mon Sauveur m\'aime d\'un amour éternel',
        'Il a donné sa vie pour moi',
        'Sur la croix, il m\'a racheté',
        'Je suis à lui pour toujours',
      ],
      sg: [
        'Molɔngɔ̈ tî mbi yeke na lɛ̈ngɔ mbi na lɛ̈ngɔ tî lɛngɔ kɔ̈kɔ̈',
        'Ï fɛ nzönî tî ï tî mbi',
        'Na gbatä, ï vängɔ mbi',
        'Ma yeke tî ï na lɛngɔ kɔ̈kɔ̈',
      ],
    },
  },
  {
    id: '7',
    title: {
      fr: 'Alléluia à Notre Dieu',
      sg: 'Aleluya na Nzapä Tî Ë',
    },
    composer: 'Chorale CEN',
    category: 'louange',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400',
    duration: '3:30',
    album: 'Célébration',
    releaseYear: 2023,
    lyrics: {
      fr: [
        'Alléluia à notre Dieu',
        'Il est digne de toute louange',
        'Du ciel à la terre, son nom est exalté',
        'Gloire à l\'Agneau sur le trône',
      ],
      sg: [
        'Aleluya na Nzapä tî ë',
        'Ï yeke na lɛ̈ngɔ na zɔngɔ kɔ̈kɔ̈',
        'Ti na ngu tîi na kɔbɛ, iri tî ï yeke na nzönî',
        'Nzönî na Nyama na gbɛtɛrɛsɛsɛ',
      ],
    },
  },
  {
    id: '8',
    title: {
      fr: 'Ton Amour Me Suffit',
      sg: 'Lɛ̈ngɔ Tî Mo Yeke Na Kamä Na Mbi',
    },
    composer: 'Ministère Cantiques Nouveaux',
    category: 'nouveau',
    image: 'https://images.unsplash.com/photo-1445985543470-41fba5c3144a?w=400',
    duration: '4:15',
    album: 'Grâce Suffisante',
    releaseYear: 2024,
    lyrics: {
      fr: [
        'Ton amour me suffit, Seigneur',
        'Ta grâce est ma force',
        'Dans ma faiblesse, tu me rends fort',
        'Je me confie en toi',
      ],
      sg: [
        'Lɛ̈ngɔ tî mo yeke na kamä na mbi, Kɔbɛla',
        'Hɔrɔ tî mo yeke ngunga tî mbi',
        'Na molɛngɛ tî mbi, mo sɛ̈ mbi ngunga',
        'Ma yeke na tɛnɛ na mo',
      ],
    },
  },
];

export const MINISTRY_INFO = {
  title: {
    fr: 'Rejoignez le Ministère Cantiques Nouveaux',
    sg: 'Zɔ̈ Na Lɛkua Tî Alɛngɔ Kuɛ',
  },
  description: {
    fr: 'Le Ministère Cantiques Nouveaux de Christ En Nous est dédié à la louange et à l\'adoration à travers la musique. Nous croyons que la musique est un moyen puissant de toucher les cœurs et d\'élever l\'âme vers Dieu.',
    sg: 'Lɛkua tî Alɛngɔ Kuɛ tî Christ En Nous yeke na palɛ na zɔngɔ na Nzapä na nzɛlɛ tî lɛngɔ. Ë yeke na tɛnɛ tî lɛngɔ yeke ngunga tî tɔngɔ kɔlɔ na fadɛsɔ sɛ̈ɛ̈ na kɔbɛ na Nzapä.',
  },
  mission: {
    fr: 'Notre mission est de créer des cantiques nouveaux qui glorifient Dieu et édifient l\'Église. Nous recherchons des musiciens, chanteurs, paroliers et techniciens passionnés pour rejoindre notre équipe.',
    sg: 'Kua tî ë yeke tî sɛ̈ alɛngɔ kuɛ tî tene nzönî na Nzapä na tɔngɔ Lɛgbɛya. Ë yeke na kɔbɛ alɛngɔbɛngɔ, atene-lɛngɔ, asɛ̈-lɛngɔ na atɛnɛkɛ tî yeke na lɛ̈ngɔ tî zɔ̈ na gbïä tî ë.',
  },
  benefits: {
    fr: [
      'Formation musicale et spirituelle',
      'Participation aux enregistrements',
      'Concerts et événements spéciaux',
      'Communion fraternelle',
      'Croissance spirituelle',
    ],
    sg: [
      'Fadesɔ na lɛngɔ na yɛ̈ tî Nzapä',
      'Zɔ̈ na sɛ̈ lɛngɔ',
      'Lɛngɔ na akua-kɔbɛla',
      'Zɔ̈ kɔlɔ ɔkɔ na ɔkɔ',
      'Gɔrɔ na yɛ̈ tî Nzapä',
    ],
  },
  questions: {
    fr: [
      {
        id: 'name',
        question: 'Quel est votre nom complet ?',
        type: 'text',
        required: true,
      },
      {
        id: 'phone',
        question: 'Numéro de téléphone',
        type: 'phone',
        required: true,
      },
      {
        id: 'email',
        question: 'Adresse email',
        type: 'email',
        required: false,
      },
      {
        id: 'talent',
        question: 'Quel est votre talent musical ?',
        type: 'select',
        options: ['Chant', 'Guitare', 'Piano', 'Batterie', 'Basse', 'Parolier', 'Compositeur', 'Technicien son', 'Autre'],
        required: true,
      },
      {
        id: 'experience',
        question: 'Quelle est votre expérience musicale ?',
        type: 'select',
        options: ['Débutant', 'Intermédiaire', 'Avancé', 'Professionnel'],
        required: true,
      },
      {
        id: 'availability',
        question: 'Quelle est votre disponibilité ?',
        type: 'multiselect',
        options: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'],
        required: true,
      },
      {
        id: 'motivation',
        question: 'Pourquoi souhaitez-vous rejoindre ce ministère ?',
        type: 'textarea',
        required: true,
      },
    ],
    sg: [
      {
        id: 'name',
        question: 'Iri tî mo yeke nɛ̈nɛ ?',
        type: 'text',
        required: true,
      },
      {
        id: 'phone',
        question: 'Nimɛro tî terefɔnɛ',
        type: 'phone',
        required: true,
      },
      {
        id: 'email',
        question: 'Adrɛsɛ email',
        type: 'email',
        required: false,
      },
      {
        id: 'talent',
        question: 'Lɛkua tî lɛngɔ tî mo yeke nɛ̈nɛ ?',
        type: 'select',
        options: ['Tene lɛngɔ', 'Gitarɛ', 'Piano', 'Batri', 'Basɛ', 'Sɛ̈ lɛngɔ', 'Sɛ̈ lɛngɔ kuɛ', 'Tɛnɛkɛ', 'Ôko'],
        required: true,
      },
      {
        id: 'experience',
        question: 'Fadɛsɔ tî mo na lɛngɔ yeke nɛ̈nɛ ?',
        type: 'select',
        options: ['Kutakutä', 'Kɔlɔ', 'Gɔrɔ', 'Molɛngɛ-kua'],
        required: true,
      },
      {
        id: 'availability',
        question: 'Lɛngɔ tî mo yeke na nɛ̈nɛ ?',
        type: 'multiselect',
        options: ['Lɔndɔ', 'Mabïä', 'Kɔrɔ', 'Sagasɛrɛ', 'Birä', 'Ndönɔsɔ', 'Bikua-ɔkɔ'],
        required: true,
      },
      {
        id: 'motivation',
        question: 'Tongana nɛ̈nɛ mo yeke na lɛ̈ngɔ tî zɔ̈ na lɛkua so ?',
        type: 'textarea',
        required: true,
      },
    ],
  },
};

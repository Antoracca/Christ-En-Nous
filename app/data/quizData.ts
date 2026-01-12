// Types et données pour les Quiz Markos

export type QuizStatus = 'live' | 'upcoming' | 'finished' | 'waiting';
export type QuizTopic = 'Bible' | 'Culture' | 'Histoire' | 'Géographie' | 'Science' | 'Musique' | 'Sport' | 'Général';
export type Difficulty = 'Facile' | 'Moyen' | 'Difficile' | 'Expert';
export type ReactionType = 'fire' | 'clap' | 'heart' | 'laugh' | 'wow' | 'correct';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // Index de la bonne réponse
  points: number;
  timeLimit: number; // En secondes
  explanation?: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  topic: QuizTopic;
  difficulty: Difficulty;
  status: QuizStatus;
  questions: QuizQuestion[];
  duration: number; // Durée totale en secondes
  xpReward: number;
  participants: number;
  startTime?: string;
  createdAt: string;
  image?: string;
  category: string;
}

export interface QuizParticipant {
  id: string;
  name: string;
  avatar: string;
  score: number;
  xpEarned: number;
  combo: number;
  currentQuestion: number;
  isActive: boolean;
  joinedAt: string;
}

export interface QuizReaction {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  type: ReactionType;
  timestamp: number;
  questionId?: string;
}

export interface QuizSession {
  quiz: Quiz;
  participants: QuizParticipant[];
  currentQuestionIndex: number;
  startTime: number;
  endTime?: number;
  reactions: QuizReaction[];
  leaderboard: QuizParticipant[];
}

// Données mockées des quiz
export const QUIZ_QUESTIONS: Record<string, QuizQuestion[]> = {
  'daniel': [
    {
      id: 'q1',
      question: 'Dans quelle année Daniel a-t-il été emmené en captivité à Babylone ?',
      options: ['605 av. J.-C.', '587 av. J.-C.', '539 av. J.-C.', '520 av. J.-C.'],
      correctAnswer: 0,
      points: 10,
      timeLimit: 15,
      explanation: 'Daniel fut emmené en captivité en 605 av. J.-C. lors de la première déportation sous le règne de Nebucadnetsar.'
    },
    {
      id: 'q2',
      question: 'Quel était le nom babylonien donné à Daniel ?',
      options: ['Belteschazzar', 'Schadrac', 'Méschac', 'Abed-Nego'],
      correctAnswer: 0,
      points: 10,
      timeLimit: 12,
      explanation: 'Daniel reçut le nom de Belteschazzar, qui signifie "protège sa vie" ou "Bel protège le roi".'
    },
    {
      id: 'q3',
      question: 'Combien de compagnons de Daniel ont été jetés dans la fournaise ardente ?',
      options: ['2', '3', '4', '5'],
      correctAnswer: 1,
      points: 10,
      timeLimit: 10,
      explanation: 'Schadrac, Méschac et Abed-Nego furent jetés dans la fournaise ardente pour avoir refusé d\'adorer la statue d\'or.'
    },
    {
      id: 'q4',
      question: 'Quel roi a vu l\'écriture sur le mur lors d\'un festin ?',
      options: ['Nebucadnetsar', 'Belschatsar', 'Darius', 'Cyrus'],
      correctAnswer: 1,
      points: 15,
      timeLimit: 12,
      explanation: 'Belschatsar, le dernier roi de Babylone, vit l\'écriture sur le mur prophétisant la chute de son royaume.'
    },
    {
      id: 'q5',
      question: 'Dans quelle fosse Daniel a-t-il été jeté ?',
      options: ['Fosse aux serpents', 'Fosse aux lions', 'Fosse aux ours', 'Fosse aux tigres'],
      correctAnswer: 1,
      points: 10,
      timeLimit: 10,
      explanation: 'Daniel fut jeté dans la fosse aux lions par le roi Darius, mais Dieu ferma la gueule des lions.'
    },
    {
      id: 'q6',
      question: 'Combien de chapitres contient le livre de Daniel ?',
      options: ['10', '12', '14', '16'],
      correctAnswer: 1,
      points: 10,
      timeLimit: 8,
      explanation: 'Le livre de Daniel contient 12 chapitres, divisés en récits historiques (1-6) et visions prophétiques (7-12).'
    },
    {
      id: 'q7',
      question: 'Quelle était la première vision de Daniel concernant les quatre bêtes ?',
      options: ['Les quatre royaumes', 'Les soixante-dix semaines', 'Le bélier et le bouc', 'Le jugement final'],
      correctAnswer: 0,
      points: 15,
      timeLimit: 15,
      explanation: 'La première vision majeure de Daniel concernait les quatre bêtes représentant quatre royaumes successifs.'
    },
    {
      id: 'q8',
      question: 'Quel aliment Daniel et ses compagnons refusaient-ils de manger ?',
      options: ['La viande de porc', 'La nourriture du roi', 'Le poisson', 'Le pain'],
      correctAnswer: 1,
      points: 10,
      timeLimit: 10,
      explanation: 'Daniel et ses compagnons refusaient la nourriture et le vin du roi pour rester purs selon la loi de Moïse.'
    },
  ],
  'rca': [
    {
      id: 'q1',
      question: 'Quelle est la capitale de la République Centrafricaine ?',
      options: ['Bangui', 'Bouar', 'Bambari', 'Bossangoa'],
      correctAnswer: 0,
      points: 10,
      timeLimit: 10,
    },
    {
      id: 'q2',
      question: 'En quelle année la RCA a-t-elle obtenu son indépendance ?',
      options: ['1958', '1960', '1962', '1964'],
      correctAnswer: 1,
      points: 15,
      timeLimit: 12,
    },
    {
      id: 'q3',
      question: 'Quel est le nom du premier président de la RCA ?',
      options: ['David Dacko', 'Barthélemy Boganda', 'Jean-Bédel Bokassa', 'Ange-Félix Patassé'],
      correctAnswer: 1,
      points: 15,
      timeLimit: 15,
    },
  ],
  'bible-general': [
    {
      id: 'q1',
      question: 'Combien de livres contient la Bible ?',
      options: ['64', '66', '68', '70'],
      correctAnswer: 1,
      points: 10,
      timeLimit: 10,
    },
    {
      id: 'q2',
      question: 'Quel est le premier livre de la Bible ?',
      options: ['Exode', 'Genèse', 'Lévitique', 'Nombres'],
      correctAnswer: 1,
      points: 10,
      timeLimit: 8,
    },
  ],
};

export const AVAILABLE_QUIZZES: Quiz[] = [
  {
    id: 'daniel',
    title: 'Le Livre de Daniel',
    description: 'Testez vos connaissances sur le prophète Daniel et ses visions',
    topic: 'Bible',
    difficulty: 'Moyen',
    status: 'live',
    questions: QUIZ_QUESTIONS['daniel'],
    duration: 120, // 2 minutes
    xpReward: 500,
    participants: 34,
    createdAt: new Date().toISOString(),
    category: 'Ancien Testament',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500',
  },
  {
    id: 'rca',
    title: 'Histoire de la RCA',
    description: 'Découvrez l\'histoire riche de la République Centrafricaine',
    topic: 'Culture',
    difficulty: 'Moyen',
    status: 'upcoming',
    questions: QUIZ_QUESTIONS['rca'],
    duration: 90,
    xpReward: 300,
    participants: 156,
    startTime: '19:00',
    createdAt: new Date().toISOString(),
    category: 'Histoire',
  },
  {
    id: 'bible-general',
    title: 'Bible Générale',
    description: 'Questions générales sur la Bible',
    topic: 'Bible',
    difficulty: 'Facile',
    status: 'waiting',
    questions: QUIZ_QUESTIONS['bible-general'],
    duration: 60,
    xpReward: 200,
    participants: 0,
    createdAt: new Date().toISOString(),
    category: 'Général',
  },
  {
    id: 'geographie-afrique',
    title: 'Géographie de l\'Afrique',
    description: 'Connaissez-vous les capitales et pays africains ?',
    topic: 'Géographie',
    difficulty: 'Moyen',
    status: 'waiting',
    questions: [
      {
        id: 'q1',
        question: 'Quelle est la capitale du Sénégal ?',
        options: ['Dakar', 'Bamako', 'Conakry', 'Abidjan'],
        correctAnswer: 0,
        points: 10,
        timeLimit: 10,
      },
    ],
    duration: 90,
    xpReward: 250,
    participants: 0,
    createdAt: new Date().toISOString(),
    category: 'Géographie',
  },
  {
    id: 'musique-gospel',
    title: 'Musique Gospel',
    description: 'Testez vos connaissances sur la musique chrétienne',
    topic: 'Musique',
    difficulty: 'Facile',
    status: 'waiting',
    questions: [
      {
        id: 'q1',
        question: 'Quel est le nom de l\'hymne "Amazing Grace" en français ?',
        options: ['Grâce Étonnante', 'Grâce Infinie', 'Grâce Parfaite', 'Grâce Divine'],
        correctAnswer: 0,
        points: 10,
        timeLimit: 12,
      },
    ],
    duration: 75,
    xpReward: 200,
    participants: 0,
    createdAt: new Date().toISOString(),
    category: 'Musique',
  },
];

// Participants mockés
export const MOCK_PARTICIPANTS: QuizParticipant[] = [
  {
    id: 'user1',
    name: 'Sarah K.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    score: 85,
    xpEarned: 425,
    combo: 3,
    currentQuestion: 5,
    isActive: true,
    joinedAt: new Date(Date.now() - 30000).toISOString(),
  },
  {
    id: 'user2',
    name: 'David M.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    score: 75,
    xpEarned: 375,
    combo: 2,
    currentQuestion: 5,
    isActive: true,
    joinedAt: new Date(Date.now() - 25000).toISOString(),
  },
  {
    id: 'user3',
    name: 'Marie Grace',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    score: 70,
    xpEarned: 350,
    combo: 1,
    currentQuestion: 4,
    isActive: true,
    joinedAt: new Date(Date.now() - 20000).toISOString(),
  },
];

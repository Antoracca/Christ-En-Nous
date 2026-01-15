// app/services/meditation/dailySuggestionService.ts
// Service de suggestions quotidiennes pour la méditation

export interface DailySuggestion {
  book: string;        // Code OSIS (GEN, MAT, etc.)
  bookName: string;    // Nom français
  chapter: number;
  verse: number;
  text: string;        // Texte du verset
  reference: string;   // Référence complète (ex: "Jean 3:16")
}

// 10 versets puissants pour la méditation quotidienne
const DAILY_SUGGESTIONS: DailySuggestion[] = [
  {
    book: 'JHN',
    bookName: 'Jean',
    chapter: 3,
    verse: 16,
    text: "Car Dieu a tant aimé le monde qu'il a donné son Fils unique, afin que quiconque croit en lui ne périsse point, mais qu'il ait la vie éternelle.",
    reference: 'Jean 3:16'
  },
  {
    book: 'PSA',
    bookName: 'Psaumes',
    chapter: 23,
    verse: 1,
    text: "L'Éternel est mon berger : je ne manquerai de rien. Il me fait reposer dans de verts pâturages, Il me dirige près des eaux paisibles.",
    reference: 'Psaumes 23:1'
  },
  {
    book: 'ROM',
    bookName: 'Romains',
    chapter: 8,
    verse: 28,
    text: "Nous savons, du reste, que toutes choses concourent au bien de ceux qui aiment Dieu, de ceux qui sont appelés selon son dessein.",
    reference: 'Romains 8:28'
  },
  {
    book: 'PHP',
    bookName: 'Philippiens',
    chapter: 4,
    verse: 6,
    text: "Ne vous inquiétez de rien; mais en toute chose faites connaître vos besoins à Dieu par des prières et des supplications, avec des actions de grâces.",
    reference: 'Philippiens 4:6'
  },
  {
    book: 'PRO',
    bookName: 'Proverbes',
    chapter: 3,
    verse: 5,
    text: "Confie-toi en l'Éternel de tout ton cœur, Et ne t'appuie pas sur ta sagesse; Reconnais-le dans toutes tes voies, Et il aplanira tes sentiers.",
    reference: 'Proverbes 3:5'
  },
  {
    book: 'ISA',
    bookName: 'Ésaïe',
    chapter: 40,
    verse: 31,
    text: "Mais ceux qui se confient en l'Éternel renouvellent leur force. Ils prennent le vol comme les aigles; Ils courent, et ne se lassent point, Ils marchent, et ne se fatiguent point.",
    reference: 'Ésaïe 40:31'
  },
  {
    book: 'MAT',
    bookName: 'Matthieu',
    chapter: 6,
    verse: 33,
    text: "Cherchez premièrement le royaume et la justice de Dieu; et toutes ces choses vous seront données par-dessus.",
    reference: 'Matthieu 6:33'
  },
  {
    book: 'JER',
    bookName: 'Jérémie',
    chapter: 29,
    verse: 11,
    text: "Car je connais les projets que j'ai formés sur vous, dit l'Éternel, projets de paix et non de malheur, afin de vous donner un avenir et de l'espérance.",
    reference: 'Jérémie 29:11'
  },
  {
    book: '1CO',
    bookName: '1 Corinthiens',
    chapter: 13,
    verse: 4,
    text: "La charité est patiente, elle est pleine de bonté; la charité n'est point envieuse; la charité ne se vante point, elle ne s'enfle point d'orgueil.",
    reference: '1 Corinthiens 13:4'
  },
  {
    book: 'EPH',
    bookName: 'Éphésiens',
    chapter: 2,
    verse: 8,
    text: "Car c'est par la grâce que vous êtes sauvés, par le moyen de la foi. Et cela ne vient pas de vous, c'est le don de Dieu.",
    reference: 'Éphésiens 2:8'
  }
];

class DailySuggestionService {
  /**
   * Obtenir la suggestion du jour basée sur la date
   * Change automatiquement chaque jour
   */
  getTodaySuggestion(): DailySuggestion {
    const today = new Date();
    const dayOfYear = this.getDayOfYear(today);

    // Utiliser le jour de l'année modulo le nombre de suggestions
    // Cela garantit une rotation prévisible mais qui change chaque jour
    const index = dayOfYear % DAILY_SUGGESTIONS.length;

    return DAILY_SUGGESTIONS[index];
  }

  /**
   * Calculer le jour de l'année (1-366)
   */
  private getDayOfYear(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  }

  /**
   * Obtenir toutes les suggestions (pour debug/admin)
   */
  getAllSuggestions(): DailySuggestion[] {
    return [...DAILY_SUGGESTIONS];
  }

  /**
   * Prévisualiser la suggestion pour une date spécifique
   */
  getSuggestionForDate(date: Date): DailySuggestion {
    const dayOfYear = this.getDayOfYear(date);
    const index = dayOfYear % DAILY_SUGGESTIONS.length;
    return DAILY_SUGGESTIONS[index];
  }
}

export const dailySuggestionService = new DailySuggestionService();

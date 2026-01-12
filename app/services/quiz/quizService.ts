// Service de gestion des quiz - Logique métier

import { Quiz, QuizQuestion, QuizParticipant, QuizReaction, QuizSession, ReactionType } from '@/data/quizData';
import { MOCK_PARTICIPANTS } from '@/data/quizData';

export interface QuizState {
  session: QuizSession | null;
  currentQuestion: QuizQuestion | null;
  selectedAnswer: number | null;
  timeRemaining: number;
  score: number;
  xpEarned: number;
  combo: number;
  maxCombo: number;
  isAnswered: boolean;
  isCorrect: boolean;
  showResult: boolean;
}

export class QuizService {
  private state: QuizState = {
    session: null,
    currentQuestion: null,
    selectedAnswer: null,
    timeRemaining: 0,
    score: 0,
    xpEarned: 0,
    combo: 0,
    maxCombo: 0,
    isAnswered: false,
    isCorrect: false,
    showResult: false,
  };

  private timer: NodeJS.Timeout | null = null;
  private listeners: Map<string, (state: QuizState) => void> = new Map();

  // Rejoindre un quiz
  joinQuiz(quiz: Quiz, userId: string, userName: string, userAvatar: string): QuizSession {
    const participant: QuizParticipant = {
      id: userId,
      name: userName,
      avatar: userAvatar,
      score: 0,
      xpEarned: 0,
      combo: 0,
      currentQuestion: 0,
      isActive: true,
      joinedAt: new Date().toISOString(),
    };

    const session: QuizSession = {
      quiz: { ...quiz, participants: quiz.participants + 1 },
      participants: [...MOCK_PARTICIPANTS, participant],
      currentQuestionIndex: 0,
      startTime: Date.now(),
      reactions: [],
      leaderboard: [],
    };

    this.state.session = session;
    this.loadQuestion(0);
    this.startTimer();
    this.updateLeaderboard();

    return session;
  }

  // Charger une question
  loadQuestion(index: number): void {
    if (!this.state.session) return;

    const question = this.state.session.quiz.questions[index];
    if (!question) return;

    this.state.currentQuestion = question;
    this.state.timeRemaining = question.timeLimit;
    this.state.selectedAnswer = null;
    this.state.isAnswered = false;
    this.state.isCorrect = false;
    this.state.showResult = false;

    this.notifyListeners();
  }

  // Répondre à une question
  answerQuestion(answerIndex: number): void {
    if (!this.state.currentQuestion || this.state.isAnswered) return;

    const isCorrect = answerIndex === this.state.currentQuestion.correctAnswer;
    const points = isCorrect ? this.state.currentQuestion.points : 0;
    
    // Calcul du combo
    if (isCorrect) {
      this.state.combo += 1;
      this.state.maxCombo = Math.max(this.state.maxCombo, this.state.combo);
      // Bonus combo : +2 points par combo
      const comboBonus = Math.min(this.state.combo * 2, 10);
      this.state.score += points + comboBonus;
    } else {
      this.state.combo = 0; // Reset combo si mauvaise réponse
      this.state.score += points;
    }

    // Calcul XP (base + bonus combo + bonus vitesse)
    const baseXP = isCorrect ? this.state.currentQuestion.points * 2 : 0;
    const comboXP = this.state.combo * 5;
    const speedBonus = this.state.timeRemaining > this.state.currentQuestion.timeLimit / 2 ? 10 : 0;
    this.state.xpEarned += baseXP + comboXP + speedBonus;

    this.state.selectedAnswer = answerIndex;
    this.state.isAnswered = true;
    this.state.isCorrect = isCorrect;
    this.state.showResult = true;

    this.notifyListeners();
  }

  // Passer à la question suivante
  nextQuestion(): void {
    if (!this.state.session) return;

    const nextIndex = this.state.session.currentQuestionIndex + 1;
    
    if (nextIndex >= this.state.session.quiz.questions.length) {
      this.finishQuiz();
      return;
    }

    this.state.session.currentQuestionIndex = nextIndex;
    this.loadQuestion(nextIndex);
  }

  // Terminer le quiz
  finishQuiz(): void {
    if (!this.state.session) return;

    this.state.session.endTime = Date.now();
    this.stopTimer();
    this.updateLeaderboard();
    this.notifyListeners();
  }

  // Démarrer le timer
  startTimer(): void {
    this.stopTimer();
    
    this.timer = setInterval(() => {
      if (this.state.timeRemaining > 0) {
        this.state.timeRemaining -= 1;
        this.notifyListeners();
      } else {
        // Temps écoulé
        if (!this.state.isAnswered && this.state.currentQuestion) {
          this.answerQuestion(-1); // Réponse invalide
        }
      }
    }, 1000);
  }

  // Arrêter le timer
  stopTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  // Ajouter une réaction
  addReaction(userId: string, userName: string, userAvatar: string, type: ReactionType, questionId?: string): void {
    if (!this.state.session) return;

    const reaction: QuizReaction = {
      id: Date.now().toString(),
      userId,
      userName,
      userAvatar,
      type,
      timestamp: Date.now(),
      questionId,
    };

    this.state.session.reactions.push(reaction);
    this.notifyListeners();
  }

  // Mettre à jour le classement
  updateLeaderboard(): void {
    if (!this.state.session) return;

    this.state.session.leaderboard = [...this.state.session.participants]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    
    this.notifyListeners();
  }

  // Obtenir l'état actuel
  getState(): QuizState {
    return { ...this.state };
  }

  // S'abonner aux changements
  subscribe(listenerId: string, callback: (state: QuizState) => void): () => void {
    this.listeners.set(listenerId, callback);
    return () => this.listeners.delete(listenerId);
  }

  // Notifier les listeners
  private notifyListeners(): void {
    const state = this.getState();
    this.listeners.forEach(callback => callback(state));
  }

  // Réinitialiser
  reset(): void {
    this.stopTimer();
    this.state = {
      session: null,
      currentQuestion: null,
      selectedAnswer: null,
      timeRemaining: 0,
      score: 0,
      xpEarned: 0,
      combo: 0,
      maxCombo: 0,
      isAnswered: false,
      isCorrect: false,
      showResult: false,
    };
    this.notifyListeners();
  }
}

export const quizService = new QuizService();

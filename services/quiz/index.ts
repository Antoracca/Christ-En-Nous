// services/quiz/index.ts
// Service pour gérer l'état global du quiz en temps réel

import { Quiz, QuizParticipant, QuizSession, ReactionType, QuizReaction } from '@/data/quizData';

type Listener = (state: QuizState) => void;

interface QuizState {
  session: QuizSession | null;
  currentQuestion: any | null;
  timeRemaining: number;
  score: number;
  xpEarned: number;
  combo: number;
  maxCombo: number;
  selectedAnswer: number | null;
  isAnswered: boolean;
  isCorrect: boolean;
  showResult: boolean;
}

class QuizService {
  private state: QuizState = {
    session: null,
    currentQuestion: null,
    timeRemaining: 0,
    score: 0,
    xpEarned: 0,
    combo: 0,
    maxCombo: 0,
    selectedAnswer: null,
    isAnswered: false,
    isCorrect: false,
    showResult: false,
  };

  private listeners: Map<string, Listener> = new Map();
  private timerInterval: NodeJS.Timeout | null = null;

  getState() {
    return this.state;
  }

  subscribe(id: string, listener: Listener) {
    this.listeners.set(id, listener);
    listener(this.state);
    return () => this.listeners.delete(id);
  }

  private notify() {
    this.listeners.forEach((listener) => listener({ ...this.state }));
  }

  joinQuiz(quiz: Quiz, userId: string, userName: string, userAvatar: string) {
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

    this.state.session = {
      quiz,
      participants: [participant],
      currentQuestionIndex: 0,
      startTime: Date.now(),
      reactions: [],
      leaderboard: [participant],
    };

    this.loadQuestion(0);
    this.notify();
    return this.state.session;
  }

  private loadQuestion(index: number) {
    if (!this.state.session) return;

    const question = this.state.session.quiz.questions[index];
    if (question) {
      this.state.currentQuestion = question;
      this.state.timeRemaining = question.timeLimit;
      this.state.selectedAnswer = null;
      this.state.isAnswered = false;
      this.state.isCorrect = false;
      this.state.showResult = false;
      this.startTimer();
    } else {
      // Fin du quiz
      this.state.session.endTime = Date.now();
      this.state.currentQuestion = null;
    }
    this.notify();
  }

  private startTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (this.state.timeRemaining > 0) {
        this.state.timeRemaining--;
        this.notify();
      } else {
        // Temps écoulé
        if (!this.state.isAnswered) {
          this.answerQuestion(-1); // Réponse vide/incorrecte
        }
        clearInterval(this.timerInterval!);
      }
    }, 1000);
  }

  answerQuestion(answerIndex: number) {
    if (this.state.isAnswered || !this.state.currentQuestion) return;

    if (this.timerInterval) clearInterval(this.timerInterval);

    this.state.selectedAnswer = answerIndex;
    this.state.isAnswered = true;
    this.state.isCorrect = answerIndex === this.state.currentQuestion.correctAnswer;

    if (this.state.isCorrect) {
      // Calcul du score : points de base + bonus temps
      const timeBonus = Math.round((this.state.timeRemaining / this.state.currentQuestion.timeLimit) * 5);
      const points = this.state.currentQuestion.points + timeBonus;
      
      this.state.score += points;
      this.state.combo++;
      if (this.state.combo > this.state.maxCombo) {
        this.state.maxCombo = this.state.combo;
      }
      
      // Bonus combo
      const comboBonus = Math.floor(this.state.combo / 3) * 5;
      this.state.xpEarned += points + comboBonus;
    } else {
      this.state.combo = 0;
    }

    this.state.showResult = true;
    this.notify();
  }

  nextQuestion() {
    if (this.state.session) {
      this.state.session.currentQuestionIndex++;
      this.loadQuestion(this.state.session.currentQuestionIndex);
    }
  }

  addReaction(userId: string, userName: string, userAvatar: string, type: ReactionType, questionId?: string) {
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
    this.notify();
  }

  reset() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.state = {
      session: null,
      currentQuestion: null,
      timeRemaining: 0,
      score: 0,
      xpEarned: 0,
      combo: 0,
      maxCombo: 0,
      selectedAnswer: null,
      isAnswered: false,
      isCorrect: false,
      showResult: false,
    };
    this.notify();
  }
}

export const quizService = new QuizService();

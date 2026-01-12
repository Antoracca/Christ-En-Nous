// Écran de quiz individuel avec toutes les fonctionnalités
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Animated,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '@/hooks/useAppTheme';
import { AVAILABLE_QUIZZES, QuizReaction, ReactionType } from '@/data/quizData';
import { quizService } from '@/services/quiz';
import { useAuth } from '@/context/AuthContext';
import QuestionCard from '@/components/markos/quiz/QuestionCard';
import ScorePanel from '@/components/markos/quiz/ScorePanel';
import ReactionButtons from '@/components/markos/quiz/ReactionButtons';
import ReactionBubble from '@/components/markos/quiz/ReactionBubble';
import ReactionToast from '@/components/markos/quiz/ReactionToast';
import * as Haptics from 'expo-haptics';

export default function QuizScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { userProfile } = useAuth();
  
  const [quizState, setQuizState] = useState(quizService.getState());
  const [reactionBubbles, setReactionBubbles] = useState<Array<QuizReaction & { key: string }>>([]);
  const [reactionToasts, setReactionToasts] = useState<Array<QuizReaction & { key: string }>>([]);
  const [showResults, setShowResults] = useState(false);
  
  const quiz = AVAILABLE_QUIZZES.find(q => q.id === id);
  const currentUser = {
    id: userProfile?.id || 'me',
    name: (userProfile?.prenom && userProfile?.nom) ? `${userProfile.prenom} ${userProfile.nom}` : 'Moi',
    avatar: userProfile?.photoURL || 'https://i.pravatar.cc/150?u=me',
  };

  useEffect(() => {
    if (!quiz) {
      router.back();
      return;
    }

    // Rejoindre le quiz
    const session = quizService.joinQuiz(quiz, currentUser.id, currentUser.name, currentUser.avatar);
    
    // S'abonner aux changements
    const unsubscribe = quizService.subscribe('quiz-screen', (state) => {
      setQuizState(state);
      
      // Vérifier si le quiz est terminé
      if (state.session?.endTime) {
        setShowResults(true);
      }
    });

    // Simuler des réactions aléatoires
    const reactionInterval = setInterval(() => {
      const currentState = quizService.getState();
      if (Math.random() > 0.7 && currentState.currentQuestion) {
        const reactions: ReactionType[] = ['fire', 'clap', 'heart', 'laugh', 'wow'];
        const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
        const mockUsers = [
          { id: 'user1', name: 'Sarah K.', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
          { id: 'user2', name: 'David M.', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' },
          { id: 'user3', name: 'Marie G.', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150' },
        ];
        const mockUser = mockUsers[Math.floor(Math.random() * mockUsers.length)];
        
        addReaction(mockUser.id, mockUser.name, mockUser.avatar, randomReaction);
      }
    }, 3000);

    return () => {
      unsubscribe();
      clearInterval(reactionInterval);
      quizService.reset();
    };
  }, [id]);

  const addReaction = useCallback((userId: string, userName: string, userAvatar: string, type: ReactionType) => {
    const currentState = quizService.getState();
    const reaction: QuizReaction = {
      id: Date.now().toString(),
      userId,
      userName,
      userAvatar,
      type,
      timestamp: Date.now(),
      questionId: currentState.currentQuestion?.id,
    };

    quizService.addReaction(userId, userName, userAvatar, type, currentState.currentQuestion?.id);

    // Ajouter bulle de réaction
    const bubbleKey = `bubble-${Date.now()}-${Math.random()}`;
    setReactionBubbles(prev => [...prev, { ...reaction, key: bubbleKey }]);

    // Ajouter toast
    const toastKey = `toast-${Date.now()}-${Math.random()}`;
    setReactionToasts(prev => [...prev, { ...reaction, key: toastKey }]);

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  const handleAnswer = (answerIndex: number) => {
    quizService.answerQuestion(answerIndex);
    
    // Réaction automatique si correct
    if (answerIndex === quizState.currentQuestion?.correctAnswer) {
      setTimeout(() => {
        addReaction(currentUser.id, currentUser.name, currentUser.avatar, 'correct');
      }, 500);
    }
  };

  const handleNext = () => {
    if (quizState.showResult) {
      quizService.nextQuestion();
    }
  };

  const handleReaction = (type: ReactionType) => {
    addReaction(currentUser.id, currentUser.name, currentUser.avatar, type);
  };

  if (!quiz || !quizState.session) {
    return null;
  }

  const isLastQuestion = quizState.session.currentQuestionIndex >= quiz.questions.length - 1;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.dark ? 'light-content' : 'dark-content'} />
      
      {/* Réactions en temps réel - Toasts */}
      <View style={styles.toastsContainer} pointerEvents="box-none">
        {reactionToasts.map((toast) => (
          <ReactionToast
            key={toast.key}
            id={toast.id}
            userName={toast.userName}
            userAvatar={toast.userAvatar}
            type={toast.type}
            onComplete={() => {
              setReactionToasts(prev => prev.filter(t => t.key !== toast.key));
            }}
          />
        ))}
      </View>

      {/* Réactions en temps réel - Bulles */}
      <View style={styles.bubblesContainer} pointerEvents="box-none">
        {reactionBubbles.map((bubble) => (
          <ReactionBubble
            key={bubble.key}
            id={bubble.id}
            userName={bubble.userName}
            userAvatar={bubble.userAvatar}
            type={bubble.type}
            onComplete={() => {
              setReactionBubbles(prev => prev.filter(b => b.key !== bubble.key));
            }}
          />
        ))}
      </View>

      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={theme.colors.onSurface} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]} numberOfLines={1}>
            {quiz.title}
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.onSurfaceVariant }]}>
            Question {quizState.session.currentQuestionIndex + 1} / {quiz.questions.length}
          </Text>
        </View>
        <View style={[styles.liveBadge, { backgroundColor: '#EF4444' + '20' }]}>
          <View style={[styles.liveDot, { backgroundColor: '#EF4444' }]} />
          <Text style={[styles.liveText, { color: '#EF4444' }]}>LIVE</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Score Panel */}
        <ScorePanel
          score={quizState.score}
          xpEarned={quizState.xpEarned}
          combo={quizState.combo}
          maxCombo={quizState.maxCombo}
          leaderboard={quizState.session.leaderboard}
          currentUserId={currentUser.id}
        />

        {/* Question Card */}
        {quizState.currentQuestion && (
          <QuestionCard
            question={quizState.currentQuestion}
            timeRemaining={quizState.timeRemaining}
            selectedAnswer={quizState.selectedAnswer}
            isAnswered={quizState.isAnswered}
            isCorrect={quizState.isCorrect}
            onAnswer={handleAnswer}
          />
        )}

        {/* Next Button */}
        {quizState.showResult && (
          <TouchableOpacity
            style={[styles.nextButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>
              {isLastQuestion ? 'Voir les résultats' : 'Question suivante'}
            </Text>
            <Feather name="arrow-right" size={20} color="white" />
          </TouchableOpacity>
        )}

        {/* Results Screen */}
        {showResults && (
          <View style={[styles.resultsCard, { backgroundColor: theme.colors.surface }]}>
            <LinearGradient
              colors={[theme.colors.primary, '#8B5CF6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.resultsHeader}
            >
              <MaterialCommunityIcons name="trophy" size={48} color="white" />
              <Text style={styles.resultsTitle}>Quiz Terminé !</Text>
              <Text style={styles.resultsScore}>{quizState.score} points</Text>
              <Text style={styles.resultsXP}>+{quizState.xpEarned} XP gagnés</Text>
            </LinearGradient>
            
            <View style={styles.resultsStats}>
              <View style={styles.resultStat}>
                <MaterialCommunityIcons name="check-circle" size={24} color="#10B981" />
                <Text style={[styles.resultStatValue, { color: theme.colors.onSurface }]}>
                  {Math.round((quizState.score / (quiz.questions.length * 10)) * 100)}%
                </Text>
                <Text style={[styles.resultStatLabel, { color: theme.colors.onSurfaceVariant }]}>
                  Réussite
                </Text>
              </View>
              <View style={styles.resultStat}>
                <MaterialCommunityIcons name="fire" size={24} color="#EC4899" />
                <Text style={[styles.resultStatValue, { color: theme.colors.onSurface }]}>
                  {quizState.maxCombo}x
                </Text>
                <Text style={[styles.resultStatLabel, { color: theme.colors.onSurfaceVariant }]}>
                  Combo max
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.backToQuizzesButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => router.back()}
            >
              <Text style={styles.backToQuizzesText}>Retour aux quiz</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Reaction Buttons (Fixed Bottom) */}
      {!showResults && (
        <View style={[styles.reactionButtonsContainer, { backgroundColor: theme.colors.surface }]}>
          <ReactionButtons onReaction={handleReaction} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toastsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    pointerEvents: 'box-none',
  },
  bubblesContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    zIndex: 999,
    pointerEvents: 'box-none',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Nunito_800ExtraBold',
  },
  headerSubtitle: {
    fontSize: 12,
    fontFamily: 'Nunito_400Regular',
    marginTop: 2,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  liveText: {
    fontSize: 10,
    fontFamily: 'Nunito_800ExtraBold',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 20,
    gap: 8,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Nunito_800ExtraBold',
  },
  resultsCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  resultsHeader: {
    padding: 30,
    alignItems: 'center',
  },
  resultsTitle: {
    color: 'white',
    fontSize: 24,
    fontFamily: 'Nunito_800ExtraBold',
    marginTop: 12,
  },
  resultsScore: {
    color: 'white',
    fontSize: 32,
    fontFamily: 'Nunito_800ExtraBold',
    marginTop: 8,
  },
  resultsXP: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    marginTop: 4,
  },
  resultsStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },
  resultStat: {
    alignItems: 'center',
  },
  resultStatValue: {
    fontSize: 20,
    fontFamily: 'Nunito_800ExtraBold',
    marginTop: 8,
  },
  resultStatLabel: {
    fontSize: 12,
    fontFamily: 'Nunito_600SemiBold',
    marginTop: 4,
  },
  backToQuizzesButton: {
    margin: 20,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  backToQuizzesText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Nunito_800ExtraBold',
  },
  reactionButtonsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
});

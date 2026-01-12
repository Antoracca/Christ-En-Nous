// Carte de question avec options et timer
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';
import { QuizQuestion } from '@/data/quizData';

interface QuestionCardProps {
  question: QuizQuestion;
  timeRemaining: number;
  selectedAnswer: number | null;
  isAnswered: boolean;
  isCorrect: boolean;
  onAnswer: (index: number) => void;
}

export default function QuestionCard({
  question,
  timeRemaining,
  selectedAnswer,
  isAnswered,
  isCorrect,
  onAnswer,
}: QuestionCardProps) {
  const theme = useAppTheme();
  const [pulseAnim] = useState(new Animated.Value(1));
  const progress = (timeRemaining / question.timeLimit) * 100;
  const isUrgent = progress < 30;

  useEffect(() => {
    if (isUrgent && !isAnswered) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isUrgent, isAnswered]);

  const getOptionStyle = (index: number) => {
    if (!isAnswered) {
      return selectedAnswer === index
        ? { backgroundColor: theme.colors.primary + '20', borderColor: theme.colors.primary }
        : { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline + '40' };
    }

    if (index === question.correctAnswer) {
      return { backgroundColor: '#10B981' + '20', borderColor: '#10B981' };
    }
    if (index === selectedAnswer && !isCorrect) {
      return { backgroundColor: '#EF4444' + '20', borderColor: '#EF4444' };
    }
    return { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline + '40' };
  };

  const getOptionIcon = (index: number) => {
    if (!isAnswered) return null;
    if (index === question.correctAnswer) {
      return <MaterialCommunityIcons name="check-circle" size={20} color="#10B981" />;
    }
    if (index === selectedAnswer && !isCorrect) {
      return <MaterialCommunityIcons name="close-circle" size={20} color="#EF4444" />;
    }
    return null;
  };

  return (
    <View style={styles.container}>
      {/* Timer Bar */}
      <View style={[styles.timerBar, { backgroundColor: theme.colors.surfaceVariant }]}>
        <Animated.View
          style={[
            styles.timerProgress,
            {
              width: `${progress}%`,
              backgroundColor: isUrgent ? '#EF4444' : theme.colors.primary,
              transform: [{ scale: pulseAnim }],
            },
          ]}
        />
      </View>

      {/* Question */}
      <View style={[styles.questionCard, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.questionHeader}>
          <View style={[styles.questionBadge, { backgroundColor: theme.colors.primary + '15' }]}>
            <Text style={[styles.questionNumber, { color: theme.colors.primary }]}>
              Question {question.id.replace('q', '')}
            </Text>
          </View>
          <View style={[styles.pointsBadge, { backgroundColor: '#FFD700' + '20' }]}>
            <MaterialCommunityIcons name="star" size={14} color="#FFD700" />
            <Text style={[styles.pointsText, { color: '#FFD700' }]}>{question.points} pts</Text>
          </View>
        </View>

        <Text style={[styles.questionText, { color: theme.colors.onSurface }]}>
          {question.question}
        </Text>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {question.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.option, getOptionStyle(index)]}
              onPress={() => !isAnswered && onAnswer(index)}
              disabled={isAnswered}
              activeOpacity={0.7}
            >
              <View style={styles.optionContent}>
                <View style={[styles.optionIndicator, { backgroundColor: theme.colors.primary + '20' }]}>
                  <Text style={[styles.optionLetter, { color: theme.colors.primary }]}>
                    {String.fromCharCode(65 + index)}
                  </Text>
                </View>
                <Text style={[styles.optionText, { color: theme.colors.onSurface }]} numberOfLines={2}>
                  {option}
                </Text>
              </View>
              {getOptionIcon(index)}
            </TouchableOpacity>
          ))}
        </View>

        {/* Explanation */}
        {isAnswered && question.explanation && (
          <View style={[styles.explanation, { backgroundColor: theme.colors.surfaceVariant }]}>
            <MaterialCommunityIcons name="lightbulb-on" size={16} color={theme.colors.primary} />
            <Text style={[styles.explanationText, { color: theme.colors.onSurfaceVariant }]}>
              {question.explanation}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  timerBar: {
    height: 4,
    borderRadius: 2,
    marginBottom: 16,
    overflow: 'hidden',
  },
  timerProgress: {
    height: '100%',
    borderRadius: 2,
  },
  questionCard: {
    padding: 20,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  questionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  questionNumber: {
    fontSize: 11,
    fontFamily: 'Nunito_700Bold',
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  pointsText: {
    fontSize: 11,
    fontFamily: 'Nunito_700Bold',
  },
  questionText: {
    fontSize: 18,
    fontFamily: 'Nunito_700Bold',
    marginBottom: 20,
    lineHeight: 26,
  },
  optionsContainer: {
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  optionIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionLetter: {
    fontSize: 14,
    fontFamily: 'Nunito_800ExtraBold',
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Nunito_600SemiBold',
  },
  explanation: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
  },
  explanationText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Nunito_400Regular',
    lineHeight: 18,
  },
});

// app/components/cantiques/JoinMinistryForm.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';
import { LinearGradient } from 'expo-linear-gradient';
import { MINISTRY_INFO } from '@/data/cantiquesData';
import { useAuth } from '@/context/AuthContext';

interface JoinMinistryFormProps {
  language?: 'fr' | 'sg';
  onSubmit?: (formData: any) => void;
}

export default function JoinMinistryForm({ language = 'fr', onSubmit }: JoinMinistryFormProps) {
  const theme = useAppTheme();
  const { userProfile } = useAuth();
  const [formData, setFormData] = useState<any>({});
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  // Pré-remplir avec les données du profil utilisateur
  useEffect(() => {
    if (userProfile) {
      const prefilledData: any = {};

      // Nom complet (nom + prénom)
      if (userProfile.nom || userProfile.prenom) {
        prefilledData.name = `${userProfile.prenom || ''} ${userProfile.nom || ''}`.trim();
      }

      // Email
      if (userProfile.email) {
        prefilledData.email = userProfile.email;
      }

      // Téléphone
      if (userProfile.phone) {
        prefilledData.phone = userProfile.phone;
      }

      setFormData(prefilledData);
    }
  }, [userProfile]);

  const questions = MINISTRY_INFO.questions[language];

  const handleSubmit = () => {
    // Validate required fields
    const missingFields = questions
      .filter((q) => q.required && !formData[q.id])
      .map((q) => q.question);

    if (missingFields.length > 0) {
      Alert.alert(
        language === 'fr' ? 'Champs requis' : 'Kua tî sɔnɔ',
        language === 'fr'
          ? 'Veuillez remplir tous les champs obligatoires.'
          : 'Tongasɔ kua kɔ̈kɔ̈ tî sɔnɔ.'
      );
      return;
    }

    const finalData = {
      ...formData,
      availability: selectedDays,
      submittedAt: new Date().toISOString(),
      language,
    };

    Alert.alert(
      language === 'fr' ? 'Demande envoyée !' : 'Kua tî mo sɔ !',
      language === 'fr'
        ? 'Votre demande a été envoyée avec succès. Nous vous contacterons bientôt.'
        : 'Kua tî mo sɔ na nzönî. Ë na kpɛngbɛ mo bilɛ̈kɛ.',
      [
        {
          text: 'OK',
          onPress: () => {
            if (onSubmit) onSubmit(finalData);
            // Reset form
            setFormData({});
            setSelectedDays([]);
          },
        },
      ]
    );
  };

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const renderQuestion = (question: any) => {
    switch (question.type) {
      case 'text':
      case 'phone':
      case 'email':
        return (
          <View key={question.id} style={styles.questionContainer}>
            <Text style={[styles.questionLabel, { color: theme.colors.onSurface }]}>
              {question.question}
              {question.required && <Text style={{ color: theme.colors.error }}> *</Text>}
            </Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: theme.colors.surfaceVariant,
                  color: theme.colors.onSurface,
                  borderColor: theme.colors.outline,
                },
              ]}
              placeholder={language === 'fr' ? 'Votre réponse' : 'Yakua tî mo'}
              placeholderTextColor={theme.colors.onSurfaceVariant}
              value={formData[question.id] || ''}
              onChangeText={(text) => setFormData({ ...formData, [question.id]: text })}
              keyboardType={question.type === 'phone' ? 'phone-pad' : question.type === 'email' ? 'email-address' : 'default'}
            />
          </View>
        );

      case 'select':
        return (
          <View key={question.id} style={styles.questionContainer}>
            <Text style={[styles.questionLabel, { color: theme.colors.onSurface }]}>
              {question.question}
              {question.required && <Text style={{ color: theme.colors.error }}> *</Text>}
            </Text>
            <View style={styles.selectContainer}>
              {question.options.map((option: string) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.selectOption,
                    {
                      backgroundColor:
                        formData[question.id] === option
                          ? theme.colors.primary
                          : theme.colors.surfaceVariant,
                      borderColor: theme.colors.outline,
                    },
                  ]}
                  onPress={() => setFormData({ ...formData, [question.id]: option })}
                >
                  <Text
                    style={[
                      styles.selectOptionText,
                      {
                        color:
                          formData[question.id] === option
                            ? 'white'
                            : theme.colors.onSurfaceVariant,
                      },
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 'multiselect':
        return (
          <View key={question.id} style={styles.questionContainer}>
            <Text style={[styles.questionLabel, { color: theme.colors.onSurface }]}>
              {question.question}
              {question.required && <Text style={{ color: theme.colors.error }}> *</Text>}
            </Text>
            <View style={styles.selectContainer}>
              {question.options.map((option: string) => {
                const isSelected = selectedDays.includes(option);
                return (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.selectOption,
                      {
                        backgroundColor: isSelected
                          ? theme.colors.primary
                          : theme.colors.surfaceVariant,
                        borderColor: theme.colors.outline,
                      },
                    ]}
                    onPress={() => toggleDay(option)}
                  >
                    <Text
                      style={[
                        styles.selectOptionText,
                        {
                          color: isSelected ? 'white' : theme.colors.onSurfaceVariant,
                        },
                      ]}
                    >
                      {option}
                    </Text>
                    {isSelected && (
                      <Feather name="check" size={16} color="white" style={{ marginLeft: 4 }} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );

      case 'textarea':
        return (
          <View key={question.id} style={styles.questionContainer}>
            <Text style={[styles.questionLabel, { color: theme.colors.onSurface }]}>
              {question.question}
              {question.required && <Text style={{ color: theme.colors.error }}> *</Text>}
            </Text>
            <TextInput
              style={[
                styles.textAreaInput,
                {
                  backgroundColor: theme.colors.surfaceVariant,
                  color: theme.colors.onSurface,
                  borderColor: theme.colors.outline,
                },
              ]}
              placeholder={language === 'fr' ? 'Votre réponse' : 'Yakua tî mo'}
              placeholderTextColor={theme.colors.onSurfaceVariant}
              value={formData[question.id] || ''}
              onChangeText={(text) => setFormData({ ...formData, [question.id]: text })}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Simple */}
        <View style={styles.headerSimple}>
          <View style={[styles.iconCircle, { backgroundColor: theme.colors.primary + '20' }]}>
            <Feather name="music" size={32} color={theme.colors.primary} />
          </View>
          <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
            {MINISTRY_INFO.title[language]}
          </Text>
          <Text style={[styles.headerDescription, { color: theme.colors.onSurfaceVariant }]}>
            {MINISTRY_INFO.description[language]}
          </Text>
        </View>

        {/* Mission */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.sectionHeader}>
            <Feather name="target" size={24} color={theme.colors.primary} />
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              {language === 'fr' ? 'Notre Mission' : 'Kua Tî Ë'}
            </Text>
          </View>
          <Text style={[styles.sectionText, { color: theme.colors.onSurfaceVariant }]}>
            {MINISTRY_INFO.mission[language]}
          </Text>
        </View>

        {/* Benefits */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.sectionHeader}>
            <Feather name="gift" size={24} color={theme.colors.primary} />
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              {language === 'fr' ? 'Avantages' : 'Alɛ̈ngɔ'}
            </Text>
          </View>
          {MINISTRY_INFO.benefits[language].map((benefit, index) => (
            <View key={index} style={styles.benefitItem}>
              <Feather name="check-circle" size={18} color={theme.colors.primary} />
              <Text style={[styles.benefitText, { color: theme.colors.onSurfaceVariant }]}>
                {benefit}
              </Text>
            </View>
          ))}
        </View>

        {/* Form */}
        <View style={[styles.formSection, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.sectionHeader}>
            <Feather name="edit" size={24} color={theme.colors.primary} />
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              {language === 'fr' ? 'Formulaire d\'inscription' : 'Kua Tî Sɔrɔ'}
            </Text>
          </View>

          {questions.map(renderQuestion)}

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleSubmit}
            activeOpacity={0.9}
          >
            <Feather name="send" size={20} color="white" />
            <Text style={styles.submitButtonText}>
              {language === 'fr' ? 'Envoyer ma demande' : 'Sɔ kua tî mbi'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
    paddingTop: 10,
  },
  headerSimple: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Nunito_800ExtraBold',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerDescription: {
    fontSize: 13,
    fontFamily: 'Nunito_400Regular',
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 10,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Nunito_700Bold',
  },
  sectionText: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    lineHeight: 22,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  benefitText: {
    fontSize: 14,
    fontFamily: 'Nunito_600SemiBold',
    flex: 1,
  },
  formSection: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  questionContainer: {
    marginBottom: 24,
  },
  questionLabel: {
    fontSize: 15,
    fontFamily: 'Nunito_600SemiBold',
    marginBottom: 10,
  },
  textInput: {
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    borderWidth: 1,
  },
  textAreaInput: {
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    borderWidth: 1,
    minHeight: 120,
  },
  selectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectOptionText: {
    fontSize: 13,
    fontFamily: 'Nunito_600SemiBold',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    marginTop: 10,
    gap: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    color: 'white',
  },
});

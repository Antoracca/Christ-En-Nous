import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export default function CreatePostModal({ visible, onClose, onSubmit }: CreatePostModalProps) {
  const theme = useAppTheme();
  const [type, setType] = useState<'demande' | 'offre'>('demande');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [level, setLevel] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);

  const handleSubmit = () => {
    onSubmit({ type, subject, description, level, isUrgent });
    // Reset form
    setSubject('');
    setDescription('');
    setLevel('');
    setIsUrgent(false);
    onClose();
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <BlurView intensity={20} style={styles.blurContainer}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            
            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.title, { color: theme.colors.onSurface }]}>Nouvelle Annonce</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Feather name="x" size={24} color={theme.colors.onSurfaceVariant} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.form}>
              
              {/* Type Switcher */}
              <View style={styles.typeSwitcher}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    type === 'demande' && { backgroundColor: '#FEE2E2', borderColor: '#EF4444' }
                  ]}
                  onPress={() => setType('demande')}
                >
                  <Text style={[
                    styles.typeText,
                    type === 'demande' ? { color: '#EF4444' } : { color: theme.colors.onSurfaceVariant }
                  ]}>Demande d'aide</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    type === 'offre' && { backgroundColor: '#D1FAE5', borderColor: '#10B981' }
                  ]}
                  onPress={() => setType('offre')}
                >
                  <Text style={[
                    styles.typeText,
                    type === 'offre' ? { color: '#10B981' } : { color: theme.colors.onSurfaceVariant }
                  ]}>Je propose mon aide</Text>
                </TouchableOpacity>
              </View>

              {/* Subject */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>Matière / Sujet</Text>
                <TextInput
                  style={[styles.input, { color: theme.colors.onSurface, borderColor: theme.colors.outline + '40' }]}
                  placeholder="Ex: Mathématiques, Philosophie..."
                  placeholderTextColor={theme.colors.outline}
                  value={subject}
                  onChangeText={setSubject}
                />
              </View>

              {/* Level */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>Niveau scolaire</Text>
                <TextInput
                  style={[styles.input, { color: theme.colors.onSurface, borderColor: theme.colors.outline + '40' }]}
                  placeholder="Ex: Terminale C, 3ème..."
                  placeholderTextColor={theme.colors.outline}
                  value={level}
                  onChangeText={setLevel}
                />
              </View>

              {/* Description */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>Description détaillée</Text>
                <TextInput
                  style={[styles.textArea, { color: theme.colors.onSurface, borderColor: theme.colors.outline + '40' }]}
                  placeholder="Expliquez votre besoin ou votre offre..."
                  placeholderTextColor={theme.colors.outline}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              {/* Urgent Toggle */}
              {type === 'demande' && (
                <TouchableOpacity 
                  style={[styles.urgentRow, isUrgent && { backgroundColor: '#FEF2F2' }]}
                  onPress={() => setIsUrgent(!isUrgent)}
                >
                  <View style={[styles.checkbox, isUrgent && { backgroundColor: '#EF4444', borderColor: '#EF4444' }]}>
                    {isUrgent && <Feather name="check" size={14} color="white" />}
                  </View>
                  <Text style={[styles.urgentText, { color: isUrgent ? '#EF4444' : theme.colors.onSurface }]}>
                    Marquer comme URGENT
                  </Text>
                </TouchableOpacity>
              )}

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleSubmit}
              >
                <Text style={styles.submitText}>Publier l'annonce</Text>
                <Feather name="arrow-right" size={20} color="white" />
              </TouchableOpacity>

            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  blurContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    height: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Nunito_800ExtraBold',
  },
  closeButton: {
    padding: 4,
  },
  form: {
    paddingBottom: 40,
  },
  typeSwitcher: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
  },
  typeText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontFamily: 'Nunito_600SemiBold',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: 'Nunito_400Regular',
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: 'Nunito_400Regular',
    minHeight: 100,
  },
  urgentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#9CA3AF',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  urgentText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    marginTop: 10,
  },
  submitText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Nunito_800ExtraBold',
  },
});

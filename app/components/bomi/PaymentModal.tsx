import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Feather, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useAppTheme } from '@/hooks/useAppTheme';
import * as Haptics from 'expo-haptics';

interface PaymentModalProps {
  visible: boolean;
  onClose: () => void;
  projectTitle: string;
  onSuccess: (amount: number, method: string) => void;
  onReceipt: (amount: number, ref: string) => void;
}

const AMOUNTS = [1000, 2000, 5000, 10000];

export default function PaymentModal({ visible, onClose, projectTitle, onSuccess, onReceipt }: PaymentModalProps) {
  const theme = useAppTheme();
  const [step, setStep] = useState<'amount' | 'method' | 'processing'>('amount');
  const [amount, setAmount] = useState('1000');
  const [method, setMethod] = useState<'om' | 'card' | 'cash'>('om');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  const handleAmountSelect = (val: number) => {
    setAmount(val.toString());
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleNext = () => {
    if (!amount || parseInt(amount) < 100) {
      Alert.alert('Erreur', 'Le montant minimum est de 100 FCFA');
      return;
    }
    setStep('method');
  };

  const handlePay = () => {
    setStep('processing');
    
    // Simulation
    setTimeout(() => {
      if (method === 'cash') {
        const ref = `REF-${Math.floor(1000 + Math.random() * 9000)}-${new Date().getFullYear()}`;
        onReceipt(parseInt(amount), ref);
      } else {
        onSuccess(parseInt(amount), method);
      }
      reset();
    }, 2500);
  };

  const reset = () => {
    setStep('amount');
    setAmount('1000');
    setPhoneNumber('');
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} />
        </BlurView>

        <View style={[styles.content, { backgroundColor: theme.colors.surface }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.onSurface }]}>Faire un Don</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={24} color={theme.colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>
          
          <Text style={[styles.subtitle, { color: theme.colors.primary }]}>{projectTitle}</Text>

          {step === 'processing' ? (
            <View style={styles.processingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={[styles.processingText, { color: theme.colors.onSurfaceVariant }]}>
                Traitement en cours...
              </Text>
            </View>
          ) : step === 'amount' ? (
            <View style={styles.stepContainer}>
              <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>Combien souhaitez-vous donner ?</Text>
              
              <View style={styles.amountGrid}>
                {AMOUNTS.map((val) => (
                  <TouchableOpacity
                    key={val}
                    style={[
                      styles.amountChip,
                      amount === val.toString() && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
                    ]}
                    onPress={() => handleAmountSelect(val)}
                  >
                    <Text style={[
                      styles.amountText,
                      amount === val.toString() ? { color: 'white' } : { color: theme.colors.onSurface }
                    ]}>{val.toLocaleString()}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={[styles.inputContainer, { borderColor: theme.colors.primary }]}>
                <Text style={styles.currency}>FCFA</Text>
                <TextInput
                  style={[styles.input, { color: theme.colors.onSurface }]}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                  placeholder="Autre montant"
                />
              </View>

              <TouchableOpacity style={[styles.mainButton, { backgroundColor: theme.colors.primary }]} onPress={handleNext}>
                <Text style={styles.buttonText}>Continuer</Text>
                <Feather name="arrow-right" size={20} color="white" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.stepContainer}>
              <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>Moyen de paiement</Text>
              
              <View style={styles.methodsContainer}>
                <TouchableOpacity 
                  style={[styles.methodCard, method === 'om' && styles.methodSelected]} 
                  onPress={() => setMethod('om')}
                >
                  <MaterialCommunityIcons name="cellphone-wireless" size={28} color={method === 'om' ? '#EA580C' : '#9CA3AF'} />
                  <Text style={[styles.methodText, method === 'om' && { color: '#EA580C' }]}>Mobile Money</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.methodCard, method === 'card' && styles.methodSelected]} 
                  onPress={() => setMethod('card')}
                >
                  <FontAwesome5 name="credit-card" size={24} color={method === 'card' ? '#2563EB' : '#9CA3AF'} />
                  <Text style={[styles.methodText, method === 'card' && { color: '#2563EB' }]}>Carte Bancaire</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.methodCard, method === 'cash' && styles.methodSelected]} 
                  onPress={() => setMethod('cash')}
                >
                  <MaterialCommunityIcons name="office-building" size={28} color={method === 'cash' ? '#10B981' : '#9CA3AF'} />
                  <Text style={[styles.methodText, method === 'cash' && { color: '#10B981' }]}>Comptabilité</Text>
                </TouchableOpacity>
              </View>

              {method === 'om' && (
                <View style={styles.formContainer}>
                  <Text style={[styles.labelSmall, { color: theme.colors.onSurfaceVariant }]}>Numéro Orange/Moov</Text>
                  <TextInput
                    style={[styles.inputField, { color: theme.colors.onSurface, backgroundColor: theme.colors.background }]}
                    placeholder="ex: 72 00 00 00"
                    placeholderTextColor={theme.colors.outline}
                    keyboardType="phone-pad"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                  />
                </View>
              )}

              {method === 'card' && (
                <View style={styles.formContainer}>
                  <Text style={[styles.infoText, { color: theme.colors.onSurfaceVariant }]}>
                    Vous serez redirigé vers une page sécurisée.
                  </Text>
                </View>
              )}

              {method === 'cash' && (
                <View style={styles.formContainer}>
                  <Text style={[styles.infoText, { color: theme.colors.onSurfaceVariant }]}>
                    Un reçu de référence sera généré. Présentez-le à la comptabilité de l'église pour effectuer votre don en espèces.
                  </Text>
                </View>
              )}

              <View style={styles.rowButtons}>
                <TouchableOpacity style={styles.backBtn} onPress={() => setStep('amount')}>
                  <Feather name="arrow-left" size={24} color={theme.colors.onSurfaceVariant} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.payButton, { backgroundColor: theme.colors.primary }]} 
                  onPress={handlePay}
                >
                  <Text style={styles.buttonText}>
                    {method === 'cash' ? 'Générer Référence' : `Payer ${parseInt(amount).toLocaleString()} F`}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  content: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Nunito_800ExtraBold',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Nunito_600SemiBold',
    marginBottom: 24,
  },
  closeBtn: {
    padding: 4,
  },
  stepContainer: {
    gap: 20,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
  },
  amountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  amountChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  amountText: {
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  currency: {
    fontSize: 16,
    fontFamily: 'Nunito_800ExtraBold',
    color: '#9CA3AF',
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 20,
    fontFamily: 'Nunito_800ExtraBold',
  },
  mainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 10,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Nunito_800ExtraBold',
  },
  
  // Methods
  methodsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  methodCard: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  methodSelected: {
    borderColor: 'currentColor', // Handled inline
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  methodText: {
    fontSize: 11,
    fontFamily: 'Nunito_700Bold',
    textAlign: 'center',
  },
  formContainer: {
    minHeight: 80,
    justifyContent: 'center',
  },
  labelSmall: {
    fontSize: 12,
    fontFamily: 'Nunito_600SemiBold',
    marginBottom: 8,
  },
  inputField: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Nunito_600SemiBold',
  },
  infoText: {
    fontSize: 13,
    fontFamily: 'Nunito_400Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
  rowButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  payButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
  },
  processingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  processingText: {
    fontSize: 16,
    fontFamily: 'Nunito_600SemiBold',
  },
});

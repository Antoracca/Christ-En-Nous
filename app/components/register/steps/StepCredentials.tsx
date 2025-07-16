// StepCredentials.tsx — Version optimisée sans redondances
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Keyboard,
  Platform,
  StyleSheet,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { TextInput, HelperText } from 'react-native-paper';
import DatePickerModal from '../../forms/DatePickerModal';
import PasswordStrengthIndicator from '../../forms/PasswordStrengthIndicator';
import {
  type CredentialsErrors,
} from 'utils/validateStepCredentialsFields';
import FieldIcon from '../../forms/FieldIcon';

interface StepCredentialsProps {
  birthdate: string;
  password: string;
  confirmPassword: string;
  onChange: (
    field: 'birthdate' | 'password' | 'confirmPassword',
    value: string
  ) => void;
  forceValidation: boolean;
}

export default function StepCredentials({
  birthdate,
  password,
  confirmPassword,
  onChange,
  forceValidation,
}: StepCredentialsProps) {
  const [errors, setErrors] = useState<CredentialsErrors>({});
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  // 🎯 États pour gérer l'affichage intelligent des indicateurs
  const [showPasswordDetails, setShowPasswordDetails] = useState(false);
  const [hasStartedTypingPassword, setHasStartedTypingPassword] = useState(false);
  const [hasStartedTypingConfirm, setHasStartedTypingConfirm] = useState(false);

  // 🧠 Logique intelligente pour l'affichage des détails
  const shouldShowPasswordDetails = hasStartedTypingPassword || showPasswordDetails;
  const shouldShowConfirmationFeedback = hasStartedTypingConfirm && confirmPassword.length > 0;

  useEffect(() => {
    if (!birthdate) return;
    const [d, m, y] = birthdate.split('/');
    const parsed = new Date(+y, +m - 1, +d);
    if (!isNaN(parsed.getTime())) setTempDate(parsed);
  }, [birthdate]);

  // 🎯 Validation simplifiée - on laisse le composant PasswordStrengthIndicator gérer la validation des mots de passe
  useEffect(() => {
    if (forceValidation) {
      const newErrors: CredentialsErrors = {};
      
      // Validation de la date uniquement
      if (!birthdate.trim()) {
        newErrors.birthdate = 'La date de naissance est requise.';
      }

      setErrors(newErrors);
    }
  }, [forceValidation, birthdate]);

  const format = (d: Date) =>
    `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;

  const openPicker = () => {
    Keyboard.dismiss();
    setShowPicker(true);
  };

  const handleDateChange = (selected: Date) => {
    const newDate = format(selected);
    onChange('birthdate', newDate);
    setShowPicker(false);

    // Validation immédiate de la date
    if (newDate.trim()) {
      setErrors((prev) => ({ ...prev, birthdate: undefined }));
    }
  };

  const handleFieldChange = (
    field: 'birthdate' | 'password' | 'confirmPassword',
    value: string
  ) => {
    onChange(field, value);

    // 🎯 Gestion intelligente des états d'affichage
    if (field === 'password') {
      if (value.length > 0 && !hasStartedTypingPassword) {
        setHasStartedTypingPassword(true);
      }
      if (value.length === 0) {
        setHasStartedTypingPassword(false);
        setShowPasswordDetails(false);
      }
    }

    if (field === 'confirmPassword') {
      if (value.length > 0 && !hasStartedTypingConfirm) {
        setHasStartedTypingConfirm(true);
      }
      if (value.length === 0) {
        setHasStartedTypingConfirm(false);
      }
    }
  };

  // 🎨 Fonctions utilitaires pour la validation
  const isPasswordStrong = () => {
    const hasLength = password.length >= 6;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    return hasLength && hasUppercase && hasLowercase && hasDigit && hasSpecial;
  };

  const doPasswordsMatch = () => {
    return confirmPassword.length > 0 && password === confirmPassword && isPasswordStrong();
  };

  return (
    <View style={styles.card}>
      <Text style={styles.stepTitle}>Étape 2 : Informations de sécurité</Text>
      <Text style={styles.stepDescription}>
        Renseignez votre date de naissance et créez un mot de passe sécurisé.
      </Text>

      {/* 📅 Section Date de naissance */}
      <View style={styles.fieldContainer}>
        <TouchableOpacity onPress={openPicker} activeOpacity={0.8}>
          <View pointerEvents="none">
            <TextInput
              mode="outlined"
              label="Date de naissance"
              value={birthdate}
              editable={false}
              style={styles.input}
              left={<TextInput.Icon icon={() => <FieldIcon name="calendar" />} />}
              placeholder="JJ/MM/AAAA"
            />
          </View>
        </TouchableOpacity>
        <HelperText type="error" visible={!!errors.birthdate} style={styles.errorText}>
          {errors.birthdate}
        </HelperText>
      </View>

      <DatePickerModal
        visible={showPicker}
        date={tempDate}
        onChangeTemp={(date) => setTempDate(date)}
        onConfirm={() => handleDateChange(tempDate)}
        onCancel={() => setShowPicker(false)}
      />

      {Platform.OS === 'android' && showPicker && (
        <DateTimePicker
          value={tempDate}
          mode="date"
          display="calendar"
          onChange={(event, selectedDate) => {
            if (selectedDate) {
              setTempDate(selectedDate);
              handleDateChange(selectedDate);
            }
          }}
          maximumDate={new Date()}
        />
      )}

      {/* 🔒 Section Mot de passe */}
      <View style={styles.fieldContainer}>
        <View style={styles.passwordHeader}>
          <Text style={styles.fieldLabel}>Créez votre mot de passe</Text>
         
        </View>

        <TextInput
          key={showPassword ? 'visible' : 'hidden'}
          mode="outlined"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={(t) => handleFieldChange('password', t)}
          onLayout={() => {}}
          autoComplete="password"
          style={[
            styles.input,
            // 🎨 Bordure discrète quand le mot de passe est valide
            isPasswordStrong() && styles.inputValid
          ]}
          left={<TextInput.Icon icon={() => <FieldIcon name="lock" />} />}
          right={
            <TextInput.Icon
              icon={showPassword ? 'eye-off' : 'eye'}
              onPress={() => setShowPassword((v) => !v)}
            />
          }
          placeholder="Votre mot de passe sécurisé"
        />

        {/* 🎯 Indicateur de force unifié */}
        <PasswordStrengthIndicator 
          password={password} 
          showDetails={shouldShowPasswordDetails}
          mode="creation"
        />
      </View>

      {/* 🔓 Section Confirmation */}
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Confirmez votre mot de passe</Text>
        
        <TextInput
          key={showConfirm ? 'visible' : 'hidden'}
          mode="outlined"
          secureTextEntry={!showConfirm}
          value={confirmPassword}
          onLayout={() => {}}
          autoComplete="password"
          onChangeText={(t) => handleFieldChange('confirmPassword', t)}
          style={[
            styles.input,
            // 🎨 Bordure discrète quand la confirmation est correcte
            doPasswordsMatch() && styles.inputValid
          ]}
          left={<TextInput.Icon icon={() => <FieldIcon name="key" />} />}
          right={
            <TextInput.Icon
              icon={showConfirm ? 'eye-off' : 'eye'}
              onPress={() => setShowConfirm((v) => !v)}
            />
          }
          placeholder="Répétez le mot de passe"
        />

        {/* 🎯 Feedback de confirmation intelligent */}
        {shouldShowConfirmationFeedback && (
          <PasswordStrengthIndicator 
            password={password}
            confirmPassword={confirmPassword} 
            showDetails={true}
            mode="confirmation"
          />
        )}
      </View>

      {/* 📝 Note d'aide générale */}
      <View style={styles.helpContainer}>
        <Text style={styles.helpText}>
          💡 Ces informations sécurisent votre compte et permettent de vous connecter .
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
    borderRadius: 25,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 24,
    lineHeight: 22,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  
  // 🎯 En-têtes de champs optimisés
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  fieldLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  toggleButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  toggleButtonText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  
  // 🎨 Styles de champs optimisés
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    height: 55,
    fontSize: 16,
  },
  inputValid: {
    borderColor: '#10B981',
    borderRadius: 12,
    borderWidth: 3,
    backgroundColor: '#F6FFFA',
  },
  
  // 📝 Aide et messages
  helpContainer: {
    backgroundColor: '#F0F9FF',
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 8,
    
  },
  helpText: {
    fontSize: 12,
    color: '#1E40AF',
    lineHeight: 16,
    fontStyle: 'italic',
    marginRight: 10,
    marginTop: 2,
    textAlign: 'justify',
    maxWidth: '90%',
    // Pour éviter les débordements sur les petits écrans
    flexWrap: 'wrap',
    maxHeight: 60, // Limite la hauteur pour éviter les débordements

  },
  
  errorText: {
    marginLeft: -5,
    color: '#DC2626',
    fontSize: 13,
    marginTop: 4,
  },
});
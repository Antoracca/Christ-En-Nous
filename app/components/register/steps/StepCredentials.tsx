// StepCredentials.tsx — harmonisé avec StepContact
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
  validateStepCredentialsFields,
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

  useEffect(() => {
    if (!birthdate) return;
    const [d, m, y] = birthdate.split('/');
    const parsed = new Date(+y, +m - 1, +d);
    if (!isNaN(parsed.getTime())) setTempDate(parsed);
  }, [birthdate]);
  useEffect(() => {
  if (forceValidation) {
    const allErrors = validateStepCredentialsFields(
      { birthdate, password, confirmPassword }
    );
    setErrors(allErrors);
  }
}, [forceValidation, birthdate, password, confirmPassword]);


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

    const error = validateStepCredentialsFields(
      {
        birthdate: newDate,
        password,
        confirmPassword,
      },
      'birthdate'
    );
    setErrors((prev) => ({ ...prev, birthdate: error.birthdate }));
  };

  const handleFieldChange = (
    field: 'birthdate' | 'password' | 'confirmPassword',
    value: string
  ) => {
    onChange(field, value);

    const updatedValues = {
      birthdate,
      password,
      confirmPassword,
      [field]: value,
    };

    const validationErrors = validateStepCredentialsFields(
      updatedValues,
      field
    );

    setErrors((prev) => {
      const newErrors = { ...prev };

      if (!validationErrors[field]) {
        delete newErrors[field];
      } else {
        newErrors[field] = validationErrors[field];
      }

      return newErrors;
    });
  };

  

  return (
    <View style={styles.card}>
      <Text style={styles.stepTitle}>Étape 2 : Date de naissance et mot de passe</Text>
      <Text style={styles.stepDescription}>
        Choisis ta date de naissance, puis définis un mot de passe sécurisé.
      </Text>

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

      <View style={styles.fieldContainer}>
        <TextInput
        key={showPassword ? 'visible' : 'hidden'}
          mode="outlined"
          label="Mot de passe"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={(t) => handleFieldChange('password', t)}
          onLayout={() => {}}
          autoComplete="password"
          style={styles.input}
          left={<TextInput.Icon icon={() => <FieldIcon name="lock" />} />}
          right={
            <TextInput.Icon
              icon={showPassword ? 'eye-off' : 'eye'}
              onPress={() => setShowPassword((v) => !v)}
            />
          }
        />
        <PasswordStrengthIndicator password={password} />
        <HelperText type="error" visible={!!errors.password} style={styles.errorText}>
          {errors.password}
        </HelperText>
      </View>

      <View style={styles.fieldContainer}>
        <TextInput
          key={showConfirm ? 'visible' : 'hidden'}
          mode="outlined"
          label="Confirmer le mot de passe"
          secureTextEntry={!showConfirm}
          value={confirmPassword}
           onLayout={() => {}}
          autoComplete="password"
          onChangeText={(t) => handleFieldChange('confirmPassword', t)}
          style={styles.input}
          left={<TextInput.Icon icon={() => <FieldIcon name="key" />} />}
          right={
            <TextInput.Icon
              icon={showConfirm ? 'eye-off' : 'eye'}
              onPress={() => setShowConfirm((v) => !v)}
            />
          }
        />
        <HelperText type="error" visible={!!errors.confirmPassword} style={styles.errorText}>
          {errors.confirmPassword}
        </HelperText>
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
    marginBottom: 16,
  },
  stepDescription: {
    fontSize: 16,
    color: '#4B5563',
    marginTop: 1,
    marginBottom: 24,
    lineHeight: 24,
   
    
  },
  fieldContainer: {
    marginBottom: 19,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 2,
    height: 55,
    paddingHorizontal: 20,
    fontSize: 16,
  },
  errorText: {
    marginLeft: -5,
    color: '#DC2626',
    fontSize: 13,
    marginTop: -2,
    marginBottom: 8,
  },
  
});

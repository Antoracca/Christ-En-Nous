import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { lightTheme } from '../../../constants/theme';

const { colors, fonts } = lightTheme;

type Props = {
  form: { fidelite: string; dob: Date; role: string };
  onChange: (key: string, value: any) => void;
  showDatePicker: boolean;
  setShowDatePicker: (v: boolean) => void;
};

export default function Step3({ form, onChange, showDatePicker, setShowDatePicker }: Props) {
  return (
    <View>
      {/* Nouveau / Ancien fidèle */}
      <View style={styles.segmented}>
        {['nouveau', 'ancien'].map(option => (
          <TouchableOpacity
            key={option}
            style={[
              styles.segment,
              form.fidelite === option && styles.segmentActive,
            ]}
            onPress={() => onChange('fidelite', option)}
          >
            <Text
              style={[
                styles.segmentText,
                form.fidelite === option && { color: '#fff' },
              ]}
            >
              {option === 'nouveau' ? 'Nouveau fidèle' : 'Ancien fidèle'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.description}>Obligatoire</Text>

      {/* Date de naissance */}
      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={styles.datePickerButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.input}>{form.dob.toLocaleDateString()}</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.description}>Date de naissance *</Text>
      {showDatePicker && (
        <DateTimePicker
          value={form.dob}
          mode="date"
          maximumDate={new Date()}
          onChange={(_, date) => {
            setShowDatePicker(false);
            date && onChange('dob', date);
          }}
        />
      )}

      {/* Rôle dans l’église */}
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Rôle dans l’église (optionnel)"
          placeholderTextColor={colors.border}
          style={styles.input}
          value={form.role}
          onChangeText={v => onChange('role', v)}
        />
      </View>
      <Text style={styles.description}>Ex. Chantre, Animateur…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  segmented: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  segment: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    alignItems: 'center',
  },
  segmentActive: {
    backgroundColor: colors.primary,
  },
  segmentText: {
    color: colors.text,
  },
  inputContainer: {
    width: '100%',
    height: 54,
    borderRadius: 14,
    padding: 2,
    marginBottom: 4,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: fonts.sizes.medium,
    color: colors.text,
  },
  datePickerButton: {
    flex: 1,
    justifyContent: 'center',
  },
  description: {
    fontSize: 12,
    color: colors.text,
    fontStyle: 'italic',
    marginBottom: 12,
  },
});

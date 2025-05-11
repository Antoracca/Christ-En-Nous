import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { lightTheme } from '../../../constants/theme';

const { colors, fonts } = lightTheme;

type Props = {
  form: { password: string; confirm: string };
  onChange: (key: string, value: any) => void;
};

export default function Step5({ form, onChange }: Props) {
  return (
    <View>
      {/* Mot de passe */}
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Mot de passe *"
          placeholderTextColor={colors.border}
          style={styles.input}
          secureTextEntry
          value={form.password}
          onChangeText={v => onChange('password', v)}
        />
      </View>
      <Text style={styles.description}>Au moins 6 caractères</Text>

      {/* Confirmation */}
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Confirmer mot de passe *"
          placeholderTextColor={colors.border}
          style={styles.input}
          secureTextEntry
          value={form.confirm}
          onChangeText={v => onChange('confirm', v)}
        />
      </View>
      <Text style={styles.description}>Vérifie que les deux sont identiques</Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
  description: {
    fontSize: 12,
    color: colors.text,
    fontStyle: 'italic',
    marginBottom: 12,
  },
});

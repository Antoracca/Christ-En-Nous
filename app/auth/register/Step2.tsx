import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { lightTheme } from '../../../constants/theme';

const { colors, fonts } = lightTheme;

type Props = {
  form: { quartier: string; ville: string; pays: string };
  onChange: (key: string, value: any) => void;
};

export default function Step2({ form, onChange }: Props) {
  return (
    <View>
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Quartier (optionnel)"
          placeholderTextColor={colors.border}
          style={styles.input}
          value={form.quartier}
          onChangeText={v => onChange('quartier', v)}
        />
      </View>
      <Text style={styles.description}>Ex. Centre-ville</Text>

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Ville *"
          placeholderTextColor={colors.border}
          style={styles.input}
          value={form.ville}
          onChangeText={v => onChange('ville', v)}
        />
      </View>
      <Text style={styles.description}>Obligatoire</Text>

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Pays *"
          placeholderTextColor={colors.border}
          style={styles.input}
          value={form.pays}
          onChangeText={v => onChange('pays', v)}
        />
      </View>
      <Text style={styles.description}>Obligatoire</Text>
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

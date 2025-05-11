import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { lightTheme } from '../../../constants/theme';

const { colors, fonts } = lightTheme;

type Props = {
  form: { message: string };
  onChange: (key: string, value: any) => void;
};

export default function Step4({ form, onChange }: Props) {
  return (
    <View>
      {/* Message personnel */}
      <View style={styles.inputContainerLarge}>
        <TextInput
          placeholder="Message personnel / motivation"
          placeholderTextColor={colors.border}
          style={[styles.input, { height: 100 }]}
          multiline
          value={form.message}
          onChangeText={v => onChange('message', v)}
        />
      </View>
      <Text style={styles.description}>
        Pour mieux te connaître dès l’inscription
      </Text>

      {/* Photo de profil */}
      <TouchableOpacity style={styles.uploadButton}>
        <Text style={styles.uploadText}>Ajouter une photo de profil (optionnel)</Text>
      </TouchableOpacity>
      <Text style={styles.description}>Vous pouvez l’ajouter plus tard</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainerLarge: {
    width: '100%',
    borderRadius: 14,
    padding: 2,
    marginBottom: 4,
    overflow: 'hidden',
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: fonts.sizes.medium,
    color: colors.text,
  },
  uploadButton: {
    width: '100%',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginBottom: 4,
  },
  uploadText: {
    color: colors.text,
  },
  description: {
    fontSize: 12,
    color: colors.text,
    fontStyle: 'italic',
    marginBottom: 12,
  },
});

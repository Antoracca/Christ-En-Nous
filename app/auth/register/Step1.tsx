import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { lightTheme } from '../../../constants/theme';

const { colors, fonts } = lightTheme;

type Props = {
  form: { name: string; email: string; phone: string };
  onChange: (key: string, value: any) => void;
};

export default function Step1({ form, onChange }: Props) {
  return (
    <View style={styles.container}>
      {/* Nom complet */}
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Nom complet *"
          placeholderTextColor={colors.border}
          style={styles.input}
          value={form.name}
          onChangeText={v => onChange('name', v)}
        />
      </View>
      <Text style={styles.description}>Ton nom tel qu’il apparaîtra dans l’église</Text>

      {/* Email */}
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Email *"
          placeholderTextColor={colors.border}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          value={form.email}
          onChangeText={v => onChange('email', v)}
        />
      </View>
      <Text style={styles.description}>Adresse email valide</Text>

      {/* Téléphone */}
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Téléphone (optionnel)"
          placeholderTextColor={colors.border}
          style={styles.input}
          keyboardType="phone-pad"
          value={form.phone}
          onChangeText={v => onChange('phone', v)}
        />
      </View>
      <Text style={styles.description}>Vous pouvez l’ajouter plus tard</Text>

      {/* Bouton Suivant à droite (si tu veux le gérer ici directement, sinon supprime cette partie) */}
      {/* 
      <TouchableOpacity style={styles.nextButton}>
        <Text style={styles.nextButtonText}>Suivant</Text>
      </TouchableOpacity> 
      */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingBottom: 40,
  },
  inputContainer: {
    width: '100%',
    height: 54,
    borderRadius: 14,
    padding: 2,
    marginBottom: 4,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.6)',
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
  nextButton: {
    alignSelf: 'flex-end',
    backgroundColor: colors.secondary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 20,
  },
  nextButtonText: {
    color: '#000',
    fontSize: fonts.sizes.medium,
    fontWeight: '600',
  },
});

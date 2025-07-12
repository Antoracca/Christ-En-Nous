import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TextInput, HelperText } from 'react-native-paper';
import LeftInputIcon from '../../LeftInputIcon';

interface QuarterInputProps {
  value: string;
  error?: string;
  disabled?: boolean;
  onChange: (val: string) => void;
}

export default function QuarterInput({
  value,
  error,
  disabled = false,
  onChange,
}: QuarterInputProps) {
  return (
    <>
      <Text style={styles.label}>Adresse</Text>
      <View style={styles.field}>
        <LeftInputIcon icon="home" size={34} />
        <TextInput
          placeholder="Entrez votre quartier ou adresse complète"
          value={value}
          onChangeText={onChange}
          disabled={disabled}
          error={!!error}
          mode="flat"
          style={styles.input}
          underlineColor="transparent"
          placeholderTextColor="#999"
        />
      </View>
      <HelperText type="error" visible={!!error} style={styles.errorText}>
        {error}
      </HelperText>
    </>
  );
}

const styles = StyleSheet.create({
  label: {
    fontWeight: '600',
    fontSize: 15,
    color: '#333',
    marginBottom: 4,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F3F3',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 4,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    backgroundColor: 'transparent',
    marginLeft: 8, // ⬅️ petit espace entre icône et champ
    paddingVertical: 0,
    textAlign: 'left', // 👈 facultatif car c'est la valeur par défaut
  },
  errorText: {
    
    color: '#DC2626',
    fontSize: 13,
    marginTop: -2,
    marginBottom: -1,
    marginLeft: -10, // Pour aligner avec le champ
    marginRight: 1, // Pour aligner avec le champ
  },
});

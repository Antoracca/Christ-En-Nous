import React from 'react';
import { View, Text, StyleSheet, TextInput as RNTextInput } from 'react-native';
import { HelperText } from 'react-native-paper';
import LeftInputIcon from '../../LeftInputIcon';

interface QuarterInputProps {
  value: string;
  error?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  onFocus?: () => void;
}

export default function QuarterInput({
  value,
  error,
  disabled = false,
  onChange,
  onFocus,
}: QuarterInputProps) {
  return (
    <>
      <Text style={styles.label}>Quartier / Adresse</Text>
      <View style={styles.container}>
        <LeftInputIcon icon="home" size={30} />
        <RNTextInput
          style={styles.input}
          placeholder="Ex: Quartier Latin, Rue de la Paix"
          placeholderTextColor="#999"
          value={value}
          onChangeText={onChange}
          editable={!disabled}
          onFocus={onFocus}
          multiline
          numberOfLines={2}
          textAlignVertical="center"
          returnKeyType="done"
          blurOnSubmit={true}
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
    marginBottom: 6,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F3F3',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 6,
    minHeight: 60,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#000',
    minHeight: 40,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    marginLeft: -8,
    marginTop: -5,
    marginBottom: 8,
  },
});
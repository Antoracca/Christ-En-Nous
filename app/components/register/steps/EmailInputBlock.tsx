import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TextInput, HelperText } from 'react-native-paper';
import LeftInputIcon from '../../LeftInputIcon'; // ajuste le chemin si besoin

interface EmailInputProps {
  email: string;
  error?: string;
  onChange: (value: string) => void;
}

export default function EmailInputBlock({ email, error, onChange }: EmailInputProps) {
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[\w.-]+@[\w-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email.trim());
  };

  return (
    <>
      <View style={styles.customEmailContainer}>
        {/* Icône animée à gauche + label */}
        <View style={styles.iconSection}>
          <LeftInputIcon icon="envelope" />
         
        </View>

        {/* Zone de saisie */}
        <TextInput
          value={email}
          onChangeText={onChange}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.customInput}
          underlineColor="transparent"
          placeholder="exemple@domaine.com"
          textColor="#000"
        />
      </View>

      {/* Message d’erreur en dessous */}
      <View style={styles.emailErrorBox}>
        <HelperText
          type="error"
          visible={!!error || (email.length > 0 && !isValidEmail(email))}
          style={styles.emailErrorText}
        >
          {error ?? 'Adresse e-mail non valide (ex: antoni@gmail.com)'}
        </HelperText>
      </View>

      {/* Message d’information */}
      <View style={styles.emailInstructionBox}>
        <HelperText type="info" style={styles.instructionText}>
          Vous utiliserez cette adresse pour vous connecter.
        </HelperText>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  customEmailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    borderRadius: 10,
    borderWidth: -5,
    borderColor: '#D1D5DB',
    paddingHorizontal: 1,
    height: 75,
    marginBottom: 1,
  },
  iconSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
    marginRight: 8,
  },
 
  divider: {
    width: 1.5,
    height: '55%',
    backgroundColor: '#D1D5DB',
    marginHorizontal: -8,
  },
  customInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
    backgroundColor: 'transparent',
  },
  emailErrorBox: {
    marginTop: -1,
    marginLeft: 8,
  },
  emailErrorText: {
    color: '#DC2626',
    fontSize: 13,
    marginLeft: -5,
    marginBottom: 35,
    paddingHorizontal: 1,
  },
  emailInstructionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -30,
    marginBottom: -20,
    paddingVertical: 1,
    paddingHorizontal: 1,
    backgroundColor: '#FFF9E6',
    borderLeftWidth: 4,
    borderLeftColor: '#FACC15',
    borderRadius: 6,
  },
  instructionText: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    flex: 1,
    marginLeft: -10,
  },
});

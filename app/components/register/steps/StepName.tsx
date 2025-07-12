// StepName.tsx — carte unifiée sans conteneur ScrollView
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { TextInput, HelperText } from 'react-native-paper';
import SocialNetworks from 'app/screens/auth/SocialNetworks';
import LeftInputIcon from '../../LeftInputIcon';
import { validateStepNameFields, type NameFormErrors } from 'utils/validateStepNameFields';


interface StepNameProps {
  nom: string;
  prenom: string;
  username: string;
  onChange: (field: 'nom' | 'prenom' | 'username', value: string) => void;
  forceValidation?: boolean;
  nameDuplicateError?: boolean;
  usernameAvailable?: boolean | null;
  checkingUsername?: boolean;
}

export default function StepName({
  nom = '',
  prenom = '',
  username = '',
  onChange,
  forceValidation = false,
  nameDuplicateError = false,
  usernameAvailable = null,
  checkingUsername = false,
}: StepNameProps) { 
  const [errors, setErrors] = useState<NameFormErrors>({});

  // Validation en temps réel sur chaque champ
  const handleFieldChange = (field: 'nom' | 'prenom' | 'username', value: string) => {
    onChange(field, value);
    const validation = validateStepNameFields(
      { nom, prenom, username, [field]: value },
      field
    );
    setErrors((prev) => ({ ...prev, [field]: validation[field] }));
  };

  // Validation forcée lors du clic “Suivant”
  useEffect(() => {
    if (forceValidation) {
      const newErrors = validateStepNameFields({ nom, prenom, username });
      setErrors(newErrors);
    }
  }, [forceValidation, nom, prenom, username]);


  return (
    <View style={styles.card}>
      <Text style={styles.stepTitle}>Étape 1 : Informations personnelles</Text>
      <Text style={styles.stepDescription}>
        Commence par entrer ton nom, ton prénom, et choisis un nom d’utilisateur unique.
      </Text>

      {/* Champ NOM */}
      <View style={styles.fieldContainer}>
        <TextInput
          mode="outlined"
          label="Nom(s)"
          placeholder="Ex: Dupont"
          value={nom}
          onChangeText={(t) => handleFieldChange('nom', t)}
          left={<TextInput.Icon icon={() => <LeftInputIcon icon="user" />} />}
          style={styles.input}
        />
        <HelperText type="error" visible={!!errors.nom} style={styles.errorText}>
          {errors.nom}
        </HelperText>
      </View>

      {/* Champ PRÉNOM */}
      <View style={styles.fieldContainer}>
        <TextInput
          mode="outlined"
          label="Prénom(s)"
          placeholder="Ex: Jean"
          value={prenom}
          onChangeText={(t) => handleFieldChange('prenom', t)}
          left={<TextInput.Icon icon={() => <LeftInputIcon icon="user-alt" />} />}
          style={styles.input}
        />
        <HelperText type="error" visible={!!errors.prenom} style={styles.errorText}>
          {errors.prenom}
        </HelperText>
      </View>
 {/* Champ NOM D'UTILISATEUR */}
      <View style={styles.fieldContainer}>
        <TextInput
          mode="outlined"
          label="Nom d’utilisateur"
          placeholder="Ex: jean.dupont"
          value={username}
          onChangeText={t => handleFieldChange('username', t)}
          left={<TextInput.Icon icon={() => <LeftInputIcon icon="signature" />} />}
          right={
            checkingUsername ? (
              <View style={{ marginRight: 12 }}>
                <ActivityIndicator size="small" />
              </View>
            ) : username.length >= 3 && usernameAvailable !== null ? (
              <TextInput.Icon
                icon={usernameAvailable ? 'check-circle' : 'close-circle'}
                color={usernameAvailable ? '#10B981' : '#EF4444'}
              />
            ) : undefined
          }
          style={styles.input}
          autoCapitalize="none"
        />

        {/* 1. Indication “en cours de vérification” */}
        {checkingUsername && (
          <HelperText type="info" visible style={styles.infoText}>
            🔄 Vérification en cours…
          </HelperText>
        )}

        {/* 2. Disponible */}
        {!checkingUsername && usernameAvailable === true && (
          <HelperText type="info" visible style={styles.successText}>
            ✅ Nom d’utilisateur disponible
          </HelperText>
        )}

        {/* 3. Déjà pris */}
        {!checkingUsername && usernameAvailable === false && (
          <HelperText type="error" visible style={styles.errorText}>
            ❌ Nom d’utilisateur déjà pris
          </HelperText>
        )}

      </View>

      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>
          Vous l’utiliserez pour vous connecter.
        </Text>
      </View>

      {nameDuplicateError && (
        <View style={styles.globalErrorContainer}>
          <Text style={styles.globalErrorText}>
            Un utilisateur avec ce nom et ce prénom existe déjà. Veuillez vérifier.
          </Text>
        </View>
      )}


      <SocialNetworks
        onGooglePress={() => console.log('Google')}
        onFacebookPress={() => console.log('Facebook')}
        onApplePress={() => console.log('Apple')}
      />
      
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  stepTitle: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 16,
    color: '#1F2937',
  },
  stepDescription: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 24,
    lineHeight: 22,
  },
  globalErrorContainer: {
  marginTop: 10,
  padding: 10,
  backgroundColor: '#FEE2E2',
  borderRadius: 8,
  borderLeftWidth: 4,
  borderLeftColor: '#DC2626',
},
globalErrorText: {
  color: '#B91C1C',
  fontSize: 14,
  lineHeight: 18,
},

  fieldContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    height: 56,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  errorText: {
    marginLeft: -8,
    color: '#DC2626',
    fontSize: 13,
    marginTop: -2,
    marginBottom: 8,
  },
  instructionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -10,
    marginBottom: 5,
    paddingVertical: 6,
    paddingHorizontal: 8,
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
  },
  infoText: {
    marginLeft: -8,
    color: '#10B981',
    fontSize: 13,
    marginTop: 4,
  },
  successText: {
    marginLeft: -8,
    color: '#10B981',
    fontSize: 13,
    marginTop: 4,
  },
});

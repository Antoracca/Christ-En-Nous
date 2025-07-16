// StepName.tsx — Version améliorée avec feedback visuel optimisé
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Animated,
} from 'react-native';
import { TextInput, HelperText } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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
  const [fadeAnim] = useState(new Animated.Value(0));
  const [touched, setTouched] = useState({
    nom: false,
    prenom: false,
    username: false,
  });

  // Animation pour l'erreur nom+prénom
  useEffect(() => {
    if (nameDuplicateError) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [nameDuplicateError, fadeAnim]);

  // Validation en temps réel sur chaque champ
  const handleFieldChange = (field: 'nom' | 'prenom' | 'username', value: string) => {
    onChange(field, value);
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Validation immédiate pour ce champ uniquement s'il a été touché
    if (touched[field] || forceValidation) {
      const validation = validateStepNameFields(
        { nom, prenom, username, [field]: value },
        field
      );
      setErrors((prev) => ({ ...prev, [field]: validation[field] || undefined }));
    }
  };

  // Validation forcée lors du clic "Suivant"
  useEffect(() => {
    if (forceValidation) {
      const newErrors = validateStepNameFields({ nom, prenom, username });
      setErrors(newErrors);
      setTouched({ nom: true, prenom: true, username: true });
    }
  }, [forceValidation, nom, prenom, username]);

  // Fonction pour obtenir l'icône de statut username
  const getUsernameStatusIcon = () => {
  // 1️⃣ Loader pendant la requête Firestore
  if (checkingUsername) {
    return (
      <View style={styles.statusIconContainer}>
        <ActivityIndicator size="small" color="#3B82F6" />
      </View>
    );
  }
    
    // 2️⃣ Icône verte si disponible (succès) — c'est le SEUL cas où on affiche une icône
  if (username.length >= 3 && usernameAvailable === true) {
    return (
      <MaterialCommunityIcons
        name="check-circle"
        size={24}
        color="#10B981"
      />
    );
  }

  // 3️⃣ Tous les autres cas (pris, format invalide, vide) → aucune icône
  return null;
};

  // Fonction pour obtenir le message d'état du username
const getUsernameHelperText = () => {
  // 1️⃣ Loader textuel (facultatif mais clair)
  if (checkingUsername) {
  return (
    <View style={styles.helperRow}>
      {/* loader animé */}
    
      <HelperText type="info" visible style={styles.infoText}>
        Vérification en cours…
      </HelperText>
    </View>
  );
}

  // 2️⃣ Erreur "username pris"
  if (!checkingUsername && usernameAvailable === false) {
    return (
      <HelperText type="error" visible style={styles.errorText}>
        <MaterialCommunityIcons name="close" size={14} /> Ce nom d’utilisateur est déjà pris
      </HelperText>
    );
  }

  // 3️⃣ Erreur de format (regex)
  if (errors.username && touched.username) {
    return (
      <HelperText type="error" visible style={styles.errorText}>
        {errors.username}
      </HelperText>
    );
  }

  // 4️⃣ Succès (disponible) → aucun HelperText : l’icône verte suffit
  return null;
};


  return (
    <View style={styles.card}>
      <Text style={styles.stepTitle}>Étape 1 : Informations personnelles</Text>
      <Text style={styles.stepDescription}>
        Commence par entrer ton nom, ton prénom, et choisis un nom d&apos;utilisateur unique.
      </Text>

      {/* ========== ERREUR GLOBALE NOM+PRÉNOM ========== */}
      {nameDuplicateError && (
        <Animated.View 
          style={[
            styles.globalErrorContainer,
            { opacity: fadeAnim }
          ]}
        >
          <MaterialCommunityIcons 
            name="alert-circle" 
            size={20} 
            color="#DC2626" 
            style={styles.errorIcon}
          />
          <Text style={styles.globalErrorText}>
            Un utilisateur avec ce nom et ce prénom existe déjà. 
            Veuillez vérifier vos informations ou contacter l&apos;administrateur.
          </Text>
        </Animated.View>
      )}

      {/* ========== CHAMP NOM ========== */}
      <View style={styles.fieldContainer}>
        <TextInput
          mode="outlined"
          label="Nom(s)"
          placeholder="Ex: Dupont"
          value={nom}
          onChangeText={(text) => handleFieldChange('nom', text)}
          onBlur={() => setTouched(prev => ({ ...prev, nom: true }))}
          left={<TextInput.Icon icon={() => <LeftInputIcon icon="user" />} />}
          style={styles.input}
          error={!!errors.nom && (touched.nom || forceValidation)}
          outlineColor="#E5E7EB"
          activeOutlineColor="#3B82F6"
        />
        {errors.nom && (touched.nom || forceValidation) && (
          <HelperText type="error" visible style={styles.errorText}>
            {errors.nom}
          </HelperText>
        )}
      </View>

      {/* ========== CHAMP PRÉNOM ========== */}
      <View style={styles.fieldContainer}>
        <TextInput
          mode="outlined"
          label="Prénom(s)"
          placeholder="Ex: Jean"
          value={prenom}
          onChangeText={(text) => handleFieldChange('prenom', text)}
          onBlur={() => setTouched(prev => ({ ...prev, prenom: true }))}
          left={<TextInput.Icon icon={() => <LeftInputIcon icon="user-alt" />} />}
          style={styles.input}
          error={!!errors.prenom && (touched.prenom || forceValidation)}
          outlineColor="#E5E7EB"
          activeOutlineColor="#3B82F6"
        />
        {errors.prenom && (touched.prenom || forceValidation) && (
          <HelperText type="error" visible style={styles.errorText}>
            {errors.prenom}
          </HelperText>
        )}
      </View>

      {/* ========== CHAMP USERNAME ========== */}
      <View style={styles.fieldContainer}>
        <TextInput
          mode="outlined"
          label="Nom d'utilisateur"
          placeholder="Ex: jean.dupont"
          value={username}
          onChangeText={(text) => handleFieldChange('username', text)}
          onBlur={() => setTouched(prev => ({ ...prev, username: true }))}
          left={<TextInput.Icon icon={() => <LeftInputIcon icon="signature" />} />}
          right={getUsernameStatusIcon() ? 
            <TextInput.Icon icon={() => getUsernameStatusIcon()} /> : 
            undefined
          }
          style={styles.input}
          autoCapitalize="none"
          error={(!!errors.username && touched.username) || usernameAvailable === false}
          outlineColor="#E5E7EB"
          activeOutlineColor="#3B82F6"
        />
        {getUsernameHelperText()}
      </View>

      {/* Info sur l'utilisation du username */}
      <View style={styles.instructionContainer}>
        <MaterialCommunityIcons 
          name="information" 
          size={18} 
          color="#3B82F6" 
          style={styles.infoIcon}
        />
        <Text style={styles.instructionText}>
          Vous l&apos;utiliserez pour vous connecter à l&apos;application.
        </Text>
      </View>

      {/* Réseaux sociaux */}
      <View style={styles.socialContainer}>
        <SocialNetworks
          onGooglePress={() => console.log('Google')}
          onFacebookPress={() => console.log('Facebook')}
          onApplePress={() => console.log('Apple')}
        />
      </View>
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
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 24,
    lineHeight: 22,
    textAlign: 'center',
  },
  fieldContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    fontSize: 16,
  },
  statusIconContainer: {
    justifyContent: 'center',
    paddingRight: 8,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    marginTop: 4,
    marginLeft: -8,
  },
  successText: {
    color: '#10B981',
    fontSize: 13,
    marginTop: 4,
    marginLeft: 8,
    fontWeight: '500',
  },
  infoText: {
    color: '#3B82F6',
    fontSize: 12,
    marginTop: 4,
    marginLeft: -8,
  },
  instructionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F0F9FF',
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
    borderRadius: 8,
  },
  instructionText: {
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 18,
    flex: 1,
    marginRight: 15,
  },
  infoIcon: {
    marginRight: 5,
  },
  globalErrorContainer: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  globalErrorText: {
    color: '#B91C1C',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    flex: 1,
  },
  errorIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  socialContainer: {
    marginTop: 20,
  },
  helperRow: {
  flexDirection: 'row',
  alignItems: 'center',
},
helperSpinner: {
  marginRight: 8,
},

});
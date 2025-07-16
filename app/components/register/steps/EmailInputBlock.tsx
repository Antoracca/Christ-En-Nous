// components/register/steps/EmailInputBlock.tsx — Version avec validation temps réel
import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { TextInput, HelperText } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import LeftInputIcon from '../../LeftInputIcon';

interface EmailInputProps {
  email: string;
  error?: string;
  onChange: (value: string) => void;
  // 🎯 Nouvelles props pour la validation temps réel
  checking?: boolean;
  available?: boolean | null;
}

export default function EmailInputBlock({ 
  email, 
  error, 
  onChange,
  checking = false,
  available = null 
}: EmailInputProps) {
  
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[\w.-]+@[\w-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email.trim());
  };

  // 🎯 Fonction pour obtenir l'icône de statut email
  const getEmailStatusIcon = () => {
    // 1️⃣ Loader pendant la vérification Firestore
    if (checking) {
      return (
        <View style={styles.statusIconContainer}>
          <ActivityIndicator size="small" color="#3B82F6" />
        </View>
      );
    }
    
    // 2️⃣ Icône verte si email disponible et format valide
    if (email.length >= 5 && isValidEmail(email) && available === true) {
      return (
        <MaterialCommunityIcons
          name="check-circle"
          size={24}
          color="#10B981"
        />
      );
    }

    // 3️⃣ Tous les autres cas → aucune icône
    return null;
  };

  // 🎯 Fonction pour obtenir le message d'aide email
  const getEmailHelperText = () => {
    // 1️⃣ Loader textuel pendant vérification
    if (checking) {
      return (
        <HelperText type="info" visible style={styles.infoText}>
          Vérification de la disponibilité...
        </HelperText>
      );
    }

    // 2️⃣ Erreur "email déjà pris" (géré par le container d'erreur principal)
    if (!checking && available === false && isValidEmail(email)) {
      return (
        <HelperText type="error" visible style={styles.errorText}>
          <MaterialCommunityIcons name="close" size={14} /> Cette adresse est déjà utilisée
        </HelperText>
      );
    }

    // 3️⃣ Erreur de format email
    if (email.length > 0 && !isValidEmail(email)) {
      return (
        <HelperText type="error" visible style={styles.errorText}>
          Format d&apos;adresse e-mail invalide
        </HelperText>
      );
    }

    // 4️⃣ Erreur de validation générale (du parent)
    if (error) {
      return (
        <HelperText type="error" visible style={styles.errorText}>
          {error}
        </HelperText>
      );
    }

    // 5️⃣ Succès silencieux - pas de message, juste l'icône verte
    return null;
  };

  return (
    <>
      <View style={styles.customEmailContainer}>
        {/* Icône animée à gauche */}
        <View style={styles.iconSection}>
          <LeftInputIcon icon="envelope" />
        </View>

        {/* Zone de saisie avec icône de validation à droite */}
        <TextInput
          value={email}
          onChangeText={onChange}
          keyboardType="email-address"
          autoCapitalize="none"
          style={[
            styles.customInput,
            // 🎨 Bordure verte discrète si email valide et disponible
            (isValidEmail(email) && available === true) && styles.inputSuccess
          ]}
          underlineColor="transparent"
          placeholder="exemple@domaine.com"
          textColor="#000"
          right={getEmailStatusIcon() ? 
            <TextInput.Icon icon={() => getEmailStatusIcon()} /> : 
            undefined
          }
        />
      </View>

      {/* Message d'aide contextuel */}
      <View style={styles.emailErrorBox}>
        {getEmailHelperText()}
      </View>

      {/* Message d'information général */}
<View style={styles.emailInstructionBox}>
  <MaterialCommunityIcons 
    name="information" 
    size={18} 
    color="#3B82F6" 
    style={styles.infoIcon}
  />
  <Text style={styles.instructionText}>
    Vous utiliserez cette adresse pour vous connecter et recevoir les informations importantes.
  </Text>
</View>
    </>
  );
}

const styles = StyleSheet.create({
  inputSuccess: {
    borderColor: '#10B981',
  },
  customEmailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 4,
    height: 75,
    marginBottom: 4,
  },
  
  infoIcon: {
  marginRight: 15,
  marginTop: -35,
},
  iconSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
    marginRight: 8,
  },
  customInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
    backgroundColor: 'transparent',
  },
  statusIconContainer: {
    justifyContent: 'center',
    paddingRight: 8,
  },
  emailErrorBox: {
    marginTop: 2,
    marginLeft: 8,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    marginLeft: -5,
    marginBottom: 8,
  },
  infoText: {
    color: '#3B82F6',
    fontSize: 12,
    marginLeft: -5,
    marginBottom: 8,
  },
   emailInstructionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F0F9FF', // 🎯 Même couleur que StepName
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6', // 🎯 Même couleur que StepName
    borderRadius: 8,
  },
  instructionText: {
     fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    flex: 1,
  },
});
import React, { useState , useEffect } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,

} from 'react-native';
import { Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { PhoneNumberUtil } from 'google-libphonenumber';
import { useNavigation } from '@react-navigation/native';
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import RegisterHeader from '../../components/register/RegisterHeader';
import StepName from '../../components/register/steps/StepName';
import StepCredentials from '../../components/register/steps/StepCredentials';
import StepContact from '../../components/register/steps/StepContact';
import StepLocation from '../../components/register/steps/StepLocation';
import StepBaptism from '../../components/register/steps/StepBaptism';
import StepChurchRole from '../../components/register/steps/StepChurchRole';
import StepDiscovery from '../../components/register/steps/StepDiscovery';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from 'navigation/AppNavigator'; // ou le bon chemin
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { isValidUsernameFormat } from 'utils/isValidUsernameFormat';

import { auth, db } from '../../../services/firebase/firebaseConfig';

import SuccessModal from '../../components/register/SuccessModal';
import { mapStepBaptismToFirestore } from 'utils/mapStepBaptismToFirestore'; // adapte le chemin si besoin
import LottieView from 'lottie-react-native';
import { isNameAndSurnameTaken } from 'utils/firestoreValidation';



import { validateStepNameFields } from 'utils/validateStepNameFields';
import { validateStepCredentialsFields } from 'utils/validateStepCredentialsFields';
import rolesData from 'assets/data/churchRoles.json';

export default function RegisterScreen() {
  const phoneUtil = PhoneNumberUtil.getInstance();
  const [step, setStep] = useState(0);
  const [forceValidation, setForceValidation] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
const [showSuccessModal, setShowSuccessModal] = useState(false);
const [loading, setLoading] = useState(false);
const [showCheck, setShowCheck] = useState(false);
const [nameDuplicateError, setNameDuplicateError] = useState(false);

  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    username: '',
    birthdate: '',
    password: '',
    confirmPassword: '',
    email: '',
    phone: '',
    pays: '',
    ville: '',
    quartier: '',
    baptise: '',
    desire: '',
    immersion: '',
    statut: '',
    fonction: '',
    sousFonction: '',
    moyen: '',
    recommandePar: '',
    egliseOrigine: '',
  });
const [usernameAvailable, setUsernameAvailable] = useState<boolean|null>(null);
const [checkingUsername, setCheckingUsername]   = useState(false);
const usernameFormatValid = isValidUsernameFormat(form.username);
const nextDisabled = !usernameFormatValid || checkingUsername || usernameAvailable === false;
useEffect(() => {
  const username = form.username.trim().toLowerCase();

  if (!isValidUsernameFormat(username)) {
    // ❌ Format incorrect → on ne fait rien
    setUsernameAvailable(null);
    setCheckingUsername(false);
    return;
  }

  setCheckingUsername(true);
  const handle = setTimeout(async () => {
    const taken = await isUsernameTaken(username);
    setUsernameAvailable(!taken);
    setCheckingUsername(false);
  }, 1000);

  return () => clearTimeout(handle);
}, [form.username]);




  async function isUsernameTaken(username: string): Promise<boolean> {
  const q = query(collection(db, 'users'), where('username', '==', username.trim()));
  const snapshot = await getDocs(q);
  return !snapshot.empty;
}

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    
};

  const handleRegister = async () => {
  if (!validateCurrentStep()) {
    setForceValidation(true);
    return;
  }
   setLoading(true); // ⏳ Commence le spinner


  try {
    setForceValidation(false);
    const baptismData = mapStepBaptismToFirestore({
      baptise: form.baptise as 'oui' | 'non' | '',
      immersion: form.immersion as 'oui' | 'non' | '',
      desire: form.desire as 'oui' | 'non' | '',
    });

    // Création de l’utilisateur Firebase Auth
    const userCred = await createUserWithEmailAndPassword(auth, form.email, form.password);
    const uid = userCred.user.uid;

    // Ajout dans Firestore
    await setDoc(doc(db, 'users', uid), {
      ...form,
      ...baptismData,
      uid,
      createdAt: new Date().toISOString(),
    });
    setShowCheck(true); // ✅ check animé visible
     setTimeout(() => {
      setShowSuccessModal(true);
      setShowCheck(false);
    }, 2800); // laisse le temps au check d’être vu avant modal

    // Redirection vers Home
    setShowSuccessModal(true);
  } catch (error: any) {
    console.error('handleRegister error:', error);
    alert("Une erreur s'est produite lors de l'inscription. Veuillez réessayer.");
  }
  finally {
    setLoading(false); // ✅ Stoppe le spinner
  }
};

async function validateCurrentStep(): Promise<boolean> {
  switch (step) {
    case 0: {
      console.log('🔘 validateCurrentStep STEP 0 – début', { nom: form.nom, prenom: form.prenom, username: form.username });
      const errs = validateStepNameFields({ nom: form.nom, prenom: form.prenom, username: form.username });
      console.log('🔍 validateStepNameFields errs =', errs);
      if (Object.keys(errs).length > 0) return false;

      const duplicate = await isNameAndSurnameTaken(form.nom, form.prenom);
      console.log('🔍 validateCurrentStep isNameAndSurnameTaken → duplicate =', duplicate);
      setNameDuplicateError(duplicate);
      console.log('🔘 validateCurrentStep STEP 0 – fin');
      return !duplicate;
    }
    case 1: {
      const errs = validateStepCredentialsFields({
        birthdate: form.birthdate,
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
      return Object.keys(errs).length === 0;
    }
    case 2: { 
      // email + phone
      const isValidEmail = (e: string) =>
        /^[\w.-]+@[\w-]+\.[a-zA-Z]{2,}$/.test(e.trim());
      if (!form.email.trim() || !isValidEmail(form.email)) return false;
      try {
        const parsed = phoneUtil.parse(form.phone);
        if (!phoneUtil.isValidNumber(parsed)) return false;
      } catch {
        return false;
      }
      return true;
    }
    case 3: {
      // localisation
      if (!form.pays) return false;
      if (!form.ville) return false;
      if (!form.quartier || form.quartier.trim().length < 2) return false;
      return true;
    }
    case 4: {
      // baptême
      const { baptise, desire, immersion } = form;
      if (!baptise) return false;
      if (baptise === 'non' && !desire) return false;
      if (baptise === 'oui') {
        if (!immersion) return false;
        if (immersion === 'non' && !desire) return false;
      }
      return true;
    }
    case 5: {
      // rôle d'église
      const { statut, fonction, sousFonction } = form;
      if (!statut) return false;
      if (!fonction) return false;
      const subs = rolesData[fonction as keyof typeof rolesData] || [];
      const manualSub = !!fonction && subs.length === 0;
      if (!manualSub && subs.length > 0 && !sousFonction) return false;
      if (manualSub && !sousFonction) return false;
      return true;
    }
    case 6: {
      // découverte
      const { moyen, recommandePar, egliseOrigine } = form;
      if (!moyen) return false;
      if (moyen === 'Autre' && !recommandePar.trim()) return false;
      if (!egliseOrigine) return false;
      return true;
    }
    default:
      return true;
  }
}

  const renderStep = () => {
    switch (step) {
      case 0:
  return (
   <StepName
  nom={form.nom}
  prenom={form.prenom}
  username={form.username}
  onChange={handleChange}
  forceValidation={forceValidation}
  nameDuplicateError={nameDuplicateError}
  usernameAvailable={usernameAvailable}
  checkingUsername={checkingUsername}
/>


  );

      case 1:
        return (
          <StepCredentials
            birthdate={form.birthdate}
            password={form.password}
            confirmPassword={form.confirmPassword}
            onChange={handleChange}
             forceValidation={forceValidation}
          />
        );
      case 2:
        return (
          <StepContact
            email={form.email}
            phone={form.phone}
            country={form.pays}
            onChange={handleChange}
            forceValidation={forceValidation}
          />
        );
      case 3:
        return (
          <StepLocation
            country={form.pays}
            city={form.ville}
            quarter={form.quartier}
            onChange={(field, value) => {
              const map = {
                country: 'pays',
                city: 'ville',
                quarter: 'quartier',
              } as const;
              handleChange(map[field], value);
            }}
             forceValidation={forceValidation}
          />
        );
      case 4:
        return (
          <StepBaptism
            baptise={form.baptise as 'oui' | 'non' | ''}
            desire={form.desire as 'oui' | 'non' | ''}
            immersion={form.immersion as 'oui' | 'non' | ''}
            onChange={handleChange}
            forceValidation={forceValidation}
          />
        );
      case 5:
        return (
          <StepChurchRole
            statut={form.statut as 'nouveau' | 'ancien' | ''}
            fonction={form.fonction}
            sousFonction={form.sousFonction}
            onChange={handleChange}
             forceValidation={forceValidation}
          />
        );
      case 6:
        return (
          <StepDiscovery
            moyen={form.moyen}
            recommandePar={form.recommandePar}
            egliseOrigine={form.egliseOrigine}
            onChange={handleChange}
             forceValidation={forceValidation}
          />
        );
    }
  };

  const renderNavigation = () => {
   
    if (step === 0) {
      return (
        <View style={styles.singleButtonContainer}>
          <Button
            mode="contained"
            onPress={async () => {
  console.log('🔘 Bouton Suivant pressé !');
  console.log('✅ validateCurrentStep appelée pour l’étape', step);
  const valid = await validateCurrentStep();
  console.log('🔀 validateCurrentStep → valid =', valid);
  if (valid) {
    setForceValidation(false);
    setStep(step + 1);
    console.log(`➡️ Passage à l’étape ${step + 1}`);
  } else {
    setForceValidation(true);
  }
}}
disabled={nextDisabled}
  style={[styles.fullWidthButton, nextDisabled && styles.buttonDisabled]}
 icon={() => <Ionicons name="arrow-forward" size={20} color="white" />}
          >
            Suivant
          </Button>
        </View>
      );
    }

if (step >= 1 && step < 6) {
  return (
    <View style={styles.navigationButtons}>
      <Button
        mode="outlined"
        onPress={() => {
          setForceValidation(false);
          setStep(step - 1);
        }}
        style={styles.wideButton}
        contentStyle={styles.buttonContent}
        icon={() => <Ionicons name="arrow-back" size={20} color="#000" />}
      >
        Précédent
      </Button>
      <Button
        mode="contained"
        onPress={async () => {
  const valid = await validateCurrentStep();
  if (valid) {
    setForceValidation(false);
    setStep(step + 1);
  } else {
    setForceValidation(true);
  }
}}

        style={styles.wideButton}
        contentStyle={styles.buttonContent}
        icon={() => <Ionicons name="arrow-forward" size={20} color="white" />}
      >
        Suivant
      </Button>
    </View>
  );
}


    if (step === 6) {
  return (
    <View style={styles.navigationButtons}>
      <Button
        mode="outlined"
        onPress={() => {
          
          setForceValidation(false);
          setStep(step - 1);
        }}
        style={styles.wideButton}
        contentStyle={styles.buttonContent}
        icon={() => <Ionicons name="arrow-back" size={20} color="#000" />}
      >
        Précédent
      </Button>
      <Button
  mode="contained"
  onPress={handleRegister}
  loading={loading}
  disabled={loading}
  style={styles.wideButton}
  contentStyle={styles.buttonContent}
  icon={() => <Ionicons name="checkmark" size={20} color="white" />}
>
  {loading ? 'Inscription en cours...' : 'S’inscrire'}
</Button>

    </View>
  );
}


    return null;
  };



  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollView}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <RegisterHeader logoSize={100} />
        <View style={styles.formContainer}>{renderStep()}</View>
        {renderNavigation()}
        {showCheck && (
  <View style={styles.lottieContainer}>
    <LottieView
      source={require('assets/animations/check-success.json')}
      autoPlay
      loop={false}
      style={{ width: 120, height: 120 }}
    />
  </View>
)}
        {showSuccessModal && (
  <SuccessModal onContinue={() => navigation.replace('Home')} visible={true} />
)}


      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flexGrow: 1 },
  formContainer: { padding: 20, marginTop: 20 },
  navigationButtons: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  wideButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  buttonContent: {
    paddingVertical: 12,
  },
  singleButtonContainer: {
    marginTop: 30,
    marginBottom: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  fullWidthButton: {
    width: '100%',
  },
   buttonDisabled: {
    backgroundColor: '#cccccc',  // gris clair
  },
  
  fullWidthButtonContent: {
    paddingVertical: 14,
  },
  lottieContainer: {
  position: 'absolute',
  top: '45%',
  left: 0,
  right: 0,
  alignItems: 'center',
  zIndex: 999,
},

  finishedText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 40,
  },
});


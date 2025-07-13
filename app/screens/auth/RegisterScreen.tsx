import React, { useState , useEffect } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import { Button } from 'react-native-paper';
import {   Ionicons } from '@expo/vector-icons';
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
import type { RootStackParamList } from 'navigation/AppNavigator';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { isValidUsernameFormat } from 'utils/isValidUsernameFormat';
import { auth, db } from '../../../services/firebase/firebaseConfig';
import SuccessModal from '../../components/register/SuccessModal';
import { mapStepBaptismToFirestore } from 'utils/mapStepBaptismToFirestore';
import LottieView from 'lottie-react-native';
import { isNameAndSurnameTaken } from 'utils/isNameAndSurnameTaken'; // ✅ Import corrigé
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
  const [checkingUsername, setCheckingUsername] = useState(false);

  // Fonction pour déterminer si le bouton "Suivant" doit être désactivé
  const getNextButtonDisabled = () => {
    if (step === 0) {
      const hasEmptyFields = !form.nom.trim() || !form.prenom.trim() || !form.username.trim();
      const usernameInvalid = form.username.length >= 3 && !isValidUsernameFormat(form.username);
      
      return hasEmptyFields || 
             checkingUsername || 
             usernameAvailable === false || 
             usernameInvalid ||
             nameDuplicateError;
    }
    return false;
  };

  const nextDisabled = getNextButtonDisabled();

  useEffect(() => {
    const username = form.username.trim().toLowerCase();

    // Reset states si username vide ou trop court
    if (!username || username.length < 3) {
      setUsernameAvailable(null);
      setCheckingUsername(false);
      return;
    }

    // Vérifier le format avant de lancer la requête
    if (!isValidUsernameFormat(username)) {
      setUsernameAvailable(null);
      setCheckingUsername(false);
      return;
    }

    // Lancer la vérification avec debounce
    setCheckingUsername(true);
    const timeoutId = setTimeout(async () => {
      try {
        const taken = await isUsernameTaken(username);
        setUsernameAvailable(!taken);
      } catch (error) {
        console.error('Erreur vérification username:', error);
        setUsernameAvailable(null);
      } finally {
        setCheckingUsername(false);
      }
    }, 1500); // 1.5 secondes de délai

    return () => clearTimeout(timeoutId);
  }, [form.username]);

  async function isUsernameTaken(username: string): Promise<boolean> {
    try {
      const q = query(collection(db, 'users'), where('username', '==', username.trim()));
      const snapshot = await getDocs(q);
      return !snapshot.empty;
    } catch (error) {
      console.error('❌ Erreur Firestore lors de la vérification username:', error);
      throw error;
    }
  }

  
   const handleChange = (field: keyof typeof form, value: string) => {
  setForm((prev) => ({ ...prev, [field]: value }));
  // 🔄 Si l’utilisateur modifie nom ou prénom après un doublon,
 // on efface immédiatement l’erreur pour débloquer le bouton.
if (nameDuplicateError && (field === 'nom' || field === 'prenom')) {
   setNameDuplicateError(false);
 }

};

  const handleRegister = async () => {
    if (!validateCurrentStep()) {
      setForceValidation(true);
      return;
    }
    setLoading(true);

    try {
      setForceValidation(false);
      const baptismData = mapStepBaptismToFirestore({
        baptise: form.baptise as 'oui' | 'non' | '',
        immersion: form.immersion as 'oui' | 'non' | '',
        desire: form.desire as 'oui' | 'non' | '',
      });

      // Création de l'utilisateur Firebase Auth
      const userCred = await createUserWithEmailAndPassword(auth, form.email, form.password);
      const uid = userCred.user.uid;
      const cleanForm = {
  nom: form.nom.trim(),
  prenom: form.prenom.trim(),
  username: form.username.trim().toLowerCase(),
  birthdate: formatDateToISO(form.birthdate), // à créer ci-dessous
  email: form.email.trim(),
  phone: form.phone.trim(),
  pays: form.pays.trim(),
  ville: form.ville.trim(),
  quartier: form.quartier.trim(),
  baptise: form.baptise,
  desire: form.desire,
  immersion: form.immersion,
  statut: form.statut,
  fonction: form.fonction,
  sousFonction: form.sousFonction,
  moyen: form.moyen,
  recommandePar: form.recommandePar,
  egliseOrigine: form.egliseOrigine,
};


      // Ajout dans Firestore
      await setDoc(doc(db, 'users', uid), {
  ...cleanForm,
  ...baptismData,
  uid,
  createdAt: new Date().toISOString(),
});
function formatDateToISO(dateStr: string): string {
  const [day, month, year] = dateStr.split('/');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`; // ex: 06/09/2004 → 2004-09-06
}

      
      setShowCheck(true);
      setTimeout(() => {
        setShowSuccessModal(true);
        setShowCheck(false);
      }, 2800);
      // ✅ Supprimé le double appel à setShowSuccessModal
    } catch (error: any) {
      console.error('handleRegister error:', error);
      alert("Une erreur s'est produite lors de l'inscription. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  async function validateCurrentStep(): Promise<boolean> {
    switch (step) {
      case 0: {
        // Reset l'erreur de doublon avant de vérifier
        setNameDuplicateError(false);
        
        console.log('🔍 Validation étape 0 - Informations personnelles');
        
        // 1. Valider le format des champs
        const errs = validateStepNameFields({ 
          nom: form.nom, 
          prenom: form.prenom, 
          username: form.username 
        });
        
        if (Object.keys(errs).length > 0) {
          console.log('❌ Erreurs de validation:', errs);
          return false;
        }

        // 2. Vérifier que la vérification username n'est pas en cours
        if (checkingUsername) {
          console.log('⏳ Vérification username en cours...');
          return false;
        }

        // 3. Vérifier que le username est disponible
        if (usernameAvailable === false) {
          console.log('❌ Username non disponible');
          return false;
        }

        // 4. Vérifier que la vérification a été faite si username >= 3 caractères
        if (form.username.length >= 3 && usernameAvailable === null) {
          console.log('⚠️ Vérification username pas encore effectuée');
          return false;
        }

        // 5. Vérifier le doublon nom+prénom
        console.log('🔍 Vérification doublon nom+prénom...');
        try {
          const duplicate = await isNameAndSurnameTaken(form.nom, form.prenom);
          setNameDuplicateError(duplicate);
          
          if (duplicate) {
            console.log('⚠️ Doublon nom+prénom détecté !');
            return false;
          }
          
          console.log('✅ Validation étape 0 réussie');
          return true;
        } catch (error) {
          console.error('❌ Erreur lors de la vérification:', error);
          // En cas d'erreur, on laisse passer pour ne pas bloquer
          return true;
        }
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
              console.log('✅ validateCurrentStep appelée pour l\'étape', step);
              const valid = await validateCurrentStep();
              console.log('🔀 validateCurrentStep → valid =', valid);
              if (valid) {
                setForceValidation(false);
                setStep(step + 1);
                console.log(`➡️ Passage à l'étape ${step + 1}`);
              } else {
                setForceValidation(true);
              }
            }}
            disabled={nextDisabled}
            style={[styles.wideButton, nextDisabled && styles.buttonDisabled]}
            contentStyle={styles.buttonContent}
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
            {loading ? 'Inscription en cours...' : "S'inscrire"}
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
 /* ---------- généraux ---------- */
  container: { flex: 1 },
  scrollView: { flexGrow: 1 },
  formContainer: { padding: 20, marginTop: 20 },


 /* ---------- navigation ---------- */
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 30,
    marginBottom: 40,
  },
  
  wideButton: {
 flex: 1,
    marginHorizontal: 5,   // petit espace entre les deux
    borderRadius: 25,        // coins ronds
},

  buttonContent: {
    paddingVertical: 10,  // ↑  hauteur (12 → 18)
  minHeight: 65,
  },
  singleButtonContainer: {
    width: '100%',
    borderRadius: 30,       // coins plus ronds
    marginTop: 1,
    marginBottom: 35,
    
    paddingHorizontal: 5,
  
  },
  fullWidthButton: {
    width: '100%',
    borderRadius: 30,       // coins plus ronds
//  elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
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
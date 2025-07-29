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
import { sendCustomVerificationEmail } from 'services/email/emailService';
import { isNameAndSurnameTaken } from 'utils/isNameAndSurnameTaken'; // ✅ Import corrigé
import { validateStepNameFields } from 'utils/validateStepNameFields';
import { validateStepCredentialsFields } from 'utils/validateStepCredentialsFields';
import rolesData from 'assets/data/churchRoles.json';


// Ajoute ce bouton à côté de l'autre

export default function RegisterScreen() {
  const phoneUtil = PhoneNumberUtil.getInstance();
  const [step, setStep] = useState(0);
  const [forceValidation, setForceValidation] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCheck, setShowCheck] = useState(false);
  const [nameDuplicateError, setNameDuplicateError] = useState(false);
  // 🎯 États pour la validation email et téléphone (à ajouter après vos useState existants)
const [emailAvailable, setEmailAvailable] = useState<boolean|null>(null);
const [phoneAvailable, setPhoneAvailable] = useState<boolean|null>(null);
const [checkingEmail, setCheckingEmail] = useState(false);
const [checkingPhone, setCheckingPhone] = useState(false);
const [emailDuplicateError, setEmailDuplicateError] = useState(false);
const [phoneDuplicateError, setPhoneDuplicateError] = useState(false);

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
  
  if (step === 2) {
    const hasEmptyFields = !form.email.trim() || !form.phone.trim();
    
    // 🎯 Validation format email
    const emailInvalid = form.email.length > 0 && !/^[\w.-]+@[\w-]+\.[a-zA-Z]{2,}$/.test(form.email.trim());
    
    // 🎯 Validation format téléphone
    let phoneInvalid = false;
    if (form.phone.trim()) {
      try {
        const parsed = phoneUtil.parse(form.phone);
        phoneInvalid = !phoneUtil.isValidNumber(parsed);
      } catch {
        phoneInvalid = true;
      }
    }
    
    // 🎯 LOGIQUE CLÉE : Le bouton est désactivé si :
    const shouldDisable = 
      hasEmptyFields ||                    // Champs vides
      emailInvalid ||                      // Format email invalide
      phoneInvalid ||                      // Format téléphone invalide
      checkingEmail ||                     // 🔥 Vérification email en cours
      checkingPhone ||                     // 🔥 Vérification téléphone en cours
      emailDuplicateError ||              // Email déjà utilisé
      phoneDuplicateError ||              // Téléphone déjà utilisé
      (form.email.length >= 5 && emailAvailable === null) ||    // Email pas encore vérifié
      (form.phone.length >= 8 && phoneAvailable === null) ||    // Téléphone pas encore vérifié
      emailAvailable === false ||         // Email indisponible
      phoneAvailable === false;           // Téléphone indisponible
    
  
  return shouldDisable;
};

  return false;
};
const testEmail = async () => {
  console.log('🧪 Test email en cours...');
  try {
    const result = await sendCustomVerificationEmail({
      userId: 'test-123',
      email: 'ouamsj@gmail.com', // ⚠️ REMPLACE PAR TON EMAIL
      prenom: 'Antoni',
      nom: 'Koueni'
    });
    
    if (result) {
      alert('✅ Email envoyé ! Vérifie ta boîte email');
    } else {
      alert('❌ Erreur envoi email');
    }
  } catch (error) {
    alert('💥 Erreur: ' + error);
    console.error(error);
  }
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

  // 🎯 Vérification email en temps réel
// 🎯 UseEffect pour la vérification email
useEffect(() => {
  const email = form.email.trim().toLowerCase();
  
  // Reset si email vide ou format invalide
  if (!email || !/^[\w.-]+@[\w-]+\.[a-zA-Z]{2,}$/.test(email)) {
    setEmailAvailable(null);
    setCheckingEmail(false);
    setEmailDuplicateError(false);
    return;
  }

  // 🎯 Commencer la vérification immédiatement
  setCheckingEmail(true);
  setEmailDuplicateError(false);  // Reset l'erreur avant la vérification
  ;
  const timeoutId = setTimeout(async () => {
    try {
      const taken = await isEmailTaken(email);
      setEmailAvailable(!taken);
      setEmailDuplicateError(taken);
    } catch (error) {
      console.error('Erreur vérification email:', error);
      setEmailAvailable(null);
      setEmailDuplicateError(false);
    } finally {
      setCheckingEmail(false);  // 🔥 CRUCIAL : Toujours arrêter le checking
    }
  }, 800); // Réduire à 800ms pour plus de réactivité

  return () => clearTimeout(timeoutId);
}, [form.email]);

// 🎯 UseEffect pour la vérification téléphone
useEffect(() => {
  const phone = form.phone.trim();
  
  // Reset si téléphone vide ou trop court
  if (!phone || phone.length < 8) {
    setPhoneAvailable(null);
    setCheckingPhone(false);
    setPhoneDuplicateError(false);
    return;
  }

  // Vérifier le format avec google-libphonenumber
  try {
    const parsed = phoneUtil.parse(phone);
    if (!phoneUtil.isValidNumber(parsed)) {
      setPhoneAvailable(null);
      setCheckingPhone(false);
      setPhoneDuplicateError(false);
      return;
    }
  } catch {
    setPhoneAvailable(null);
    setCheckingPhone(false);
    setPhoneDuplicateError(false);
    return;
  }

  // 🎯 Commencer la vérification immédiatement
  setCheckingPhone(true);
  setPhoneDuplicateError(false);  // Reset l'erreur avant la vérification
  
  const timeoutId = setTimeout(async () => {
    try {
      const taken = await isPhoneTaken(phone);
      setPhoneAvailable(!taken);
      setPhoneDuplicateError(taken);
    } catch (error) {
      console.error('Erreur vérification téléphone:', error);
      setPhoneAvailable(null);
      setPhoneDuplicateError(false);
    } finally {
      setCheckingPhone(false);  // 🔥 CRUCIAL : Toujours arrêter le checking
    }
  }, 800);

  return () => clearTimeout(timeoutId);
}, [form.phone, phoneUtil]);

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
  
  // 🔄 Reset des erreurs selon le champ modifié
  if (nameDuplicateError && (field === 'nom' || field === 'prenom')) {
    setNameDuplicateError(false);
  }
  if (field === 'email') {
    setEmailDuplicateError(false);
  }
  if (emailDuplicateError && field === 'email') {
    setEmailDuplicateError(false);
  }
  if (field === 'phone') {
    setPhoneDuplicateError(false);
  }
  if (phoneDuplicateError && field === 'phone') {
    setPhoneDuplicateError(false);
  }
};

// 🔍 Vérification si email existe déjà
async function isEmailTaken(email: string): Promise<boolean> {
  try {
    const q = query(collection(db, 'users'), where('email', '==', email.trim().toLowerCase()));
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error('❌ Erreur Firestore lors de la vérification email:', error);
    throw error;
  }
}

// 🔍 Vérification si téléphone existe déjà
async function isPhoneTaken(phone: string): Promise<boolean> {
  try {
    const q = query(collection(db, 'users'), where('phone', '==', phone.trim()));
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error('❌ Erreur Firestore lors de la vérification téléphone:', error);
    throw error;
  }
}
  const handleRegister = async () => {
  if (!validateCurrentStep()) {
    setForceValidation(true);
    return;
  }
  
  setLoading(true);
  let userCred: any = null;

  try {
    setForceValidation(false);
    
    // Préparer les données
    const baptismData = mapStepBaptismToFirestore({
      baptise: form.baptise as 'oui' | 'non' | '',
      immersion: form.immersion as 'oui' | 'non' | '',
      desire: form.desire as 'oui' | 'non' | '',
    });

    const cleanForm = {
      nom: form.nom.trim(),
      prenom: form.prenom.trim(),
      username: form.username.trim().toLowerCase(),
      birthdate: formatDateToISO(form.birthdate),
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

    // 1️⃣ Créer le compte Firebase Auth
    console.log('🔐 Création du compte...');
    userCred = await createUserWithEmailAndPassword(auth, form.email, form.password);
    const uid = userCred.user.uid;
console.log('📧 Avant sendCustomVerificationEmail');
console.log('UserId:', uid);
console.log('Email:', form.email);
    // 2️⃣ Tenter d'envoyer l'email AVANT de sauvegarder
    console.log('📧 Envoi de l\'email de vérification...');
    const emailSent = await sendCustomVerificationEmail({
      userId: uid,
      email: form.email.trim(),
      prenom: form.prenom.trim(),
      nom: form.nom.trim(),
    });
console.log('📧 Résultat emailSent:', emailSent);
    // 3️⃣ Si l'email échoue -> ROLLBACK
    if (!emailSent) {
      throw new Error('EMAIL_SEND_FAILED');
    }

    // 4️⃣ Email OK -> Sauvegarder dans Firestore
    console.log('💾 Sauvegarde des données...');
    await setDoc(doc(db, 'users', uid), {
      ...cleanForm,
      ...baptismData,
      uid,
      emailVerified: false,
      createdAt: new Date().toISOString(),
    });

    // 5️⃣ Tout est OK -> Afficher le succès
    console.log('✅ Inscription réussie !');
    setShowCheck(true);
    setTimeout(() => {
      setShowSuccessModal(true);
      setShowCheck(false);
    }, 2800);

  } catch (error: any) {
    console.error('❌ Erreur inscription:', error);
    
    // 🔄 ROLLBACK : Supprimer le compte si créé
    if (userCred && userCred.user) {
      try {
        console.log('🗑️ Suppression du compte suite à l\'erreur...');
        await userCred.user.delete();
      } catch (deleteError) {
        console.error('Impossible de supprimer le compte:', deleteError);
      }
    }
    
    // 📢 Messages d'erreur personnalisés
    let errorMessage = "Une erreur s'est produite lors de l'inscription.";
    
    if (error.message === 'EMAIL_SEND_FAILED') {
      errorMessage = 
        "Impossible d'envoyer l'email de confirmation.\n\n" +
        "Vérifie ta connexion internet et réessaye.\n" +
        "Si le problème persiste, contacte le support.";
    } else if (error.code === 'auth/email-already-in-use') {
      errorMessage = "Cet email est déjà utilisé.";
    } else if (error.code === 'auth/weak-password') {
      errorMessage = "Le mot de passe est trop faible.";
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = "L'adresse email est invalide.";
    }
    
    alert(errorMessage);
    
  } finally {
    setLoading(false);
  }
};

// Fonction helper pour formater la date
function formatDateToISO(dateStr: string): string {
  const [day, month, year] = dateStr.split('/');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

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
        console.log('🔍 Validation étape 2 - Contact');
      
      // Reset des erreurs de doublon
      setEmailDuplicateError(false);
      setPhoneDuplicateError(false);
       // 1. Validation du format email
      const isValidEmail = (e: string) => /^[\w.-]+@[\w-]+\.[a-zA-Z]{2,}$/.test(e.trim());
      if (!form.email.trim() || !isValidEmail(form.email)) {
        console.log('❌ Email invalide');
        return false;
      }
      
      // 2. Validation du format téléphone
      try {
        const parsed = phoneUtil.parse(form.phone);
        if (!phoneUtil.isValidNumber(parsed)) {
          console.log('❌ Téléphone invalide');
          return false;
        }
      } catch {
        console.log('❌ Téléphone format incorrect');
        return false;
      }
      
      // 3. Vérifier que les vérifications ne sont pas en cours
      if (checkingEmail || checkingPhone) {
        console.log('⏳ Vérifications en cours...');
        return false;
      }
      
      // 4. Vérifier la disponibilité
      if (emailAvailable === false || phoneAvailable === false) {
        console.log('❌ Email ou téléphone déjà utilisé');
        return false;
      }
      
      // 5. Vérifier que les vérifications ont été faites
      if (emailAvailable === null || phoneAvailable === null) {
        console.log('⚠️ Vérifications pas encore effectuées');
        return false;
      }
      
      console.log('✅ Validation étape 2 réussie');
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
  
  // 1. Le statut est obligatoire
  if (!statut) return false;
  
  // 2. Si "nouveau" → pas besoin de fonction/sous-fonction
  if (statut === 'nouveau') {
    return true; // ✅ Validation réussie pour les nouveaux
  }
  
  // 3. Si "ancien" → fonction obligatoire
  if (statut === 'ancien') {
    if (!fonction) return false;
    
    const subs = rolesData[fonction as keyof typeof rolesData] || [];
    const manualSub = !!fonction && subs.length === 0;
    
    // Sous-fonction obligatoire si elle existe dans les données
    if (!manualSub && subs.length > 0 && !sousFonction) return false;
    if (manualSub && !sousFonction) return false;
  }
  
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
      // 🎯 Nouvelles props pour la validation
      emailDuplicateError={emailDuplicateError}
      phoneDuplicateError={phoneDuplicateError}
      emailAvailable={emailAvailable}
      phoneAvailable={phoneAvailable}
      checkingEmail={checkingEmail}
      checkingPhone={checkingPhone}
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
          // 🔥 Empêcher l'action si bouton désactivé
          if (nextDisabled) return;
          
          const valid = await validateCurrentStep();
          if (valid) {
            setForceValidation(false);
            setStep(step + 1);
          } else {
            setForceValidation(true);
          }
        }}
        disabled={nextDisabled}  // 🎯 AJOUTER la prop disabled
        style={[
          styles.wideButton, 
          nextDisabled && styles.buttonDisabled  // 🎯 AJOUTER le style conditionnel
        ]}
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
        <Button 
  mode="outlined" 
  onPress={testEmail}
  style={{ margin: 10 }}
>
  🧪 Tester Template Email
</Button>

        {/* BOUTON DE TEST TEMPORAIRE */}
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
    backgroundColor: '#cccccc',  // Gris clair
    opacity: 0.6,               // 🎯 AJOUTER pour plus d'effet visuel
  },
  
  // 🎯 OPTIONNEL : Style spécifique pour le contenu du bouton disabled
  buttonDisabledContent: {
    opacity: 0.7,
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
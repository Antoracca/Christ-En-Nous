import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';

export default function useRegisterForm() {
  const navigation = useNavigation<any>();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [phone, setPhone] = useState('');
  const [church, setChurch] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');

  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const totalSteps = 5;

  const handleNextOrSubmit = async () => {
    setErrorMessage(null);
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!firstName.trim()) newErrors.firstName = 'Prénom requis';
      if (!lastName.trim()) newErrors.lastName = 'Nom requis';
    } else if (step === 2) {
      if (!username.trim()) newErrors.username = 'Pseudo requis';
      if (!email.trim()) newErrors.email = 'Email requis';
      else if (!/.+@.+\\..+/.test(email)) newErrors.email = 'Format invalide';
    } else if (step === 3) {
      if (!password) newErrors.password = 'Mot de passe requis';
      else if (password.length < 6) newErrors.password = 'Minimum 6 caractères';
      if (!confirmPassword) newErrors.confirmPassword = 'Confirmation requise';
      else if (password !== confirmPassword) newErrors.confirmPassword = 'Non identiques';
    } else if (step === 4) {
      if (!birthdate.trim()) newErrors.birthdate = 'Date requise';
      if (!phone.trim()) newErrors.phone = 'Téléphone requis';
    } else if (step === 5) {
      if (!church.trim()) newErrors.church = 'Église requise';
      if (!city.trim()) newErrors.city = 'Ville requise';
      if (!country.trim()) newErrors.country = 'Pays requis';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (step < totalSteps) {
      setErrors({});
      setStep(prev => prev + 1);
      return;
    }

    try {
      setLoading(true);
      // 🔐 Tu peux ici appeler Firebase pour créer le compte
      navigation.replace('Home');
    } catch (err: any) {
      const code = err?.code || '';
      if (code.includes('email-already-in-use')) {
        setErrors({ email: 'Email déjà utilisé' });
      } else {
        setErrorMessage("Oups, une erreur est survenue.");
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    step, setStep, totalSteps,
    errors, setErrors,
    errorMessage, loading,
    handleNextOrSubmit,

  form: {
    firstName, setFirstName,
    lastName, setLastName,
    username, setUsername,
    email, setEmail,
    password, setPassword,
    confirmPassword, setConfirmPassword,
    birthdate, setBirthdate,
    phone, setPhone,
    church, setChurch,
    city, setCity,
    country, setCountry,
  }
  }
}
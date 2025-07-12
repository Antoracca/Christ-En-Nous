// ✅ validateStepCredentialsFields.ts
// Place ce fichier dans app/utils/validateStepCredentialsFields.ts

export interface CredentialsValues {
  birthdate: string;
  password: string;
  confirmPassword: string;
}

export interface CredentialsErrors {
  birthdate?: string;
  password?: string;
  confirmPassword?: string;
}

export function validateStepCredentialsFields(
  values: CredentialsValues,
  field?: keyof CredentialsValues
): CredentialsErrors {
  const errors: CredentialsErrors = {};

  const checkBirthdate = () => {
    if (!values.birthdate.trim()) {
      errors.birthdate = 'La date de naissance est requise.';
    }
  };

  const checkPassword = () => {
    const pass = values.password.trim();
    const regex = {
      minLength: /.{6,}/,
      uppercase: /[A-Z]/,
      lowercase: /[a-z]/,
      digit: /\d/,
      special: /[!@#$%^&*(),.?":{}|<>]/,
    };

    if (!pass) {
      errors.password = 'Le mot de passe est requis.';
    } else if (!regex.minLength.test(pass)) {
      errors.password = 'Au moins 6 caractères.';
    } else if (!regex.uppercase.test(pass)) {
      errors.password = 'Une majuscule est requise.';
    } else if (!regex.lowercase.test(pass)) {
      errors.password = 'Une minuscule est requise.';
    } else if (!regex.digit.test(pass)) {
      errors.password = 'Un chiffre est requis.';
    } else if (!regex.special.test(pass)) {
      errors.password = 'Un caractère spécial est requis.';
    }
  };

  const checkConfirm = () => {
    if (!values.confirmPassword.trim()) {
      errors.confirmPassword = 'Confirmation requise.';
    } else if (values.confirmPassword !== values.password) {
      errors.confirmPassword = 'Les mots de passe ne correspondent pas.';
    }
  };

  if (field === 'birthdate') checkBirthdate();
  else if (field === 'password') checkPassword();
  else if (field === 'confirmPassword') checkConfirm();
  else {
    checkBirthdate();
    checkPassword();
    checkConfirm();
  }

  return errors;
}

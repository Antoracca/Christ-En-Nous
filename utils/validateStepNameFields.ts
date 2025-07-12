// ✅ validateStepNameFields.ts
// Ce fichier est dans app/utils/validateStepNameFields.ts

export interface NameFormValues {
  nom: string;
  prenom: string;
  username: string;
}

export interface NameFormErrors {
  nom?: string;
  prenom?: string;
  username?: string;
}

export function validateStepNameFields(
  values: NameFormValues,
  field?: keyof NameFormValues
): NameFormErrors {
  const errors: NameFormErrors = {};

  const checkNom = () => {
    if (!values.nom.trim()) {
      errors.nom = 'Le nom est requis.';
    } else if (!/^[A-Za-zÀ-ÿ\s'-]+$/.test(values.nom)) {
      errors.nom = 'Le nom peut contenir lettres, tirets, apostrophes ou espaces.';
    } else if (values.nom.trim().length < 2) {
      errors.nom = 'Le nom est trop court.';
    }
  };

  const checkPrenom = () => {
    if (!values.prenom.trim()) {
      errors.prenom = 'Le prénom est requis.';
    } else if (!/^[A-Za-zÀ-ÿ\s'-]+$/.test(values.prenom)) {
      errors.prenom = 'Le prénom peut contenir lettres, tirets, apostrophes ou espaces.';
    } else if (values.prenom.trim().length < 2) {
      errors.prenom = 'Le prénom est trop court.';
    }
  };

  const checkUsername = () => {
  const username = values.username.trim().toLowerCase();

  if (!username) {
    errors.username = "Le nom d'utilisateur est requis.";
  } else if (!/^[a-z0-9._]+$/.test(username)) {
    errors.username = "Seules les lettres minuscules, chiffres, points et _ sont autorisés.";
  } else if (username.length < 3) {
    errors.username = "Nom d'utilisateur trop court.";
  }
};


  if (field === 'nom') {
    checkNom();
  } else if (field === 'prenom') {
    checkPrenom();
  } else if (field === 'username') {
    checkUsername();
  } else {
    checkNom();
    checkPrenom();
    checkUsername();
  }

  return errors;
}

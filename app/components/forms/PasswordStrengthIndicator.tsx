// PasswordStrengthBar.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  password: string;
}

export default function PasswordStrengthBar({ password }: Props) {
  const getStrength = () => {
    let strength = 0;
    if (/.{6,}/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength++;
    return strength;
  };

  const strength = getStrength();

  const getColor = () => {
    if (strength <= 2) return '#EF4444'; // rouge
    if (strength === 3 || strength === 4) return '#F59E0B'; // orange
    return '#10B981'; // vert
  };

  const getLabel = () => {
    if (strength <= 2) return 'faible';
    if (strength === 3 || strength === 4) return 'moyen';
    return 'fort';
  };

  const isSecure =
    /.{6,}/.test(password) &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password) &&
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  if (!password.trim()) return null; // Ne rien afficher si vide

  return (
    <View style={styles.wrapper}>
      <View style={styles.barBackground}>
        <View
          style={[
            styles.barFill,
            {
              width: `${(strength / 5) * 100}%`,
              backgroundColor: getColor(),
            },
          ]}
        />
      </View>
      <Text style={[styles.label, { color: getColor() }]}>Mot de passe: {getLabel()}</Text>
      {!isSecure && password.length > 0 && (
        <Text style={styles.warningText}>
          Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 4,
    marginBottom: 8,
  },
  barBackground: {
    width: '100%',
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  label: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '600',
  },
  warningText: {
    fontSize: 13,
    color: '#DC2626',
    marginTop: 4,
    lineHeight: 17,
  },
});

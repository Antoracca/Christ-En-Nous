// components/forms/PasswordStrengthIndicator.tsx — Version optimisée sans redondances
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface PasswordCriteria {
  id: string;
  label: string;
  test: (password: string) => boolean;
  icon: string;
}

interface Props {
  password: string;
  confirmPassword?: string; // Nouveau : pour gérer la confirmation ici
  showDetails?: boolean;
  mode?: 'creation' | 'confirmation'; // Nouveau : pour différencier les contextes
}

// 🎯 Critères de mot de passe avec labels optimisés
const PASSWORD_CRITERIA: PasswordCriteria[] = [
  {
    id: 'length',
    label: '6 caractères minimum',
    test: (pwd: string) => pwd.length >= 6,
    icon: 'format-size'
  },
  {
    id: 'uppercase',
    label: 'Une majuscule (A-Z)',
    test: (pwd: string) => /[A-Z]/.test(pwd),
    icon: 'format-letter-case-upper'
  },
  {
    id: 'lowercase',
    label: 'Une minuscule (a-z)',
    test: (pwd: string) => /[a-z]/.test(pwd),
    icon: 'format-letter-case-lower'
  },
  {
    id: 'digit',
    label: 'Un chiffre (0-9)',
    test: (pwd: string) => /\d/.test(pwd),
    icon: 'numeric'
  },
  {
    id: 'special',
    label: 'Un caractère spécial (!@#$...)',
    test: (pwd: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd),
    icon: 'asterisk'
  }
];

export default function PasswordStrengthIndicator({ 
  password, 
  confirmPassword,
  showDetails = true,
  mode = 'creation'
}: Props) {
  // 🎨 Animations pour chaque critère
  const criteriaAnimations = useRef(
    PASSWORD_CRITERIA.reduce((acc, criteria) => {
      acc[criteria.id] = new Animated.Value(0);
      return acc;
    }, {} as Record<string, Animated.Value>)
  ).current;

  // Animation pour la confirmation
  const confirmationAnim = useRef(new Animated.Value(0)).current;

  // 📊 Calcul du score et validation
  const passedCriteria = PASSWORD_CRITERIA.filter(criteria => criteria.test(password));
  const score = passedCriteria.length;
  const totalCriteria = PASSWORD_CRITERIA.length;
  const percentage = (score / totalCriteria) * 100;
  const isPasswordValid = score === totalCriteria;
  
  // Validation de la confirmation (sans message d'erreur redondant)
  const isConfirmationValid = confirmPassword ? password === confirmPassword && isPasswordValid : true;

  // 🎯 Détermination du niveau de force (simplifié)
  const getStrengthLevel = () => {
    if (score === 0 || !password) return { label: '', color: '#E5E7EB', bgColor: '#F9FAFB' };
    if (score <= 2) return { label: 'Faible', color: '#EF4444', bgColor: '#FEF2F2' };
    if (score === 3 || score === 4) return { label: 'Moyen', color: '#F59E0B', bgColor: '#FFFBEB' };
    return { label: 'Fort', color: '#10B981', bgColor: '#ECFDF5' };
  };

  const strength = getStrengthLevel();

  // 🎭 Animations basées sur les changements
  useEffect(() => {
    // Animation des critères de mot de passe
    PASSWORD_CRITERIA.forEach(criteria => {
      const isValid = criteria.test(password);
      Animated.spring(criteriaAnimations[criteria.id], {
        toValue: isValid ? 1 : 0,
        useNativeDriver: true,
        tension: 150,
        friction: 8,
      }).start();
    });

    // Animation de la confirmation si applicable
    if (mode === 'confirmation' && confirmPassword !== undefined) {
      Animated.spring(confirmationAnim, {
        toValue: isConfirmationValid ? 1 : 0,
        useNativeDriver: true,
        tension: 150,
        friction: 8,
      }).start();
    }
  }, [password, confirmPassword, criteriaAnimations, confirmationAnim, mode, isConfirmationValid]);

  // 🚫 Ne rien afficher si pas de mot de passe en mode création
  if (!password.trim() && mode === 'creation') return null;

  return (
    <View style={styles.container}>
      {/* 📊 Barre de progression (seulement en mode création) */}
      {mode === 'creation' && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBackground}>
            <Animated.View 
              style={[
                styles.progressFill,
                { 
                  width: `${percentage}%`,
                  backgroundColor: strength.color 
                }
              ]} 
            />
          </View>
          
          {strength.label && (
            <View style={[styles.strengthBadge, { backgroundColor: strength.bgColor }]}>
              <Text style={[styles.strengthLabel, { color: strength.color }]}>
                {strength.label}
              </Text>
              {isPasswordValid && (
                <MaterialCommunityIcons 
                  name="shield-check" 
                  size={14} 
                  color={strength.color}
                  style={styles.shieldIcon}
                />
              )}
            </View>
          )}
        </View>
      )}

      {/* 📋 Critères détaillés (adaptatifs selon le mode) */}
      {showDetails && (
        <View style={styles.criteriaContainer}>
          {mode === 'creation' && (
            <Text style={styles.criteriaTitle}>
              Votre mot de passe doit contenir :
            </Text>
          )}
          
          {mode === 'creation' && PASSWORD_CRITERIA.map(criteria => {
            const isValid = criteria.test(password);
            const animation = criteriaAnimations[criteria.id];
            
            const scale = animation.interpolate({
              inputRange: [0, 1],
              outputRange: [0.95, 1],
            });
            
            const opacity = animation.interpolate({
              inputRange: [0, 1],
              outputRange: [0.7, 1],
            });

            return (
              <Animated.View
                key={criteria.id}
                style={[
                  styles.criteriaItem,
                  { 
                    transform: [{ scale }],
                    opacity,
                    backgroundColor: isValid ? '#F0FDF4' : '#F9FAFB'
                  }
                ]}
              >
                <MaterialCommunityIcons
                  name={criteria.icon as any}
                  size={16}
                  color={isValid ? '#10B981' : '#9CA3AF'}
                  style={styles.criteriaIcon}
                />
                
                <Text style={[
                  styles.criteriaText,
                  { color: isValid ? '#065F46' : '#6B7280' }
                ]}>
                  {criteria.label}
                </Text>
                
                <View style={styles.statusIcon}>
                  {isValid ? (
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={18}
                      color="#10B981"
                    />
                  ) : (
                    <MaterialCommunityIcons
                      name="circle-outline"
                      size={18}
                      color="#D1D5DB"
                    />
                  )}
                </View>
              </Animated.View>
            );
          })}

          {/* 🔄 Section confirmation (mode confirmation uniquement) */}
          {mode === 'confirmation' && confirmPassword !== undefined && (
            <Animated.View 
              style={[
                styles.confirmationSection,
                {
                  transform: [{ scale: confirmationAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.95, 1],
                  })}],
                  backgroundColor: isConfirmationValid ? '#F0FDF4' : '#FEF2F2'
                }
              ]}
            >
              <MaterialCommunityIcons
                name={isConfirmationValid ? "check-circle" : "alert-circle"}
                size={20}
                color={isConfirmationValid ? "#10B981" : "#EF4444"}
                style={styles.confirmationIcon}
              />
              <Text style={[
                styles.confirmationText,
                { color: isConfirmationValid ? '#065F46' : '#DC2626' }
              ]}>
                {confirmPassword.length === 0 
                  ? "Confirmez votre mot de passe"
                  : isConfirmationValid 
                    ? "Les mots de passe correspondent ✓"
                    : "Les mots de passe ne correspondent pas"
                }
              </Text>
            </Animated.View>
          )}

          {/* 🎉 Message de succès global (création seulement) */}
          {mode === 'creation' && isPasswordValid && (
            <View style={styles.successMessage}>
              <MaterialCommunityIcons
                name="security"
                size={20}
                color="#10B981"
                style={styles.successIcon}
              />
              <Text style={styles.successText}>
                Parfait ! Votre mot de passe est sécurisé 🔐
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  
  // 📊 Styles de progression
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressBackground: {
    flex: 1,
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
    marginRight: 10,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  strengthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    minWidth: 60,
    justifyContent: 'center',
  },
  strengthLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  shieldIcon: {
    marginLeft: 3,
  },
  
  // 📋 Styles des critères
  criteriaContainer: {
    marginTop: 4,
  },
  criteriaTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  criteriaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  criteriaIcon: {
    marginRight: 8,
  },
  criteriaText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
  },
  statusIcon: {
    marginLeft: 6,
  },
  
  // 🔄 Styles de confirmation
  confirmationSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 4,
  },
  confirmationIcon: {
    marginRight: 8,
  },
  confirmationText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  
  // 🎉 Styles de succès
  successMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 6,
  },
  successIcon: {
    marginRight: 6,
  },
  successText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
    color: '#065F46',
    lineHeight: 16,
  },
});
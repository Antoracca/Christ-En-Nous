// StepBaptism.tsx — version corrigée avec validations complètes
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { HelperText } from 'react-native-paper';

interface StepBaptismProps {
  baptise: 'oui' | 'non' | '';
  desire: 'oui' | 'non' | '';
  immersion: 'oui' | 'non' | '';
  onChange: (
    field: 'baptise' | 'desire' | 'immersion',
    value: 'oui' | 'non' | ''
  ) => void;
  forceValidation: boolean;
}

export default function StepBaptism({
  baptise,
  desire,
  immersion,
  onChange,
  forceValidation,
}: StepBaptismProps) {
  const [errors, setErrors] = useState<{ baptise?: string; desire?: string; immersion?: string }>({});

  useEffect(() => {
    if (forceValidation) {
      const newErrors: typeof errors = {};

      if (!baptise) newErrors.baptise = 'Veuillez répondre à cette question';
      if (baptise === 'non' && !desire)
        newErrors.desire = 'Merci de préciser votre intention de baptême';
      if (baptise === 'oui' && !immersion)
        newErrors.immersion = 'Merci d’indiquer si c’était par immersion';
      if (baptise === 'oui' && immersion === 'non' && !desire)
        newErrors.desire = 'Merci de préciser si vous souhaitez un re-baptême';

      setErrors(newErrors);
    }
  }, [forceValidation, baptise, desire, immersion]);

  const handleSelect = (field: 'baptise' | 'desire' | 'immersion', value: 'oui' | 'non') => {
    onChange(field, value);
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  return (
    <View style={styles.card}>
      <Text style={styles.stepTitle}>Étape 5 : Baptême</Text>
      <Text style={styles.stepDescription}>
        Merci de répondre avec sincérité aux questions suivantes.
      </Text>

      {/* Question 1 - Êtes-vous baptisé(e) ? */}
      <Text style={styles.label}>Êtes-vous baptisé(e) ?</Text>
      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={[styles.option, baptise === 'oui' && styles.selected]}
          onPress={() => handleSelect('baptise', 'oui')}
        >
          <Text style={styles.optionText}>Oui</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.option, baptise === 'non' && styles.selected]}
          onPress={() => handleSelect('baptise', 'non')}
        >
          <Text style={styles.optionText}>Non</Text>
        </TouchableOpacity>
      </View>
      {errors.baptise && <HelperText type="error">{errors.baptise}</HelperText>}

      {/* IMMERSION - si OUI */}
      {baptise === 'oui' && (
        <View style={styles.block}>
          <Text style={styles.label}>Était-ce par immersion ?</Text>
          <View style={styles.instructionContainer}>
            <Text style={styles.instructionText}>
              Indiquez si le baptême s’est fait par immersion totale.
            </Text>
          </View>
          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={[styles.option, immersion === 'oui' && styles.selected]}
              onPress={() => handleSelect('immersion', 'oui')}
            >
              <Text style={styles.optionText}>Oui</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.option, immersion === 'non' && styles.selected]}
              onPress={() => handleSelect('immersion', 'non')}
            >
              <Text style={styles.optionText}>Non</Text>
            </TouchableOpacity>
          </View>
          {errors.immersion && <HelperText type="error">{errors.immersion}</HelperText>}
        </View>
      )}

      {/* DESIRE - si NON ou rebaptême */}
      {(baptise === 'non' || (baptise === 'oui' && immersion === 'non')) && (
        <View style={styles.block}>
          <Text style={styles.label}>
            {baptise === 'non'
              ? 'Souhaitez-vous être baptisé(e) ?'
              : 'Souhaitez-vous être (re)baptisé(e) par immersion ?'}
          </Text>
          <View style={styles.instructionContainer}>
            <Text style={styles.instructionText}>
              {baptise === 'non'
                ? 'Exprimez votre intention si vous n’avez jamais été baptisé(e).'
                : 'Exprimez votre intention si vous avez été baptisé(e) sans immersion.'}
            </Text>
          </View>
          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={[styles.option, desire === 'oui' && styles.selected]}
              onPress={() => handleSelect('desire', 'oui')}
            >
              <Text style={styles.optionText}>Oui</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.option, desire === 'non' && styles.selected]}
              onPress={() => handleSelect('desire', 'non')}
            >
              <Text style={styles.optionText}>Non</Text>
            </TouchableOpacity>
          </View>
          {errors.desire && <HelperText type="error">{errors.desire}</HelperText>}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    padding: 24,
    margin: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  instructionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -10,
    marginBottom: 12,
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: '#FFF9E6',
    borderLeftWidth: 4,
    borderLeftColor: '#FACC15',
    borderRadius: 6,
  },
  stepTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 6,
  },
  stepDescription: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 18,
  },
  instructionText: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    flex: 1,
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  option: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#F3F3F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selected: {
    backgroundColor: '#FFEB3B',
    borderColor: '#FFEB3B',
  },
  optionText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  block: {
    marginTop: 24,
  },
});

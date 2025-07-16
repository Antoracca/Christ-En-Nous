import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import { HelperText, Button } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import rolesData from 'assets/data/churchRoles.json';

interface StepChurchRoleProps {
  /** Valeur interne – 2 statuts seulement */
  statut: 'nouveau' | 'ancien' | '';
  fonction: string;
  sousFonction: string;
  onChange: (
    field: 'statut' | 'fonction' | 'sousFonction',
    value: string
  ) => void;
  forceValidation: boolean;
}

export default function StepChurchRoleIos({
  statut,
  fonction,
  sousFonction,
  onChange,
  forceValidation,
}: StepChurchRoleProps) {
  /* -------------------- état local -------------------- */
  const [showPicker, setShowPicker] = useState(false);
  const [pickerType, setPickerType] = useState<'fonction' | 'sousFonction'>('fonction');
  const [tempFonction, setTempFonction] = useState(fonction);
  const [tempSub, setTempSub] = useState(sousFonction);

  /* -------------------- erreurs -------------------- */
  const [errors, setErrors] = useState<{
    statut?: string;
    fonction?: string;
    sousFonction?: string;
  }>({});

  /* -------------------- données -------------------- */
  const fonctions = Object.keys(rolesData);
  const sousFonctions = useMemo(
    () => rolesData[fonction as keyof typeof rolesData] || [],
    [fonction]
  );

  /* -------------------- helpers -------------------- */
  const isSenior = statut === 'ancien';

  const openFonctionPicker = () => {
    if (!isSenior) return; // sécurité – ne jamais ouvrir si non-senior
    setPickerType('fonction');
    setTempFonction(fonction);
    setShowPicker(true);
  };

  const openSubPicker = () => {
    if (!isSenior) return;
    setPickerType('sousFonction');
    setTempSub(sousFonction);
    setShowPicker(true);
  };

  const isConfirmDisabled =
    pickerType === 'fonction' ? tempFonction === '' : tempSub === '';

  const onConfirm = () => {
    if (isConfirmDisabled) return;

    if (pickerType === 'fonction') {
      onChange('fonction', tempFonction);
      onChange('sousFonction', '');
      setErrors((e) => ({ ...e, fonction: undefined, sousFonction: undefined }));
    } else {
      onChange('sousFonction', tempSub);
      setErrors((e) => ({ ...e, sousFonction: undefined }));
    }

    setShowPicker(false);
  };

  /* -------------------- validation -------------------- */
  useEffect(() => {
    if (!forceValidation) return;

    const newErrors: typeof errors = {};

    if (!statut) newErrors.statut = 'Veuillez choisir un statut';

    if (isSenior) {
      if (!fonction) newErrors.fonction = 'Veuillez choisir une fonction';
      if (sousFonctions.length > 0 && !sousFonction)
        newErrors.sousFonction = 'Veuillez sélectionner un rôle';
    }

    setErrors(newErrors);
  }, [forceValidation, statut, fonction, sousFonction, sousFonctions, isSenior]);

  /* ---------------------------------------------------- */
  return (
    <View style={styles.card}>
      <Text style={styles.stepTitle}>Étape 6 : Rôle dans l’Église</Text>
      <Text style={styles.stepDescription}>
        Précisez votre statut, puis facultativement votre fonction et votre rôle si vous êtes ancien(ne).
      </Text>

      {/* ---------- Statut ---------- */}
      <Text style={styles.label}>Statut dans l&apos;église</Text>
      <View style={styles.instructionBox}>
        <HelperText type="info" style={styles.helperText}>
          Nouveau membre ou ancien ?
        </HelperText>
      </View>

      <View style={styles.optionsContainer}>
        {[
          { label: 'Nouveau / Nouvelle', value: 'nouveau' },
          { label: 'Ancien / Ancienne', value: 'ancien' },
        ].map(({ label, value }) => (
          <TouchableOpacity
            key={value}
            style={[styles.option, statut === value && styles.selected]}
            onPress={() => {
              onChange('statut', value);

              if (value === 'nouveau') {
                // réinitialise les champs cachés pour éviter incohérences
                onChange('fonction', '');
                onChange('sousFonction', '');
              }

              setErrors((e) => ({ ...e, statut: undefined }));
            }}
          >
            <Text style={styles.optionText}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {errors.statut && (
        <HelperText type="error" style={styles.errorText}>
          {errors.statut}
        </HelperText>
      )}

      {/* ---------- Fonction & Rôle ---------- */}
      {isSenior && (
        <>
          <Text style={styles.label}>Fonction</Text>
          <View style={styles.instructionBox}>
            <HelperText type="info" style={styles.helperText}>
              Choisissez votre fonction principale.
            </HelperText>
          </View>

          <TouchableOpacity style={styles.selector} onPress={openFonctionPicker}>
            <Text style={styles.selectorText}>
              {fonction || 'Sélectionnez une fonction'}
            </Text>
          </TouchableOpacity>

          {errors.fonction && (
            <HelperText type="error" style={styles.errorText}>
              {errors.fonction}
            </HelperText>
          )}

          {/* Sous-fonction */}
          {!!fonction && sousFonctions.length > 0 && (
            <>
              <Text style={styles.label}>Rôle spécifique</Text>
              <View style={styles.instructionBox}>
                <HelperText type="info" style={styles.helperText}>
                  Précisez votre mission ou responsabilité.
                </HelperText>
              </View>

              <TouchableOpacity style={styles.selector} onPress={openSubPicker}>
                <Text style={styles.selectorText}>
                  {sousFonction || 'Sélectionnez un rôle'}
                </Text>
              </TouchableOpacity>

              {errors.sousFonction && (
                <HelperText type="error" style={styles.errorText}>
                  {errors.sousFonction}
                </HelperText>
              )}
            </>
          )}
        </>
      )}

      {/* ---------- Picker Modal ---------- */}
      <Modal transparent visible={showPicker} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Button
              compact
              onPress={() => setShowPicker(false)}
              textColor="#FACC15"
            >
              Annuler
            </Button>
            <View />
            <Button
              compact
              onPress={onConfirm}
              disabled={isConfirmDisabled}
              style={{ opacity: isConfirmDisabled ? 0.4 : 1 }}
              textColor="#3B82F6"
            >
              Confirmer
            </Button>
          </View>

          <Picker
            selectedValue={pickerType === 'fonction' ? tempFonction : tempSub}
            onValueChange={(v) =>
              pickerType === 'fonction' ? setTempFonction(v) : setTempSub(v)
            }
          >
            {pickerType === 'fonction'
              ? [
                  <Picker.Item
                    key="default"
                    label="Sélectionnez une fonction"
                    value=""
                  />,
                  ...fonctions.map((f) => (
                    <Picker.Item key={f} label={f} value={f} />
                  )),
                ]
              : [
                  <Picker.Item
                    key="default"
                    label="Sélectionnez un rôle"
                    value=""
                  />,
                  ...sousFonctions.map((s) => (
                    <Picker.Item key={s} label={s} value={s} />
                  )),
                ]}
          </Picker>
        </View>
      </Modal>
    </View>
  );
}

/* -------------------- Styles -------------------- */
const styles = StyleSheet.create({
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    marginTop: -10,
    marginLeft: -7,
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    padding: 24,
    marginHorizontal: 16,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },
  stepTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 16,
    lineHeight: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  instructionBox: {
    backgroundColor: '#FFF9E6',
    borderLeftWidth: 4,
    borderLeftColor: '#FFD700',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderRadius: 4,
  },
  helperText: {
    fontSize: 13,
    color: '#1F2937',
  },
  optionsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  option: {
    flex: 1,
    height: 56,
    backgroundColor: '#F3F3F3',
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  selected: {
    backgroundColor: '#FFEB3B',
    borderColor: '#FDD835',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
  selector: {
    backgroundColor: '#EEF1F5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  selectorText: {
    fontSize: 16,
    color: '#1F2937',
  },
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
    maxHeight: Dimensions.get('window').height * 0.5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
});

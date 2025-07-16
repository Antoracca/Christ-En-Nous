import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Dimensions,
} from 'react-native';
import { Button, HelperText } from 'react-native-paper';
import rolesData from '@assets/data/churchRoles.json';

interface StepChurchRoleProps {
  /** Deux valeurs internes seulement */
  statut: 'nouveau' | 'ancien' | '';
  fonction: string;
  sousFonction: string;
  onChange: (field: 'statut' | 'fonction' | 'sousFonction', value: string) => void;
  onNextPress?: () => void;
  forceValidation: boolean;
}

export default function StepChurchRoleAndroid({
  statut,
  fonction,
  sousFonction,
  onChange,
  forceValidation,
}: StepChurchRoleProps) {
  /** Ancien / Ancienne → besoin de fonction et sous‑fonction */
  const isSenior = statut === 'ancien';

  const [errors, setErrors] = useState<{
    statut?: string;
    fonction?: string;
    sousFonction?: string;
  }>({});

  /* ---------------------- Modals ---------------------- */
  const [showFunctionModal, setShowFunctionModal] = useState(false);
  const [showSubFunctionModal, setShowSubFunctionModal] = useState(false);

  /* Sélections temporaires dans les modals */
  const [tempFunction, setTempFunction] = useState(fonction);
  const sousFonctions = rolesData[fonction as keyof typeof rolesData] || [];
  const manualSub = isSenior && fonction !== '' && sousFonctions.length === 0;
  const [tempSubFunction, setTempSubFunction] = useState(sousFonction);

  /* Réinitialiser les valeurs temporaires si les props changent */
  useEffect(() => {
    setTempFunction(fonction);
  }, [fonction]);

  useEffect(() => {
    setTempSubFunction(sousFonction);
  }, [sousFonction]);

  /* --------------------- Validation -------------------- */
  useEffect(() => {
    if (forceValidation) {
      const newErrors: typeof errors = {};

      if (!statut) newErrors.statut = 'Veuillez sélectionner votre statut';

      if (isSenior) {
        if (!fonction) newErrors.fonction = 'Veuillez choisir une fonction principale';

        const list = rolesData[fonction as keyof typeof rolesData] || [];
        const isManual = fonction !== '' && list.length === 0;

        if (!isManual && !sousFonction) newErrors.sousFonction = 'Veuillez sélectionner un rôle spécifique';
      }

      setErrors(newErrors);
    }
  }, [forceValidation, statut, fonction, sousFonction, isSenior]);

  /* ==================================================== */
  return (
    <View style={styles.card}>
      <Text style={styles.stepTitle}>Étape 6 : Rôle dans l’Église</Text>
      <Text style={styles.stepDescription}>
        Précisez votre statut, votre fonction principale et votre rôle éventuel.
      </Text>

      {/* ---------- Statut ---------- */}
      <Text style={styles.label}>Statut dans l&apos;église</Text>
      <View style={styles.instructionBox}>
        <Text style={styles.instructionText}>Rejoignez‑vous en tant que nouveau membre ou ancien ?</Text>
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

              /* Si Nouveau → on vide fonction & sousFonction et on ferme les modals */
              if (value === 'nouveau') {
                onChange('fonction', '');
                onChange('sousFonction', '');
                setShowFunctionModal(false);
                setShowSubFunctionModal(false);
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

      {/* ---------- Fonction & Sous‑fonction (Ancien uniquement) ---------- */}
      {isSenior && (
        <>
          {/* Fonction */}
          <Text style={styles.label}>Fonction principale</Text>
          <View style={styles.instructionBox}>
            <Text style={styles.instructionText}>
              Choisissez votre fonction principale au sein de l’église.
            </Text>
          </View>
          <TouchableOpacity style={styles.selector} onPress={() => setShowFunctionModal(true)}>
            <Text style={styles.selectorText}>{fonction || 'Choisissez une fonction'}</Text>
          </TouchableOpacity>
          {errors.fonction && (
            <HelperText type="error" style={styles.errorText}>
              {errors.fonction}
            </HelperText>
          )}

          {/* Sous‑fonction */}
          {fonction !== '' && sousFonctions.length > 0 && (
            <>
              <Text style={styles.label}>Rôle spécifique</Text>
              <View style={styles.instructionBox}>
                <Text style={styles.instructionText}>
                  Précisez votre mission ou responsabilité précise.
                </Text>
              </View>
              <TouchableOpacity style={styles.selector} onPress={() => setShowSubFunctionModal(true)}>
                <Text style={styles.selectorText}>{sousFonction || 'Choisissez un rôle'}</Text>
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

      {/* ---------- Modal Fonction ---------- */}
      <Modal transparent visible={showFunctionModal} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Button onPress={() => setShowFunctionModal(false)} textColor="#FACC15">
                Annuler
              </Button>
              <Button
                onPress={() => {
                  onChange('fonction', tempFunction);
                  onChange('sousFonction', '');
                  setErrors((e) => ({ ...e, fonction: undefined, sousFonction: undefined }));
                  setShowFunctionModal(false);
                }}
                disabled={!tempFunction}
              >
                Confirmer
              </Button>
            </View>
            <FlatList
              data={Object.keys(rolesData)}
              keyExtractor={(i) => i}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalItem, tempFunction === item && styles.selected]}
                  onPress={() => setTempFunction(item)}
                >
                  <Text style={styles.modalText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* ---------- Modal Sous‑fonction ---------- */}
      {isSenior && !manualSub && (
        <Modal transparent visible={showSubFunctionModal} animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Button onPress={() => setShowSubFunctionModal(false)} textColor="#FACC15">
                  Annuler
                </Button>
                <Button
                  onPress={() => {
                    onChange('sousFonction', tempSubFunction);
                    setErrors((e) => ({ ...e, sousFonction: undefined }));
                    setShowSubFunctionModal(false);
                  }}
                  disabled={!tempSubFunction}
                >
                  Confirmer
                </Button>
              </View>
              <FlatList
                data={sousFonctions}
                keyExtractor={(i) => i}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.modalItem, tempSubFunction === item && styles.selected]}
                    onPress={() => setTempSubFunction(item)}
                  >
                    <Text style={styles.modalText}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

/* ============================= Styles ============================== */
const styles = StyleSheet.create({
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    marginTop: -12,
    marginLeft: -5,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    padding: 24,
    marginVertical: 16,
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
  instructionText: {
    fontSize: 13,
    color: '#1F2937',
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: Dimensions.get('window').height * 0.5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  modalItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  modalText: {
    fontSize: 16,
    color: '#333',
  },
});

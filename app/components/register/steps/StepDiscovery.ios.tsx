// Mise à jour complète du fichier StepDiscoveryIOS.tsx avec toutes les améliorations demandées

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  FlatList,
  Image,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { TextInput, HelperText } from 'react-native-paper';
import churches from 'assets/data/churches';

interface Church {
  name: string;
  icon: any;
}

interface StepDiscoveryIOSProps {
  moyen: string;
  recommandePar: string;
  egliseOrigine: string;
  onChange: (
    field: 'moyen' | 'recommandePar' | 'egliseOrigine',
    value: string
  ) => void;
  forceValidation: boolean;
}

const options = [
  'Réseaux sociaux',
  'Par un frère / une sœur',
  'Par un pasteur',
  'Lors d’un événement',
  'Autre',
];

export default function StepDiscoveryIOS({
  moyen,
  recommandePar,
  egliseOrigine,
  onChange,
  forceValidation,
}: StepDiscoveryIOSProps) {
  const [showMoyenModal, setShowMoyenModal] = useState(false);
  const [showChurchModal, setShowChurchModal] = useState(false);
  const [tempMoyen, setTempMoyen] = useState(moyen);
  const [selectedChurch, setSelectedChurch] = useState<Church | null>(
    churches.find(c => c.name === egliseOrigine) || null
  );

  const [errors, setErrors] = useState<{
    moyen?: string;
    recommandePar?: string;
    egliseOrigine?: string;
  }>({});

  const handleMoyenConfirm = () => {
    onChange('moyen', tempMoyen);
    setErrors(e => ({ ...e, moyen: undefined }));
    setShowMoyenModal(false);
  };

  const handleChurchSelect = (church: Church) => {
    setSelectedChurch(church);
  };

  const handleChurchConfirm = () => {
    if (selectedChurch) {
      onChange('egliseOrigine', selectedChurch.name);
      setErrors(e => ({ ...e, egliseOrigine: undefined }));
    }
    setShowChurchModal(false);
  };

  useEffect(() => {
    if (forceValidation) {
      const newErrors: typeof errors = {};
      if (!moyen) newErrors.moyen = 'Veuillez sélectionner un moyen de découverte';
      if (moyen === 'Autre' && !recommandePar.trim())
        newErrors.recommandePar = 'Merci de préciser votre réponse';
      if (!egliseOrigine) newErrors.egliseOrigine = 'Veuillez choisir votre église';
      setErrors(newErrors);
    }
  }, [forceValidation, moyen, recommandePar, egliseOrigine]);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.stepTitle}>Etape 7 : Vous y êtes presque…</Text>

        <Text style={styles.label}>Comment avez-vous connu l’église ?</Text>
        <View style={styles.instructionBox}>
          <Text style={styles.helperText}>
            Dites-nous comment vous avez découvert notre église : cela nous aide à mieux accueillir !
          </Text>
        </View>

        <TouchableOpacity
          style={styles.selector}
          onPress={() => setShowMoyenModal(true)}
        >
          <Text style={styles.selectorText}>{moyen || 'Sélectionnez une option'}</Text>
        </TouchableOpacity>

        {errors.moyen && (
          <HelperText type="error" style={styles.errorText}>
            {errors.moyen}
          </HelperText>
        )}

        {moyen === 'Autre' && (
          <>
            <TextInput
              mode="outlined"
              label="Veuillez préciser"
              value={recommandePar}
              onChangeText={text => {
                onChange('recommandePar', text);
                setErrors(e => ({ ...e, recommandePar: undefined }));
              }}
              style={styles.input}
            />
            {errors.recommandePar && (
              <HelperText type="error" style={styles.errorText}>
                {errors.recommandePar}
              </HelperText>
            )}
          </>
        )}

        <Text style={styles.label}>Quelle est votre église locale ?</Text>
        <View style={styles.instructionBox}>
          <Text style={styles.helperText}>
            Choisissez l’église que vous fréquentez actuellement
          </Text>
        </View>

        <TouchableOpacity
          style={styles.selector}
          onPress={() => setShowChurchModal(true)}
        >
          {selectedChurch ? (
            <View style={styles.selectorContent}>
              <Image source={selectedChurch.icon} style={styles.selectorIcon} />
              <Text style={styles.selectorText}>{selectedChurch.name}</Text>
            </View>
          ) : (
            <Text style={styles.selectorText}>Sélectionnez votre église</Text>
          )}
        </TouchableOpacity>

        {errors.egliseOrigine && (
          <HelperText type="error" style={styles.errorText}>
            {errors.egliseOrigine}
          </HelperText>
        )}
      </View>

      {/* Modal Moyen */}
      <Modal transparent visible={showMoyenModal} animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMoyenModal(false)}
        />
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowMoyenModal(false)}>
              <Text style={styles.cancelText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleMoyenConfirm}
              disabled={!tempMoyen}
            >
              <Text
                style={{
                  color: tempMoyen ? '#007AFF' : '#A0A0A0',
                  fontSize: 14,
                }}
              >
                Confirmer
              </Text>
            </TouchableOpacity>
          </View>
          <Picker
            selectedValue={tempMoyen}
            onValueChange={value => setTempMoyen(value)}
            style={styles.picker}
          >
            {options.map(item => (
              <Picker.Item key={item} label={item} value={item} />
            ))}
          </Picker>
        </View>
      </Modal>

      {/* Modal Église */}
      <Modal transparent visible={showChurchModal} animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowChurchModal(false)}
        />
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowChurchModal(false)}>
              <Text style={styles.cancelText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleChurchConfirm}
              disabled={!selectedChurch}
            >
              <Text
                style={{
                  color: selectedChurch ? '#007AFF' : '#A0A0A0',
                  fontSize: 14,
                }}
              >
                Confirmer
              </Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={churches}
            keyExtractor={item => item.name}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => handleChurchSelect(item)}
              >
                <View style={styles.churchRow}>
                  <Image source={item.icon} style={styles.churchIcon} />
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight:
                        selectedChurch?.name === item.name ? '700' : '400',
                      color:
                        selectedChurch?.name === item.name ? '#FFD700' : '#333',
                    }}
                  >
                    {item.name}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEE',
    elevation: 3,
  },
  stepTitle: { fontSize: 20, fontWeight: '700', marginBottom: 15, color: '#1F2937' },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#1F2937' },
  instructionBox: {
    backgroundColor: '#FFF9E6',
    borderLeftWidth: 4,
    borderLeftColor: '#FFD700',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderRadius: 4,
  },
  helperText: { fontSize: 13, color: '#1F2937' },
  selector: {
    backgroundColor: '#F3F3F3',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    padding: 12,
    marginBottom: 15,
  },
  selectorContent: { flexDirection: 'row', alignItems: 'center' },
  selectorIcon: { width: 24, height: 24, marginRight: 8 },
  selectorText: { fontSize: 15, color: '#333' },
  input: { backgroundColor: '#fff', marginBottom: 15 },
  errorText: { color: '#DC2626', fontSize: 13, marginBottom: 8, marginLeft: -8 },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: Dimensions.get('window').height * 0.5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cancelText: { fontSize: 14, color: '#FFD700' },
  picker: { marginBottom: 8 },
  modalItem: { paddingVertical: 14 },
  churchRow: { flexDirection: 'row', alignItems: 'center' },
  churchIcon: { width: 24, height: 24, marginRight: 10 },
});

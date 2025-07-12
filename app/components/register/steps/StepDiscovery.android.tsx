// src/components/register/steps/StepDiscoveryAndroid.tsx

import React, { useState,useEffect  } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Image,
  Dimensions,
} from 'react-native';
import { TextInput, HelperText } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import churches from 'assets/data/churches';

interface Church {
  name: string;
  icon: any;
}

interface StepDiscoveryProps {
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

export default function StepDiscoveryAndroid({
  moyen,
  recommandePar,
  egliseOrigine,
  onChange,
  forceValidation,
}: StepDiscoveryProps) {
  const insets = useSafeAreaInsets();
  const [pickerType, setPickerType] = useState<'moyen' | 'eglise'>('moyen');
  const [showSheet, setShowSheet] = useState(false);
  const [tempMoyen, setTempMoyen] = useState(moyen);
  const [selectedChurch, setSelectedChurch] = useState<Church | null>(
    churches.find(c => c.name === egliseOrigine) || null
  );

  const [errors, setErrors] = useState<{
    moyen?: string;
    recommandePar?: string;
    egliseOrigine?: string;
  }>({});

  const openMoyen = () => {
    setPickerType('moyen');
    setTempMoyen(moyen);
    setShowSheet(true);
  };

  const openChurch = () => {
    setPickerType('eglise');
    setShowSheet(true);
  };

  const onConfirm = () => {
    if (pickerType === 'moyen') {
      onChange('moyen', tempMoyen);
      setErrors(e => ({ ...e, moyen: undefined, recommandePar: undefined }));
    } else if (selectedChurch) {
      onChange('egliseOrigine', selectedChurch.name);
      setErrors(e => ({ ...e, egliseOrigine: undefined }));
    }
    setShowSheet(false);
  };
  useEffect(() => {
  if (forceValidation) {
    const newErrors: typeof errors = {};

    if (!moyen) newErrors.moyen = 'Veuillez sélectionner un moyen de découverte';
    if (moyen === 'Autre' && !recommandePar.trim()) {
      newErrors.recommandePar = 'Merci de préciser votre réponse';
    }
    if (!egliseOrigine) newErrors.egliseOrigine = 'Veuillez sélectionner votre église';

    setErrors(newErrors);
  }
}, [forceValidation, moyen, recommandePar, egliseOrigine]);



  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.stepTitle}>
          Étape 7 : Vous y êtes presque…
        </Text>

        {/* Moyenne découverte */}
        <Text style={styles.label}>Comment avez-vous connu l’église ?</Text>
        <View style={styles.instructionBox}>
          <Text style={styles.helperText}>
           Dites-nous comment vous avez découvert notre église : cela nous aide à identifier les
            canaux qui attirent le plus de nouveaux visiteurs et à mieux les accueillir !
          </Text>
        </View>
        <TouchableOpacity style={styles.selector} onPress={openMoyen}>
          <Text style={styles.selectorText}>
            {moyen || 'Sélectionnez une option'}
          </Text>
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
              placeholder="Ex : Recommandation personnelle"
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

        {/* Église locale */}
        <Text style={styles.label}>Quelle est votre église locale ?</Text>
        <View style={styles.instructionBox}>
          <Text style={styles.helperText}>
            Choisissez l’église que vous fréquentez (ex : Sica3, Combattant, Mpoko…)
          </Text>
        </View>
        <TouchableOpacity style={styles.selector} onPress={openChurch}>
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


        {/* Bottom sheet */}
        <Modal transparent visible={showSheet} animationType="slide">
          <View
            style={[
              styles.sheetContainer,
              { paddingBottom: insets.bottom + 20 },
            ]}
          >
           <View style={styles.sheetHeader}>
  <TouchableOpacity onPress={() => setShowSheet(false)}>
    <Text style={styles.cancelText}>Annuler</Text>
  </TouchableOpacity>
  <TouchableOpacity
    onPress={onConfirm}
    disabled={
      pickerType === 'moyen'
        ? !tempMoyen
        : !selectedChurch
    }
  >
    <Text
      style={[
        styles.confirmText,
        {
          color:
            (pickerType === 'moyen' && tempMoyen) ||
            (pickerType === 'eglise' && selectedChurch)
              ? '#007AFF' // BLEU actif
              : '#A0A0A0', // GRIS inactif
        },
      ]}
    >
      Confirmer
    </Text>
  </TouchableOpacity>
</View>

            <FlatList
              data={
                pickerType === 'moyen'
                  ? options
                  : churches.map(c => c.name)
              }
              keyExtractor={(item, i) =>
                pickerType === 'moyen' ? `${item}-${i}` : item
              }
              renderItem={({ item }) => {
                if (pickerType === 'moyen') {
                  const opt = item as string;
                  return (
                    <TouchableOpacity
                      style={styles.sheetItem}
                      onPress={() => setTempMoyen(opt)}
                    >
                      <Text
                        style={[
                          styles.sheetText,
                          tempMoyen === opt && styles.selectedText,
                        ]}
                      >
                        {opt}
                      </Text>
                    </TouchableOpacity>
                  );
                }
                const church = churches.find(c => c.name === item)!;
                return (
                  <TouchableOpacity
                    style={styles.sheetItem}
                    onPress={() => setSelectedChurch(church)}
                  >
                    <View style={styles.churchRow}>
                      <Image
                        source={church.icon}
                        style={styles.churchIcon}
                      />
                      <Text
                        style={[
                          styles.sheetText,
                          selectedChurch?.name === church.name &&
                            styles.selectedText,
                        ]}
                      >
                        {church.name}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </Modal>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEE',
    elevation: 3,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    color: '#1F2937',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
    color: '#1F2937',
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
    textAlign: 'justify',
  },
  selector: {
    backgroundColor: '#F3F3F3',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    padding: 12,
  },
  selectorText: {
    fontSize: 15,
    color: '#333',
  },
  selectorContent: { flexDirection: 'row', alignItems: 'center' },
  selectorIcon: { width: 24, height: 24, marginRight: 8 },
  input: { backgroundColor: '#fff', marginVertical: 12 },
  footer: { alignItems: 'flex-end', marginTop: 16 },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    marginBottom: 8,
    marginLeft: -8,
    marginTop: -4,
    
  },
  sheetContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: Dimensions.get('window').height * 0.9,
    paddingHorizontal: 21,
    paddingTop: 8,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 17,
    
  },
  cancelText: { fontSize: 16, color: '#FFD700' },
  confirmText: { fontSize: 16, color: '#007AFF' },
  sheetItem: { paddingVertical: 14 },
  sheetText: { fontSize: 16, color: '#333' },
  selectedText: { fontWeight: '700', color: '#FFD700' },
  churchRow: { flexDirection: 'row', alignItems: 'center' },
  churchIcon: { width: 24, height: 24, marginRight: 10 },
});

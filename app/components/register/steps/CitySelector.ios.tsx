import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  TextInput as RNTextInput,
} from 'react-native';
import { HelperText } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import LeftInputIcon from '../../LeftInputIcon';

interface CitySelectorIOSProps {
  selectedCity: string;
  options: string[];
  error?: string;
  disabled?: boolean;
  manualMode?: boolean;
  onChange: (city: string) => void;
}

export default function CitySelectorIOS({
  selectedCity,
  options,
  error,
  disabled = false,
  manualMode = false,
  onChange,
}: CitySelectorIOSProps) {
  const [showModal, setShowModal] = useState(false);
  const [tempCity, setTempCity] = useState(selectedCity);

  const isValid = tempCity !== '' && options.includes(tempCity);
  const handleConfirm = () => {
    if (!isValid) return;
    onChange(tempCity);
    setShowModal(false);
  };

  return (
    <>
      <Text style={styles.label}>Ville</Text>
      <View style={styles.container}>
        <LeftInputIcon icon="city" size={34} />
        {manualMode ? (
          <RNTextInput
            style={[styles.text, styles.input]}
            placeholder="Entrez votre ville"
            placeholderTextColor="#999"
            value={selectedCity}
            onChangeText={onChange}
            editable={!disabled}
          />
        ) : (
          <TouchableOpacity
            style={styles.touchable}
            onPress={() => !disabled && setShowModal(true)}
            disabled={disabled}
          >
            <Text style={styles.text}>
              {selectedCity || 'Choisissez une ville'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <HelperText type="error" visible={!!error} style={styles.errorText}>
        {error}
      </HelperText>

      {!manualMode && (
        <Modal transparent visible={showModal} animationType="slide">
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowModal(false)}
          />
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text style={styles.cancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfirm}
                disabled={!isValid}
                style={[styles.confirmButton, !isValid && styles.disabledButton]}
              >
                <Text style={[styles.confirmText, !isValid && styles.disabledText]}>
                  Confirmer
                </Text>
              </TouchableOpacity>
            </View>

            <Picker
              selectedValue={tempCity}
              onValueChange={(value) => setTempCity(value)}
              style={styles.picker}
            >
              <Picker.Item label="Choisissez une ville" value="" />
              {options.map((city) => (
                <Picker.Item key={city} label={city} value={city} />
              ))}
            </Picker>
          </View>
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  label: {
    fontWeight: '600',
    fontSize: 15,
    color: '#333',
    marginBottom: 6,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F3F3',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 6,
  },
  touchable: {
    flex: 1,
    marginLeft: 8,
  },
  text: {
    fontSize: 16,
    color: '#333',
  },
  input: {
    flex: 1,
    marginLeft: 8,
    paddingVertical: 0,
    color: '#000',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    marginLeft: -8,
    marginTop: -6,
    marginBottom: 15,
  },
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
    marginBottom: 8,
  },
  cancelText: {
    fontSize: 14,
    color: '#FFD700',
  },
  confirmButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  confirmText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  disabledButton: { opacity: 0.5 },
  disabledText: { color: '#999' },
  picker: { marginBottom: 8 },
});

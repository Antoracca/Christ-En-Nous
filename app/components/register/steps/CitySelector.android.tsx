import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Dimensions,
} from 'react-native';
import { HelperText, List } from 'react-native-paper';
import LeftInputIcon from '../../LeftInputIcon';

interface CitySelectorAndroidProps {
  selectedCity: string;
  options: string[];
  error?: string;
  disabled?: boolean;
  manualMode?: boolean;
  onChange: (city: string) => void;
}

export default function CitySelectorAndroid({
  selectedCity,
  options,
  error,
  disabled = false,
  manualMode = false,
  onChange,
}: CitySelectorAndroidProps) {
  const [showModal, setShowModal] = useState(false);
  const [tempCity, setTempCity] = useState(selectedCity);

  const isValid = tempCity !== '' && options.includes(tempCity);

  const handleConfirm = () => {
    if (!isValid) return;
    onChange(tempCity);
    setShowModal(false);
  };

  if (manualMode) {
    return (
      <>
        <Text style={styles.label}>Ville</Text>
        <View style={styles.container}>
          <LeftInputIcon icon="city" size={30} />
          <TouchableOpacity style={styles.touchable} activeOpacity={1}>
            <Text style={styles.text}>{selectedCity}</Text>
          </TouchableOpacity>
        </View>
        <HelperText type="error" visible={!!error} style={styles.errorText}>
          {error}
        </HelperText>
      </>
    );
  }

  return (
    <>
      <Text style={styles.label}>Ville</Text>
      <TouchableOpacity
        style={styles.container}
        onPress={() => !disabled && setShowModal(true)}
        disabled={disabled}
      >
        <LeftInputIcon icon="city" size={30} />
        <Text style={styles.text}>
          {selectedCity || 'Choisissez une ville'}
        </Text>
      </TouchableOpacity>
      <HelperText type="error" visible={!!error} style={styles.errorText}>
        {error}
      </HelperText>

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
              style={[
                styles.confirmButton,
                !isValid && styles.disabledButton,
              ]}
            >
              <Text
                style={[
                  styles.confirmText,
                  !isValid && styles.disabledText,
                ]}
              >
                Confirmer
              </Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={options}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => setTempCity(item)}>
                <List.Item
                  title={item}
                  titleStyle={{
                    color: item === tempCity ? '#007AFF' : '#333',
                    fontWeight: item === tempCity ? 'bold' : 'normal',
                  }}
                />
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
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
    marginLeft: 12,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    marginLeft: -8,
    marginTop: -5,
    marginBottom: 8,
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
    maxHeight: Dimensions.get('window').height * 0.6,
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
});

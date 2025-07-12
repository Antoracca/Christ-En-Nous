import React from 'react';
import {
  Modal,
  Platform,
  View,
  StyleSheet,
  Dimensions,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Button } from 'react-native-paper';

interface Props {
  visible: boolean;
  date: Date;
  onChangeTemp: (date: Date) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function DatePickerModal({
  visible,
  date,
  onChangeTemp,
  onCancel,
  onConfirm,
}: Props) {
  if (Platform.OS !== 'ios') return null;

  return (
    <Modal
      visible={visible}
      transparent
      presentationStyle="overFullScreen"
      animationType="slide"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.actionRow}>
            <Button textColor="#FFD700" onPress={onCancel}>Annuler</Button>
            <Button onPress={onConfirm}>OK</Button>
          </View>
          <DateTimePicker
            value={date}
            mode="date"
            display="spinner"
            onChange={(_, d) => d && onChangeTemp(d)}
            maximumDate={new Date()}
            locale="fr-FR"
            style={styles.picker}
          />
        </View>
      </View>
    </Modal>
  );
}

Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingBottom: 12,
    alignItems: 'center', // centre horizontalement le contenu
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  picker: {
    width: '90%',
    height: 216,
    alignSelf: 'center', // s'assure de rester centré
  },
});

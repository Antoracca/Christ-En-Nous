import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '@/hooks/useAppTheme';

const { width } = Dimensions.get('window');

interface ReceiptModalProps {
  visible: boolean;
  onClose: () => void;
  data: {
    reference: string;
    amount: number;
    projectTitle: string;
    date: string;
  };
}

export default function ReceiptModal({ visible, onClose, data }: ReceiptModalProps) {
  const theme = useAppTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.container}>
        <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
        
        <View style={styles.content}>
          {/* Ticket Header */}
          <View style={styles.ticketTop}>
            <View style={styles.holeLeft} />
            <View style={styles.holeRight} />
            <MaterialCommunityIcons name="check-decagram" size={48} color="#10B981" />
            <Text style={styles.successText}>Pré-Enregistré !</Text>
            <Text style={styles.instructionText}>
              Présentez ce reçu à la comptabilité pour valider votre don.
            </Text>
          </View>

          {/* Ticket Body */}
          <View style={styles.ticketBody}>
            <View style={styles.row}>
              <Text style={styles.label}>Référence</Text>
              <Text style={styles.valueRef}>{data.reference}</Text>
            </View>
            <View style={styles.divider} />
            
            <View style={styles.row}>
              <Text style={styles.label}>Projet</Text>
              <Text style={styles.value} numberOfLines={1}>{data.projectTitle}</Text>
            </View>
            
            <View style={styles.row}>
              <Text style={styles.label}>Date</Text>
              <Text style={styles.value}>{data.date}</Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.rowTotal}>
              <Text style={styles.labelTotal}>Montant à payer</Text>
              <Text style={styles.valueTotal}>{data.amount.toLocaleString()} FCFA</Text>
            </View>

            {/* Barcode simulation */}
            <View style={styles.barcodeContainer}>
              {[...Array(20)].map((_, i) => (
                <View 
                  key={i} 
                  style={[
                    styles.barcodeLine, 
                    { width: Math.random() > 0.5 ? 2 : 4, height: 40 }
                  ]} 
                />
              ))}
            </View>
          </View>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.saveButton} onPress={onClose}>
              <Text style={styles.saveText}>Enregistrer dans la galerie</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    overflow: 'hidden',
  },
  ticketTop: {
    backgroundColor: 'white',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    borderStyle: 'dashed',
    position: 'relative',
  },
  holeLeft: {
    position: 'absolute',
    bottom: -10,
    left: -10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.5)', // Match blur tint approx
  },
  holeRight: {
    position: 'absolute',
    bottom: -10,
    right: -10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  successText: {
    fontSize: 20,
    fontFamily: 'Nunito_800ExtraBold',
    color: '#10B981',
    marginTop: 10,
  },
  instructionText: {
    fontSize: 13,
    fontFamily: 'Nunito_600SemiBold',
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 5,
  },
  ticketBody: {
    padding: 24,
    backgroundColor: 'white',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  rowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    alignItems: 'center',
  },
  label: {
    fontSize: 13,
    fontFamily: 'Nunito_600SemiBold',
    color: '#9CA3AF',
  },
  value: {
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
    color: '#1F2937',
    maxWidth: '60%',
  },
  valueRef: {
    fontSize: 16,
    fontFamily: 'Nunito_800ExtraBold',
    color: '#3B82F6',
    letterSpacing: 1,
  },
  labelTotal: {
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
    color: '#1F2937',
  },
  valueTotal: {
    fontSize: 20,
    fontFamily: 'Nunito_800ExtraBold',
    color: '#10B981',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  barcodeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 3,
    marginTop: 20,
    opacity: 0.7,
  },
  barcodeLine: {
    backgroundColor: '#1F2937',
  },
  footer: {
    padding: 16,
    gap: 10,
    backgroundColor: '#F3F4F6',
  },
  saveButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveText: {
    color: 'white',
    fontFamily: 'Nunito_700Bold',
  },
  closeButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeText: {
    color: '#6B7280',
    fontFamily: 'Nunito_700Bold',
  },
});

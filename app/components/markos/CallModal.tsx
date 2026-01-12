import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { ActiveCall, CHAT_USERS } from '@/data/markosChatData';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface CallModalProps {
  visible: boolean;
  onClose: () => void;
  call: ActiveCall;
}

export default function CallModal({ visible, onClose, call }: CallModalProps) {
  if (!visible) return null;

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.container}>
        <Image 
          source={{ uri: call.participants[0].avatar }} 
          style={styles.bgImage} 
          contentFit="cover"
        />
        <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />

        <SafeAreaView style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
             <TouchableOpacity onPress={onClose} style={styles.minimizeBtn}>
               <Feather name="chevron-down" size={28} color="white" />
             </TouchableOpacity>
             <Text style={styles.callType}>MARKOS AUDIO LIVE</Text>
             <View style={{ width: 28 }} />
          </View>

          {/* Call Info */}
          <View style={styles.callInfo}>
            <Text style={styles.callTitle}>{call.title}</Text>
            <Text style={styles.callDuration}>{call.duration}</Text>
          </View>

          {/* Participants Grid */}
          <View style={styles.grid}>
             {call.participants.map((p, i) => (
               <View key={p.id} style={styles.participant}>
                 <View style={styles.avatarContainer}>
                   <Image source={{ uri: p.avatar }} style={styles.avatar} />
                   <View style={styles.speakingIndicator} />
                 </View>
                 <Text style={styles.name}>{p.name}</Text>
               </View>
             ))}
             <View style={styles.participant}>
                 <View style={[styles.avatarContainer, { backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' }]}>
                   <Text style={{ color: 'white', fontFamily: 'Nunito_700Bold' }}>+45</Text>
                 </View>
                 <Text style={styles.name}>Auditeurs</Text>
             </View>
          </View>

          {/* Controls */}
          <View style={styles.controls}>
             <View style={styles.controlsRow}>
                <TouchableOpacity style={styles.controlBtn}>
                   <Ionicons name="mic-off" size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.controlBtn}>
                   <Ionicons name="videocam-off" size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.controlBtn}>
                   <Ionicons name="hand-left" size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.controlBtn, { backgroundColor: '#EF4444' }]} onPress={onClose}>
                   <MaterialCommunityIcons name="phone-hangup" size={28} color="white" />
                </TouchableOpacity>
             </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

import { SafeAreaView } from 'react-native-safe-area-context';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  bgImage: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  minimizeBtn: {
    padding: 8,
  },
  callType: {
    color: 'rgba(255,255,255,0.6)',
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    letterSpacing: 1,
  },
  callInfo: {
    alignItems: 'center',
    marginBottom: 40,
  },
  callTitle: {
    color: 'white',
    fontSize: 24,
    fontFamily: 'Nunito_800ExtraBold',
    textAlign: 'center',
    marginBottom: 8,
  },
  callDuration: {
    color: '#10B981',
    fontSize: 16,
    fontFamily: 'Nunito_600SemiBold',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20,
    paddingHorizontal: 20,
  },
  participant: {
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    position: 'relative',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  speakingIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10B981',
    borderWidth: 3,
    borderColor: '#000',
  },
  name: {
    color: 'white',
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
  },
  controls: {
    padding: 30,
    paddingBottom: 50,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 30,
    paddingVertical: 15,
  },
  controlBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

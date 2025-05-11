// app/auth/register/index.tsx

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Animated,
  Easing,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Svg, { Path } from 'react-native-svg';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { lightTheme } from '../../../constants/theme';

import Step1 from './Step1';
import Step2 from './Step2';
import Step3 from './Step3';
import Step4 from './Step4';
import Step5 from './Step5';

const { colors, fonts } = lightTheme;
const BG = require('../../../assets/images/imagebacklogin.png');
const LOGO = require('../../../assets/images/logowithTexteT.png');
const RING_OUTER = 152;
const RING_BORDER = 12;
const LOGO_INSIDE = RING_OUTER - 2 * RING_BORDER; // 128
const TOTAL_STEPS = 5;

export default function Register() {
  const navigation = useNavigation();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', quartier: '',
    ville: '', pays: '', fidelite: 'nouveau', role: '',
    dob: new Date(), message: '', password: '', confirm: ''
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  const scale = useRef(new Animated.Value(0.8)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0.8, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const onChange = (key: string, value: any) => setForm({ ...form, [key]: value });

  const renderStep = () => {
    switch (step) {
      case 1: return <Step1 form={form} onChange={onChange} />;
      case 2: return <Step2 form={form} onChange={onChange} />;
      case 3: return <Step3 form={form} onChange={onChange} showDatePicker={showDatePicker} setShowDatePicker={setShowDatePicker} />;
      case 4: return <Step4 form={form} onChange={onChange} />;
      case 5: return <Step5 form={form} onChange={onChange} />;
      default: return null;
    }
  };

  const onNext = () => step < TOTAL_STEPS ? setStep(step + 1) : console.log('Submit', form);
  const onBack = () => step > 1 && setStep(step - 1);

  return (
    <ImageBackground source={BG} style={styles.background} imageStyle={styles.backgroundImage}>
      <LinearGradient colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.6)']} style={styles.halfOverlay} />

      <View style={styles.overlay}>
        <View style={styles.blurWrapper}>
          <BlurView style={styles.formCard} tint="light" intensity={40}>
            <View style={styles.logoRing}>
              <Animated.Image
                source={LOGO}
                style={{ width: LOGO_INSIDE, height: LOGO_INSIDE, transform: [{ scale }] }}
                resizeMode="contain"
              />
            </View>

            <Text style={styles.churchName}>Christ En Nous</Text>
            <Text style={styles.greeting}>Shalom !</Text>
            <Text style={styles.subtitle}>Crée ton compte pour rejoindre ta famille spirituelle</Text>

            <View style={styles.inputsWrapper}>
  {renderStep()}
</View>


            <View style={styles.buttonRow}>
              {step > 1 && (
                <TouchableOpacity style={styles.backButton} onPress={onBack}>
                  <Text style={styles.backButtonText}>Précédent</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.nextButton} onPress={onNext}>
                <Text style={styles.nextButtonText}>{step < TOTAL_STEPS ? 'Suivant' : 'Terminer'}</Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  backgroundImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  halfOverlay: { position: 'absolute', top: 0, left: 0, right: 0, height: '50%' },
  wave: { position: 'absolute', top: '50%' },
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  blurWrapper: { width: '90%', borderRadius: 24, overflow: 'hidden' },
  formCard: { padding: 24, alignItems: 'center' },
  logoRing: { width: RING_OUTER, height: RING_OUTER, borderRadius: RING_OUTER/2, borderWidth: RING_BORDER, borderColor: colors.accent, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  churchName: { fontSize: 28, color: colors.text, fontWeight: 'bold', textAlign: 'center' },
  greeting: { fontSize: 22, color: colors.primary, marginVertical: 4, textAlign: 'center', fontStyle: 'italic' },
  subtitle: { fontSize: 16, color: colors.text, marginBottom: 24, textAlign: 'center' },
  scroll: { width: '100%' },
  inputsWrapper: {
    width: '100%',
    minHeight: 290,
    justifyContent: 'flex-start',
    marginTop: 50,     
  },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, width: '100%' },
  backButton: { padding: 12 },
  backButtonText: { color: colors.primary, fontSize: fonts.sizes.medium },
  nextButton: { backgroundColor: colors.secondary, paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12 },
  nextButtonText: { color: '#000', fontSize: fonts.sizes.medium, fontWeight: '600' },
});

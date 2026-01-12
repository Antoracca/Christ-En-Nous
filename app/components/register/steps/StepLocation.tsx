import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity
} from 'react-native';
import * as Location from 'expo-location';
import * as Localization from 'expo-localization';
import { CountryCode } from '@/types/country';

import CountrySelector from './CountrySelector';
import CitySelector from './CitySelector';
import QuarterInput from './QuarterInput';
import { countryNames, citiesByCountryCode } from 'assets/data/countries.utils';

interface StepLocationProps {
  country: string;
  city: string;
  quarter: string;
  errors?: { country?: string; city?: string; quarter?: string };
  disabled?: boolean;
  onChange: (field: 'country' | 'city' | 'quarter', value: string) => void;
  forceValidation: boolean;
}

export default function StepLocation({
  country,
  city,
  quarter,
  disabled = false,
  onChange,
  forceValidation,
}: StepLocationProps) {
  const [code, setCode] = useState<CountryCode>('CF');
  const [selectedCity, setSelectedCity] = useState<string>(city);
  const [manualCityMode, setManualCityMode] = useState(false);
  const [localErrors, setLocalErrors] = useState<{ country?: string; city?: string; quarter?: string }>({});
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [hasDetected, setHasDetected] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const cityOptions = useMemo(() => citiesByCountryCode[code] || [], [code]);

  // 🌍 Détection initiale basique au chargement (sans GPS)
  useEffect(() => {
    // Si on a déjà des données, on les garde
    if (country || city || quarter) return;
    
    // Sinon, utiliser la région du device comme valeur par défaut
    const [{ regionCode }] = Localization.getLocales();
    const region = (regionCode as CountryCode) || 'CF';
    const valid = region in countryNames ? region : 'CF';
    setCode(valid);
    onChange('country', countryNames[valid]);
  }, [city, country, onChange, quarter]);

  // ✅ Validation lors de forceValidation
  useEffect(() => {
    if (forceValidation) {
      const newErrors: typeof localErrors = {};
      if (!country) newErrors.country = 'Veuillez sélectionner un pays';
      if (!city) newErrors.city = 'Veuillez choisir ou saisir une ville';
      if (!quarter || quarter.trim().length < 2)
        newErrors.quarter = 'Veuillez entrer un quartier ou une adresse valide';
      setLocalErrors(newErrors);
    }
  }, [forceValidation, country, city, quarter]);

  // 🎯 Règle 1 : Changement manuel de pays → vider ville et adresse
  const handleCountryChange = (name: string, newCode: string) => {
    setCode(newCode as CountryCode);
    onChange('country', name);
    
    // Réinitialiser ville et adresse
    setSelectedCity('');
    onChange('city', '');
    onChange('quarter', '');
    
    // Activer le mode manuel si le pays n'a pas de villes
    const hasCities = (newCode in citiesByCountryCode) && citiesByCountryCode[newCode as keyof typeof citiesByCountryCode] && citiesByCountryCode[newCode as keyof typeof citiesByCountryCode].length > 0;
    setManualCityMode(!hasCities);
  };

  // 🎯 Règle 2 : Changement manuel de ville → vider adresse
  const handleCityChange = (val: string) => {
    setSelectedCity(val);
    onChange('city', val);
    
    // Réinitialiser l'adresse
    onChange('quarter', '');
  };

  // 🎯 Règle 3 : Changement d'adresse → pas d'impact
  const handleQuarterChange = (value: string) => {
    onChange('quarter', value);
  };

  // 🎯 Règle 4 : Détection GPS complète
  const handleDetectLocation = async () => {
    // 1. Vider tous les champs immédiatement
    setCode('CF');
    onChange('country', '');
    onChange('city', '');
    onChange('quarter', '');
    setSelectedCity('');
    setIsLoadingLocation(true);
    
    try {
      // Demander la permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission refusée',
          'Veuillez autoriser la géolocalisation dans les paramètres de votre téléphone.'
        );
        setIsLoadingLocation(false);
        
        // Restaurer la région par défaut
        const [{ regionCode }] = Localization.getLocales();
        const region = (regionCode as CountryCode) || 'CF';
        const valid = region in countryNames ? region : 'CF';
        setCode(valid);
        onChange('country', countryNames[valid]);
        return;
      }

      // Obtenir la position avec haute précision
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 0,
      });

      // Géocodage inverse
      const geocodeResults = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (geocodeResults && geocodeResults.length > 0) {
        const place = geocodeResults[0];
        
        // 2. Remplir le pays
        let detectedCode: CountryCode = 'CF';
        if (place.isoCountryCode) {
          const countryCode = place.isoCountryCode as CountryCode;
          detectedCode = countryCode in countryNames ? countryCode : 'CF';
          
          setCode(detectedCode);
          onChange('country', countryNames[detectedCode]);
        }
        
        // 3. Remplir la ville
        if (place.city) {
          const cityList = citiesByCountryCode[detectedCode] || [];
          
          if (cityList.includes(place.city)) {
            // La ville est dans la liste
            setSelectedCity(place.city);
            onChange('city', place.city);
            setManualCityMode(false);
          } else {
            // La ville n'est pas dans la liste → mode manuel
            setSelectedCity(place.city);
            onChange('city', place.city);
            setManualCityMode(true);
          }
        }
        
        // 4. Remplir l'adresse
        const addressParts = [];
        if (place.streetNumber) addressParts.push(place.streetNumber);
        if (place.street) addressParts.push(place.street);
        if (place.district) addressParts.push(place.district);
        if (place.subregion && place.subregion !== place.city) {
          addressParts.push(place.subregion);
        }
        
        const fullAddress = addressParts.join(', ');
        if (fullAddress) {
          onChange('quarter', fullAddress);
        }
        
        Alert.alert(
          'Position détectée',
          'Votre localisation a été mise à jour avec succès.',
          [{ text: 'OK' }]
        );
        setHasDetected(true);
      }
      
    } catch (error) {
      console.error('Erreur de géolocalisation:', error);
      Alert.alert(
        'Erreur',
        'Impossible de détecter votre position. Veuillez réessayer.',
        [{ text: 'OK' }]
      );
      
      // En cas d'erreur, restaurer la région par défaut
      const [{ regionCode }] = Localization.getLocales();
      const region = (regionCode as CountryCode) || 'CF';
      const valid = region in countryNames ? region : 'CF';
      setCode(valid);
      onChange('country', countryNames[valid]);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Fonction pour faire défiler jusqu'au champ actif
  const scrollToInput = (yPosition: number) => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: yPosition - 100, animated: true });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 20}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <Text style={styles.stepTitle}>Étape 4 : Localisation</Text>
          <Text style={styles.stepDescription}>
            Choisissez votre pays, ville et précisez votre quartier.
          </Text>

          <CountrySelector
            country={country}
            error={localErrors.country}
            disabled={disabled}
            onChange={handleCountryChange}
          />

          <CitySelector
            selectedCity={selectedCity}
            options={cityOptions}
            error={localErrors.city}
            disabled={disabled}
            manualMode={manualCityMode}
            onChange={handleCityChange}
          />

          <View onLayout={(event) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { y } = event.nativeEvent.layout;
          }}>
            <QuarterInput
              value={quarter}
              error={localErrors.quarter}
              disabled={disabled}
              onChange={handleQuarterChange}
              onFocus={() => {
                setTimeout(() => scrollToInput(300), 100);
              }}
            />
          </View>

          <TouchableOpacity 
            style={[
              styles.detectButton,
              isLoadingLocation && styles.detectButtonLoading
            ]} 
            onPress={handleDetectLocation}
            disabled={disabled || isLoadingLocation}
          >
            {isLoadingLocation ? (
              <>
                <ActivityIndicator size="small" color="#92400E" />
                <Text style={styles.detectButtonText}>Détection en cours...</Text>
              </>
            ) : (
              <>
                <Text style={styles.detectButtonIcon}>📍</Text>
                <Text style={styles.detectButtonText}>
                  {hasDetected ? 'Redétecter ma position' : 'Détecter ma position'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Espace supplémentaire pour permettre le scroll au-dessus du clavier */}
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
    backgroundColor: '#FFF',
    borderRadius: 25,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 16,
  },
  stepDescription: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 24,
    lineHeight: 24,
  },
  detectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFD700',
    padding: 14,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  detectButtonLoading: {
    backgroundColor: '#FFF9E6',
  },
  detectButtonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  detectButtonText: {
    color: '#92400E',
    fontSize: 16,
    fontWeight: '700',
  },
});

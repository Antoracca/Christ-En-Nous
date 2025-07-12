import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import * as Localization from 'expo-localization';
import { CountryCode } from 'react-native-country-picker-modal';

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
  const [isCountrySetManually, setIsCountrySetManually] = useState(false);
  const [isCitySetManually, setIsCitySetManually] = useState(false);
  const [manualCityMode, setManualCityMode] = useState(false);
  const [localErrors, setLocalErrors] = useState<{ country?: string; city?: string; quarter?: string }>({});

  const cityOptions = useMemo(() => citiesByCountryCode[code] || [], [code]);

  // 🌍 Détection automatique du pays via device
  useEffect(() => {
    if (!country && !isCountrySetManually) {
      const [{ regionCode }] = Localization.getLocales();
      const region = (regionCode as CountryCode) || 'CF';
      const valid = region in countryNames ? region : 'CF';
      setCode(valid); // essentiel pour charger les villes
      onChange('country', countryNames[valid]);
    }
  }, [country, isCountrySetManually, onChange]);

  // 📍 Détection automatique de la ville
  useEffect(() => {
    (async () => {
      if (disabled || isCitySetManually) return;
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const loc = await Location.getCurrentPositionAsync({});
      const [place] = await Location.reverseGeocodeAsync(loc.coords);

      if (place && place.city) {
        const detectedCountryCode = (place.isoCountryCode as CountryCode) || 'CF';
        const valid = detectedCountryCode in countryNames ? detectedCountryCode : 'CF';

        setCode(valid);
        onChange('country', countryNames[valid]);

        if (citiesByCountryCode[valid]?.includes(place.city)) {
          setSelectedCity(place.city);
          onChange('city', place.city);
        }
      }
    })();
  }, [disabled, isCitySetManually, onChange]);

  // ✅ Validation complète lors de forceValidation
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

  const handleCountryChange = (name: string, newCode: CountryCode) => {
    setCode(newCode);
    onChange('country', name);
    setSelectedCity('');
    onChange('city', '');
    setIsCountrySetManually(true);
    setIsCitySetManually(false);
    setManualCityMode(!citiesByCountryCode[newCode]?.length);
  };

  const handleCityChange = (val: string) => {
    setSelectedCity(val);
    onChange('city', val);
    setIsCitySetManually(true);
  };

  const handleQuarterChange = (value: string) => {
    onChange('quarter', value);
  };

  return (
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

      <QuarterInput
        value={quarter}
        error={localErrors.quarter}
        disabled={disabled}
        onChange={handleQuarterChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
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
});

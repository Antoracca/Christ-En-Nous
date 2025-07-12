import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  useColorScheme,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from 'navigation/AppNavigator';


interface SocialNetworksProps {
  onLoginPress: () => void;
  onGooglePress: () => void;
  onFacebookPress: () => void;
  onApplePress?: () => void;
}

export default function SocialNetworks({
  onGooglePress,
  onFacebookPress,
  onApplePress,
}: Omit<SocialNetworksProps, 'onLoginPress'>) {
 const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const isDark = useColorScheme() === 'dark';

  return (
    <View style={styles.container}>
      {/* Connexion */}
      <View style={styles.loginRow}>
        <Text style={[styles.loginText, isDark && styles.loginTextDark]}>Vous avez déjà un compte ?</Text>

       <TouchableOpacity onPress={() => navigation.navigate('Login')}>
  <Text style={styles.loginLink}> Connectez-vous !</Text>
</TouchableOpacity>

      </View>

       {/* Ou */}
      <Text style={[styles.orText, isDark && styles.orTextDark]}>ou</Text>

      {/* Séparateur simple */}
      <View style={styles.separatorContainer}>
        <View style={styles.separatorLine} />
        <Text style={[styles.separatorText, isDark && styles.separatorTextDark]}>Inscription via</Text>
        <View style={styles.separatorLine} />
      </View>

      {/* Boutons sociaux */}
      <View style={styles.socialRow}>
        <TouchableOpacity style={[styles.iconButton, styles.google]} onPress={onGooglePress}>
          <FontAwesome5 name="google" size={24} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.iconButton, styles.facebook]} onPress={onFacebookPress}>
          <FontAwesome5 name="facebook-f" size={24} color="#fff" />
        </TouchableOpacity>

        {Platform.OS === 'ios' && onApplePress && (
          <TouchableOpacity style={[styles.iconButton, styles.apple]} onPress={onApplePress}>
            <FontAwesome5 name="apple" size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 16,
    marginVertical: 8,
    alignItems: 'center',
  },
  loginRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  loginText: {
    fontSize: 14,
    color: '#001F5B',
    
  },
  loginTextDark: {
    color: '#CCC',
  },
  loginLink: {
    fontSize: 14,
    color: '#0f056b',
    fontWeight: '600',
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
    marginVertical: 16,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#AAA',
   
  },
  separatorText: {
    marginHorizontal: 8,
    fontSize: 12,
    color: '#0f056b',
    marginVertical: 1,
  },
  separatorTextDark: {
    color: '#888',
   
  },
  orText: {
    fontSize: 14,
    color: '#444',
    marginVertical: 1,
  },
  orTextDark: {
    color: '#CCC',
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  iconButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  google: {
    backgroundColor: '#DB4437',
  },
  facebook: {
    backgroundColor: '#4267B2',
  },
  apple: {
    backgroundColor: '#000',
  },
});

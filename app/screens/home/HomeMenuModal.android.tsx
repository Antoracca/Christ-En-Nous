import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAppTheme } from '@/hooks/useAppTheme';
import { useAuth } from '@/context/AuthContext';
import type { RootStackParamList } from '../../../navigation/AppNavigator';

interface HomeMenuModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const HomeMenuModal: React.FC<HomeMenuModalProps> = ({ isVisible, onClose }) => {
  const theme = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { logout } = useAuth();

  const goToProfile = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
    setTimeout(() => {
      router.navigate('Main', { screen: 'ProfileTab' });
    }, 120);
  }, [navigation, onClose]);

  const goToSecurity = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
    setTimeout(() => {
      router.navigate('Security');
    }, 120);
  }, [navigation, onClose]);

  const showComingSoon = useCallback((label: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert('Bientot disponible', `${label} sera disponible prochainement.`);
  }, []);

  const handleLogout = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    onClose();
    setTimeout(() => {
      Alert.alert(
        'Deconnexion',
        'Voulez-vous vraiment vous deconnecter ?',
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Confirmer',
            style: 'destructive',
            onPress: () => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              logout();
            },
          },
        ],
      );
    }, 120);
  }, [logout, onClose]);

  const actions = useMemo(
    () => [
      { key: 'profile', icon: 'user', label: 'Mon profil', onPress: goToProfile },
      { key: 'security', icon: 'shield', label: 'Securite et confidentialite', onPress: goToSecurity },
      { key: 'notifications', icon: 'bell', label: 'Notifications', onPress: () => showComingSoon('La gestion des notifications') },
      { key: 'events', icon: 'calendar', label: 'Programme et evenements', onPress: () => showComingSoon('Le programme des evenements') },
      { key: 'don', icon: 'heart', label: 'Dons et offrandes', onPress: () => showComingSoon('Les dons en ligne') },
      { key: 'logout', icon: 'log-out', label: 'Se deconnecter', onPress: handleLogout, danger: true },
    ],
    [goToProfile, goToSecurity, showComingSoon, handleLogout],
  );

  if (!isVisible) {
    return null;
  }

  return (
    <View style={styles.overlay}>
      <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
      <View style={[styles.sheet, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.custom.colors.text }]}>Christ en Nous</Text>
          <Text style={[styles.subtitle, { color: theme.custom.colors.placeholder }]}>Actions rapides</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        >
          {actions.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={[
                styles.item,
                { borderColor: item.danger ? theme.colors.error + '33' : theme.colors.primary + '22' },
              ]}
              activeOpacity={0.75}
              onPress={item.onPress}
            >
              <View
                style={[
                  styles.iconWrapper,
                  { backgroundColor: item.danger ? theme.colors.error + '1A' : theme.colors.primary + '1A' },
                ]}
              >
                <Feather
                  name={item.icon as any}
                  size={22}
                  color={item.danger ? theme.colors.error : theme.colors.primary}
                />
              </View>
              <Text
                style={[
                  styles.itemLabel,
                  { color: item.danger ? theme.colors.error : theme.custom.colors.text },
                ]}
              >
                {item.label}
              </Text>
              <Feather name="chevron-right" size={18} color={theme.custom.colors.placeholder} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,23,42,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 24,
    elevation: 40,
    shadowColor: '#0f172a',
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Nunito_700Bold',
  },
  subtitle: {
    fontSize: 13,
    fontFamily: 'Nunito_400Regular',
    marginTop: 4,
  },
  list: {
    paddingBottom: 10,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 18,
    marginBottom: 12,
    borderWidth: 1,
  },
  iconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  itemLabel: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Nunito_600SemiBold',
  },
});

export default HomeMenuModal;


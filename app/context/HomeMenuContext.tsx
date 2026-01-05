import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  useEffect,
} from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  ScrollView,
  Alert,
} from 'react-native';
import { Portal } from 'react-native-paper';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useAppTheme } from '@/hooks/useAppTheme';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';


type MenuAction = {
  key: string;
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress: () => void;
  danger?: boolean;
};

interface HomeMenuContextValue {
  openMenu: () => void;
  closeMenu: () => void;
  isVisible: boolean;
  actions: MenuAction[];
}

const HomeMenuContext = createContext<HomeMenuContextValue | undefined>(undefined);

const WINDOW = Dimensions.get('window');
const SHEET_MAX_HEIGHT = Math.min(WINDOW.height * 0.75, 520);

export const HomeMenuProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useAppTheme();
  const { logout } = useAuth();
  const router = useRouter();

  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [pointerEvents, setPointerEvents] = useState<'auto' | 'none'>('none');

  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslate = useRef(new Animated.Value(40)).current;

  const closeMenu = useCallback(() => {
    setIsVisible(false);
  }, []);

  const openMenu = useCallback(() => {
    if (isVisible || shouldRender) {
      return;
    }
    setShouldRender(true);
    requestAnimationFrame(() => {
      setPointerEvents('auto');
      setIsVisible(true);
    });
  }, [isVisible, shouldRender]);

  useEffect(() => {
    if (!shouldRender) {
      overlayOpacity.setValue(0);
      sheetTranslate.setValue(40);
      return;
    }

    if (isVisible) {
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 160,
          useNativeDriver: true,
        }),
        Animated.spring(sheetTranslate, {
          toValue: 0,
          damping: 18,
          stiffness: 180,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 140,
          useNativeDriver: true,
        }),
        Animated.timing(sheetTranslate, {
          toValue: 40,
          duration: 140,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setPointerEvents('none');
        setShouldRender(false);
      });
    }
  }, [isVisible, shouldRender, overlayOpacity, sheetTranslate]);

  const navigateWithClose = useCallback(
    (path: string) => {
      closeMenu();
      setTimeout(() => {
        router.push(path as any);
      }, 160);
    },
    [closeMenu, router],
  );

  const showComingSoon = useCallback(
    (label: string) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      closeMenu();
      setTimeout(() => {
        Alert.alert('Bientot disponible', `${label} sera disponible prochainement.`);
      }, 140);
    },
    [closeMenu],
  );

  const actions = useMemo<MenuAction[]>(() => {
    return [
      {
        key: 'profile',
        icon: 'user',
        label: 'Mon profil',
        onPress: () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          navigateWithClose('/(tabs)/profile');
        },
      },
      {
        key: 'security',
        icon: 'shield',
        label: 'Securite et confidentialite',
        onPress: () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          navigateWithClose('/(modals)/security');
        },
      },
      {
        key: 'notifications',
        icon: 'bell',
        label: 'Notifications',
        onPress: () => showComingSoon('Les notifications'),
      },
      {
        key: 'events',
        icon: 'calendar',
        label: 'Programme et evenements',
        onPress: () => showComingSoon('Le programme des evenements'),
      },
      {
        key: 'don',
        icon: 'heart',
        label: 'Dons et offrandes',
        onPress: () => showComingSoon('Les dons en ligne'),
      },
      {
        key: 'logout',
        icon: 'log-out',
        label: 'Se deconnecter',
        danger: true,
        onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          closeMenu();
          setTimeout(() => {
            logout();
          }, 120);
        },
      },
    ];
  }, [closeMenu, logout, navigateWithClose, showComingSoon]);

  const contextValue = useMemo<HomeMenuContextValue>(
    () => ({
      openMenu,
      closeMenu,
      isVisible: shouldRender && isVisible,
      actions,
    }),
    [openMenu, closeMenu, shouldRender, isVisible, actions],
  );

  return (
    <HomeMenuContext.Provider value={contextValue}>
      {children}
      <Portal>
        {shouldRender ? (
          <Animated.View
            pointerEvents={pointerEvents}
            style={[
              StyleSheet.absoluteFill,
              styles.overlay,
              { opacity: overlayOpacity },
            ]}
          >
            <TouchableOpacity style={StyleSheet.absoluteFill} onPress={closeMenu} activeOpacity={1} />
            <Animated.View
              style={[
                styles.sheet,
                {
                  backgroundColor: theme.colors.surface,
                  transform: [{ translateY: sheetTranslate }],
                },
              ]}
            >
              <View style={styles.header}>
                <Text style={[styles.title, { color: theme.custom.colors.text }]}>
                  Christ en Nous
                </Text>
                <Text style={[styles.subtitle, { color: theme.custom.colors.placeholder }]}>
                  Actions rapides
                </Text>
              </View>
              <ScrollView
                style={{ maxHeight: SHEET_MAX_HEIGHT }}
                contentContainerStyle={styles.actionsContainer}
                showsVerticalScrollIndicator={false}
              >
                {actions.map((item) => (
                  <TouchableOpacity
                    key={item.key}
                    style={[
                      styles.actionRow,
                      { borderColor: item.danger ? theme.colors.error + '22' : theme.colors.primary + '22' },
                    ]}
                    activeOpacity={0.85}
                    onPress={item.onPress}
                  >
                    <View
                      style={[
                        styles.iconWrapper,
                        { backgroundColor: item.danger ? theme.colors.error + '15' : theme.colors.primary + '15' },
                      ]}
                    >
                      <Feather
                        name={item.icon}
                        size={22}
                        color={item.danger ? theme.colors.error : theme.colors.primary}
                      />
                    </View>
                    <Text
                      style={[
                        styles.actionLabel,
                        { color: item.danger ? theme.colors.error : theme.custom.colors.text },
                      ]}
                    >
                      {item.label}
                    </Text>
                    <Feather name="chevron-right" size={18} color={theme.custom.colors.placeholder} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Animated.View>
          </Animated.View>
        ) : null}
      </Portal>
    </HomeMenuContext.Provider>
  );
};

export const useHomeMenu = () => {
  const context = useContext(HomeMenuContext);
  if (!context) {
    throw new Error('useHomeMenu must be used within a HomeMenuProvider');
  }
  return context;
};

const styles = StyleSheet.create({
  overlay: {
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
  actionsContainer: {
    paddingBottom: 10,
  },
  actionRow: {
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
  actionLabel: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Nunito_600SemiBold',
  },
});

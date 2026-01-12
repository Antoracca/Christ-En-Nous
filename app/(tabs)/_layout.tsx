// app/(tabs)/_layout.tsx - CUSTOM TAB BAR AVEC ANIMATIONS REANIMATED
import React, { useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, Image } from 'react-native';
import { Tabs, useRouter, usePathname } from 'expo-router';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, interpolate } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/hooks/useAppTheme';
import { EnhancedBibleProvider } from '@/context/EnhancedBibleContext';
import { ReadingSettingsProvider } from '@/context/ReadingSettingsContext';
import { MusicProvider } from '@/context/MusicContext';

// Composant CentralHomeButton avec animations Reanimated
const CentralHomeButton = ({ isFocused }: { isFocused: boolean }) => {
  const theme = useAppTheme();
  const router = useRouter();
  const scaleAnim = useSharedValue(1);

  useEffect(() => {
    scaleAnim.value = withSpring(isFocused ? 1.05 : 1, { damping: 10, stiffness: 150 });
  }, [isFocused, scaleAnim]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }],
  }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(tabs)');
  };

  const lightGradientColors = [theme.colors.primary, '#1E3A8A'] as const;
  const darkGradientColors = [theme.colors.primary, theme.custom.colors.background] as const;

  return (
    <TouchableOpacity onPress={handlePress} style={styles.centralButtonContainer} activeOpacity={1}>
      <Animated.View style={[styles.centralButton, animatedStyle]}>
        <LinearGradient
          colors={theme.dark ? darkGradientColors : lightGradientColors}
          style={styles.centralButtonGradient}
        >
          <Image
            source={require('../../assets/images/christlg.png')}
            style={{ width: 40, height: 40, resizeMode: 'contain' }}
          />
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
};

// Composant AnimatedTab avec animations Reanimated
const AnimatedTab = ({
  isFocused,
  onPress,
  iconName,
  iconType,
  label
}: {
  isFocused: boolean;
  onPress: () => void;
  iconName: React.ComponentProps<typeof Feather | typeof FontAwesome5>['name'];
  iconType: 'feather' | 'fontawesome5';
  label: string;
}) => {
  const theme = useAppTheme();
  const progress = useSharedValue(isFocused ? 1 : 0);

  useEffect(() => {
    progress.value = withSpring(isFocused ? 1 : 0, { damping: 15, stiffness: 120 });
  }, [isFocused, progress]);

  const animatedContainerStyle = useAnimatedStyle(() => {
    const translateY = interpolate(progress.value, [0, 1], [0, -5]);
    return {
      transform: [{ translateY }],
    };
  });

  const animatedLabelStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: progress.value }]
  }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const iconColor = isFocused ? theme.colors.onPrimary : 'rgba(255, 255, 255, 0.7)';

  const renderIcon = () => {
    if (iconType === 'fontawesome5') {
      return <FontAwesome5 name={iconName} size={24} color={iconColor} />;
    }
    return <Feather name={iconName} size={26} color={iconColor} />;
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.tabItem} activeOpacity={1}>
      <Animated.View style={[styles.tabItemInner, animatedContainerStyle]}>
        {renderIcon()}
        <Animated.Text style={[styles.tabLabel, { color: theme.colors.onPrimary }, animatedLabelStyle]}>
          {label}
        </Animated.Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

// Custom Tab Bar Component
function CustomTabBar({ state, descriptors, navigation }: any) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Masquer la barre si l'écran actif le demande
  const focusedRoute = state.routes[state.index];
  const focusedDescriptor = descriptors[focusedRoute.key];
  const focusedOptions = focusedDescriptor.options;

  if ((focusedOptions.tabBarStyle as any)?.display === 'none') {
    return null;
  }

  const tabConfig = [
    { route: 'bible', icon: 'book-open', label: 'Bible', type: 'feather' as const },
    { route: 'courses', icon: 'award', label: 'Cours', type: 'feather' as const },
    { route: 'index', icon: 'home', label: 'Accueil', type: 'feather' as const },
    { route: 'prayer', icon: 'praying-hands', label: 'Prières', type: 'fontawesome5' as const },
    { route: 'profile', icon: 'user', label: 'Profil', type: 'feather' as const },
  ];

  const homeRouteIndex = state.routes.findIndex((r: any) => r.name === 'index');
  const baseHeight = Platform.OS === 'ios' ? 110 : 85;
  const basePaddingBottom = Platform.OS === 'ios' ? 30 : 15;
  const bottomOffset = Platform.OS === 'android' ? Math.max(insets.bottom, 0) : 0;

  return (
    <View
      style={[
        styles.tabBarWrapper,
        {
          height: baseHeight,
          paddingBottom: basePaddingBottom,
          bottom: bottomOffset,
        },
      ]}
    >
      <LinearGradient
        colors={[theme.colors.primary, '#1E3A8A']}
        style={styles.tabBarContainer}
      >
        <View style={styles.tabBarContent}>
          {state.routes.map((route: any, index: number) => {
            const isFocused = state.index === index;
            const config = tabConfig.find(t => t.route === route.name);

            if (route.name === 'index') {
              // Espace vide pour le bouton central
              return <View key={route.key} style={styles.centralButtonPlaceholder} />;
            }

            if (!config) return null;

            return (
              <AnimatedTab
                key={route.key}
                isFocused={isFocused}
                onPress={() => {
                  const event = navigation.emit({
                    type: 'tabPress',
                    target: route.key,
                    canPreventDefault: true,
                  });

                  if (!isFocused && !event.defaultPrevented) {
                    navigation.navigate(route.name);
                  }
                }}
                iconName={config.icon as any}
                iconType={config.type}
                label={config.label}
              />
            );
          })}
        </View>
      </LinearGradient>

      {/* Bouton central au-dessus de la barre */}
      <CentralHomeButton isFocused={state.index === homeRouteIndex} />
    </View>
  );
}

export default function TabsLayout() {
  const theme = useAppTheme();

  return (
    <MusicProvider>
      <EnhancedBibleProvider>
        <ReadingSettingsProvider>
          <Tabs
            tabBar={(props) => <CustomTabBar {...props} />}
            screenOptions={{
              headerStyle: {
                backgroundColor: theme.colors.surface,
                elevation: 0,
                shadowOpacity: 0,
              },
              headerTitleStyle: {
                fontFamily: 'Nunito_700Bold',
                color: theme.custom.colors.text,
                fontSize: 20,
              },
              headerTintColor: theme.custom.colors.text,
            }}
          >
            <Tabs.Screen
              name="bible"
              options={{
                title: 'Sainte Bible',
                headerShown: false,
              }}
            />
            <Tabs.Screen
              name="courses"
              options={{
                title: 'Cours',
                headerShown: true,
              }}
            />
            <Tabs.Screen
              name="index"
              options={{
                title: 'Accueil',
                headerShown: false,
              }}
            />
            <Tabs.Screen
              name="prayer"
              options={{
                title: 'Prières',
                headerShown: true,
              }}
            />
            <Tabs.Screen
              name="profile"
              options={{
                title: 'Mon Profil',
                headerShown: true,
                headerLeft: () => (
                  <TouchableOpacity
                    onPress={() => {}}
                    style={{ marginLeft: 15, padding: 5 }}
                  >
                    <Feather name="arrow-left" size={24} color={theme.custom.colors.text} />
                  </TouchableOpacity>
                ),
              }}
            />
            <Tabs.Screen
              name="markos"
              options={{
                href: null,
                headerShown: false,
                tabBarStyle: { display: 'none' },
              }}
            />
            <Tabs.Screen
              name="library"
              options={{
                href: null,
                headerShown: false,
                tabBarStyle: { display: 'none' },
              }}
            />
            <Tabs.Screen
              name="church"
              options={{
                href: null,
                headerShown: false,
                tabBarStyle: { display: 'none' },
              }}
            />
            <Tabs.Screen
              name="missions"
              options={{
                href: null,
                headerShown: false,
                tabBarStyle: { display: 'none' },
              }}
            />
            <Tabs.Screen
              name="news"
              options={{
                href: null,
                headerShown: false,
                tabBarStyle: { display: 'none' },
              }}
            />
            <Tabs.Screen
              name="cantiques"
              options={{
                title: 'Cantiques',
                 // Cache l'onglet cantiques de la barre du bas pour laisser la place à Markos
                 // Il reste accessible via la navigation stack si on clique sur un lien, 
                 // mais il n'aura pas de bouton dans la barre.
                href: null, 
                headerShown: false,
                tabBarStyle: { display: 'none' },
              }}
            />
          </Tabs>
        </ReadingSettingsProvider>
      </EnhancedBibleProvider>
    </MusicProvider>
  );
}

// Styles identiques au MainNavigator original
const styles = StyleSheet.create({
  tabBarWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  tabBarContainer: {
    flex: 1,
    borderRadius: 30,
    borderWidth: Platform.OS === 'ios' ? 1 : 0,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  },
  tabBarContent: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
  },
  tabItem: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabItemInner: {
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 10,
    fontFamily: 'Nunito_700Bold',
    marginTop: 2,
  },
  centralButtonPlaceholder: {
    flex: 1.2,
  },
  centralButtonContainer: {
    position: 'absolute',
    alignSelf: 'center',
    top: -15,
    zIndex: 10,
  },
  centralButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    backgroundColor: 'white',
  },
  centralButtonGradient: {
    flex: 1,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
});

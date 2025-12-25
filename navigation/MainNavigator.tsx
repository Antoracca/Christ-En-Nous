// navigation/MainNavigator.tsx - VERSION FINALE AVEC ANIMATIONS CORRECTES

import React, { useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, interpolate } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

// Import des écrans
import HomeScreen from '@/screens/home/HomeScreen';
import BibleScreen from '@/screens/bible/BibleScreen';
import PrayerScreen from '@/screens/prayer/PrayerScreen';
import CoursesScreen from '@/screens/courses/CoursesScreen';
import ProfileScreen from '@/screens/profile/ProfileScreen';

// Import du hook de thème
import { useAppTheme } from '@/hooks/useAppTheme';

// Types pour la navigation
export type MainTabParamList = {
  HomeTab: undefined;
  BibleTab: undefined;
  CoursesTab: undefined;
  PrayerTab: undefined;
  ProfileTab: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

// Composant CentralHomeButton avec animations correctes
const CentralHomeButton = ({ onPress, isFocused }: { onPress: () => void; isFocused: boolean }) => {
    const theme = useAppTheme();
    // ✅ CORRECT : utiliser shared.value
    const scaleAnim = useSharedValue(1);

    useEffect(() => {
        // ✅ CORRECT : shared.value au lieu de shared.current
        scaleAnim.value = withSpring(isFocused ? 1.05 : 1, { damping: 10, stiffness: 150 });
    }, [isFocused, scaleAnim]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scaleAnim.value }],
    }));

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress();
    };

    // Définition des couleurs de dégradé selon le thème
    const lightGradientColors = [theme.colors.primary, '#1E3A8A'] as const;
    const darkGradientColors = [theme.colors.primary, theme.custom.colors.background] as const;

    return (
        <TouchableOpacity onPress={handlePress} style={styles.centralButtonContainer} activeOpacity={1}>
            <Animated.View style={[styles.centralButton, animatedStyle]}>
                <LinearGradient
                    colors={theme.dark ? darkGradientColors : lightGradientColors}
                    style={[styles.centralButtonGradient]}
                >
                    <Image
                      source={require('../assets/images/christlg.png')}
                      style={{ width: 40, height: 40, resizeMode: 'contain' }}
                    />
                </LinearGradient>
            </Animated.View>
        </TouchableOpacity>
    );
};

// Composant AnimatedTab avec animations correctes
const AnimatedTab = ({ route, isFocused, navigation, iconName, iconType, label }: any) => {
  const theme = useAppTheme();
  // ✅ CORRECT : utiliser shared.value
  const progress = useSharedValue(isFocused ? 1 : 0);

  useEffect(() => {
    // ✅ CORRECT : shared.value au lieu de shared.current
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

  const onPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!isFocused) {
        // ✅ CORRECT : ne pas muter navigation directement
        navigation.navigate(route.name);
    }
  };

  // Couleurs visibles sur le fond dégradé
  const iconColor = isFocused ? theme.colors.onPrimary : 'rgba(255, 255, 255, 0.7)';

  const renderIcon = () => {
      if (iconType === 'fontawesome5') {
          return <FontAwesome5 name={iconName} size={24} color={iconColor} />;
      }
      return <Feather name={iconName} size={26} color={iconColor} />;
  }

  return (
    <TouchableOpacity onPress={onPress} style={styles.tabItem} activeOpacity={1}>
      <Animated.View style={[styles.tabItemInner, animatedContainerStyle]}>
        {renderIcon()}
        <Animated.Text style={[styles.tabLabel, { color: theme.colors.onPrimary }, animatedLabelStyle]}>
          {label}
        </Animated.Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

// Composant CustomTabBar
const CustomTabBar = ({ state, navigation }: any) => {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const tabConfig = [
    { name: 'BibleTab', icon: 'book-open', label: 'Bible', type: 'feather' },
    { name: 'CoursesTab', icon: 'award', label: 'Cours', type: 'feather' },
    { name: 'HomeTab', icon: 'grid', label: 'Accueil', type: 'feather' },
    { name: 'PrayerTab', icon: 'praying-hands', label: 'Prières', type: 'fontawesome5' },
    { name: 'ProfileTab', icon: 'user', label: 'Profil', type: 'feather' },
  ];
  const homeRouteIndex = state.routes.findIndex((r: any) => r.name === 'HomeTab');
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
            const config = tabConfig.find(t => t.name === route.name);

            if (route.name === 'HomeTab') {
              // On laisse un espace vide pour le bouton central
              return <View key={route.key} style={styles.centralButtonPlaceholder} />;
            }

            return (
              <AnimatedTab
                key={route.key}
                route={route}
                isFocused={isFocused}
                navigation={navigation}
                iconName={config?.icon}
                iconType={config?.type}
                label={config?.label}
              />
            );
          })}
        </View>
      </LinearGradient>

      {/* Bouton central au-dessus de la barre */}
      <CentralHomeButton
        onPress={() => navigation.navigate('HomeTab')}
        isFocused={state.index === homeRouteIndex}
      />
    </View>
  );
};

// Navigateur Principal
export default function MainNavigator() {
  const theme = useAppTheme();

  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={({ route }) => ({
        headerShown: route.name !== 'HomeTab',
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
      })}
    >
      <Tab.Screen
        name="BibleTab"
        component={BibleScreen}
        options={{ title: 'Sainte Bible', headerShown: false }}
      />
      <Tab.Screen
        name="CoursesTab"
        component={CoursesScreen}
        options={{ title: 'Cours' }}
      />
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{ title: 'Accueil' }}
      />
      <Tab.Screen
        name="PrayerTab"
        component={PrayerScreen}
        options={{ title: 'Prières' }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={({ navigation }) => ({
          title: 'Mon Profil',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate('HomeTab')}
              style={{ marginLeft: 15, padding: 5 }}
            >
              <Feather name="arrow-left" size={24} color={theme.custom.colors.text} />
            </TouchableOpacity>
          ),
        })}
      />
    </Tab.Navigator>
  );
}

// Styles
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

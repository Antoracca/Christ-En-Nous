// navigation/MainNavigator.tsx - VERSION FINALE CORRIGÉE

import { useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, Image } from 'react-native';
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
import ProfileScreen from '../app/screens/profile/ProfileScreen';

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

// Composant CentralHomeButton
const CentralHomeButton = ({ onPress, isFocused }: { onPress: () => void; isFocused: boolean }) => {
    const theme = useAppTheme();
    const scaleAnim = useSharedValue(1);

    useEffect(() => {
        // Animation de rebond subtile au focus
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
                    style={[styles.centralButtonGradient, animatedStyle]}
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
      

// Composant AnimatedTab
const AnimatedTab = ({ route, isFocused, navigation, iconName, iconType, label }: any) => {
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

  const onPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!isFocused) {
        navigation.navigate(route.name);
    }
  };

  // ✅ COULEURS CORRIGÉES : Visibles sur le fond dégradé
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
        {/* ✅ COULEUR DU LABEL CORRIGÉE */}
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
  const tabConfig = [
    { name: 'BibleTab', icon: 'book-open', label: 'Bible', type: 'feather' },
    { name: 'CoursesTab', icon: 'award', label: 'Cours', type: 'feather' },
    { name: 'HomeTab', icon: 'grid', label: 'Accueil', type: 'feather' },
    { name: 'PrayerTab', icon: 'praying-hands', label: 'Prières', type: 'fontawesome5' },
    { name: 'ProfileTab', icon: 'user', label: 'Profil', type: 'feather' },
  ];
  const homeRouteIndex = state.routes.findIndex((r: any) => r.name === 'HomeTab');


  return (
    <View style={styles.tabBarWrapper}>
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
      
      {/* On place le bouton au-dessus de la barre pour un centrage parfait */}
      <CentralHomeButton
        onPress={() => navigation.navigate('HomeTab')}
        isFocused={state.index === homeRouteIndex}
      />
    </View>
  );
};

// --- Navigateur Principal ---
export default function MainNavigator() {
  const theme = useAppTheme();

  return (
    <Tab.Navigator
      // ✅ CORRECTION IMPORTANTE : HomeTab est maintenant l'écran initial
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
      {/* ✅ ORDRE MODIFIÉ : HomeTab au milieu */}
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

// --- Styles ---
const styles = StyleSheet.create({
  tabBarWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 110 : 85,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 30 : 15,
    paddingHorizontal: 10,
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
    // Cet élément prend la place du bouton pour que les autres onglets s'alignent
    flex: 1.2,
  },
  centralButtonContainer: {
    // Positionnement absolu pour flotter au-dessus de la barre
    position: 'absolute',
    // ✅ CORRECTION : Centrage du conteneur lui-même au lieu de l'étirer
    alignSelf: 'center',
    // Positionnement vertical pour déborder en haut
    top: -15,
    zIndex: 10,
  },
  centralButton: {
    // ✅ Forme : Cercle parfait
    width: 68,
    height: 68,
    borderRadius: 34,
    // ✅ Ombre subtile et moderne
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    backgroundColor: 'white', // Ajout d'un fond pour l'ombre sur Android
  },
  centralButtonGradient: {
    flex: 1,
    borderRadius: 34, // Doit correspondre au parent
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3, // Ajoute une bordure pour un look premium
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
});
// navigation/MainNavigator.tsx - VERSION FINALE CORRIGÉE

import { useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, Image } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
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
    const opacityAnim = useSharedValue(1);

    useEffect(() => {
        scaleAnim.value = withSpring(isFocused ? 1.1 : 1, { damping: 10, stiffness: 120 });
        opacityAnim.value = withSpring(isFocused ? 1 : 0.9); // Opacité à 90% si non focus
    }, [isFocused, scaleAnim, opacityAnim]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scaleAnim.value }],
        opacity: opacityAnim.value,
    }));

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress();
    };

    return (
        <TouchableOpacity onPress={handlePress} style={styles.centralButtonContainer} activeOpacity={0.9}>
            <Animated.View style={[styles.centralButton, animatedStyle]}>
                <LinearGradient
                    colors={[theme.colors.primary, '#526fbdff']}
                    style={styles.centralButtonGradient}
                >
                    <Image 
                      source={require('../assets/images/christlg.png')} 
                      style={{ width: 55, height: 55, resizeMode: 'contain' }} 
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

  const iconColor = isFocused ? theme.colors.primary : theme.custom.colors.placeholder;

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
        <Animated.Text style={[styles.tabLabel, { color: theme.colors.primary }, animatedLabelStyle]}>
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

  return (
    <View style={styles.tabBarWrapper}>
      <BlurView
        intensity={Platform.OS === 'ios' ? 90 : 100}
        tint={theme.dark ? 'dark' : 'light'}
        style={styles.tabBarContainer}
      >
        <View style={styles.tabBarContent}>
          {state.routes.map((route: any) => {
            const isFocused = state.routes.findIndex((r: any) => r.key === route.key) === state.index;
            const config = tabConfig.find(t => t.name === route.name);

            if (route.name === 'HomeTab') {
              return (
                <CentralHomeButton
                  key={route.key}
                  onPress={() => navigation.navigate(route.name)}
                  isFocused={isFocused}
                />
              );
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
      </BlurView>
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
        options={{ title: 'Sainte Bible' }}
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
  centralButtonContainer: {
    flex: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -8,
  },
  centralButton: {
    width: 70,
    height: 50,
    borderRadius: 35,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  centralButtonGradient: {
    flex: 1,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
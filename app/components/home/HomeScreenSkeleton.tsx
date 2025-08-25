// app/components/home/HomeScreenSkeleton.tsx
// Squelette de chargement pour l'écran d'accueil.

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, StatusBar, Platform, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '@/hooks/useAppTheme';

const HEADER_MAX_HEIGHT = 280;

const HomeScreenSkeleton = () => {
  const theme = useAppTheme();
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animValue, { toValue: 1, duration: 800, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(animValue, { toValue: 0, duration: 800, useNativeDriver: true, easing: Easing.inOut(Easing.ease) })
      ])
    ).start();
  }, [animValue]);

  const opacity = animValue.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] });
  
  const AnimatedView = (props: any) => <Animated.View {...props} style={[props.style, { opacity }]} />;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar barStyle="light-content" />
      <View style={{ height: HEADER_MAX_HEIGHT }}>
        <LinearGradient
          colors={[theme.colors.primary, '#1E3A8A']}
          style={styles.headerCurve}
        >
          <View style={[styles.headerContentContainer, { paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 10 : 60 }]}>
            <View style={styles.headerTopRow}>
              <AnimatedView style={{ width: 54, height: 54, borderRadius: 27, backgroundColor: 'rgba(255,255,255,0.3)' }} />
              <View style={{ flexDirection: 'row' }}>
                <AnimatedView style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.3)', marginLeft: 8 }} />
                <AnimatedView style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.3)', marginLeft: 8 }} />
              </View>
            </View>
            <View style={styles.welcomeTextContainer}>
              <AnimatedView style={{ width: '60%', height: 30, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.3)', marginBottom: 10 }} />
              <AnimatedView style={{ width: '40%', height: 20, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.3)' }} />
            </View>
            <AnimatedView style={[styles.searchContainer, { backgroundColor: 'rgba(255,255,255,0.15)' }]} />
          </View>
        </LinearGradient>
      </View>
      <View style={styles.mainContentContainer}>
        <AnimatedView style={{ width: '40%', height: 25, borderRadius: 8, backgroundColor: theme.colors.surface, marginBottom: 15 }} />
        <View style={styles.quickActionsContainer}>
          <AnimatedView style={[styles.quickActionCard, { backgroundColor: theme.colors.surface }]} />
          <AnimatedView style={[styles.quickActionCard, { backgroundColor: theme.colors.surface }]} />
          <AnimatedView style={[styles.quickActionCard, { backgroundColor: theme.colors.surface }]} />
        </View>
      </View>
      <View style={styles.mainContentContainer}>
        <AnimatedView style={{ width: '60%', height: 25, borderRadius: 8, backgroundColor: theme.colors.surface, marginBottom: 15 }} />
        <AnimatedView style={[styles.contentCard, { backgroundColor: theme.colors.surface }]} />
        <AnimatedView style={[styles.contentCard, { backgroundColor: theme.colors.surface }]} />
      </View>
    </View>
  );
};

// Styles used by the skeleton, extracted from HomeScreen
const styles = StyleSheet.create({
    headerCurve: {
        flex: 1,
        borderBottomLeftRadius: 50,
        borderBottomRightRadius: 50,
        overflow: 'hidden',
    },
    headerContentContainer: {
        paddingHorizontal: 25,
        flex: 1,
        justifyContent: 'space-between',
        zIndex: 10,
    },
    headerTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    welcomeTextContainer: {
        marginTop: 10,
        marginBottom: 15,
        flex: 1,
        maxWidth: '100%',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        borderRadius: 15,
        height: 55,
        marginBottom: 20,
    },
    mainContentContainer: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    quickActionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15,
    },
    quickActionCard: {
        flex: 1,
        height: 120,
        borderRadius: 20,
        marginHorizontal: 5,
    },
    contentCard: {
        height: 90,
        borderRadius: 20,
        marginBottom: 15,
    },
});

export default HomeScreenSkeleton;

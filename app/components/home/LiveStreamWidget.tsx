import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Linking, Platform, UIManager, LayoutAnimation } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '@/hooks/useAppTheme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// État global du live (Simulé)
const IS_LIVE_NOW = false; // Mettre à true pour tester le mode "ON AIR"

const CHANNELS = [
  {
    id: 'facebook',
    name: 'Facebook',
    iconFamily: 'FontAwesome5',
    iconName: 'facebook',
    colors: ['#1877F2', '#1E40AF'], // Bleu Facebook
    offColors: ['#334155', '#1E293B'], // Gris ardoise (Offline)
    url: 'https://facebook.com',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    iconFamily: 'FontAwesome5',
    iconName: 'youtube',
    colors: ['#FF0000', '#991B1B'], // Rouge YouTube
    offColors: ['#334155', '#1E293B'],
    url: 'https://youtube.com',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    iconFamily: 'FontAwesome5', // TikTok est dispo dans FA5 Brands
    iconName: 'tiktok',
    colors: ['#000000', '#111827'], // Noir TikTok
    offColors: ['#334155', '#1E293B'],
    url: 'https://tiktok.com',
  }
];

export default function LiveStreamWidget() {
  const theme = useAppTheme();
  const [activeChannel, setActiveChannel] = useState(CHANNELS[0]); // Facebook par défaut
  
  // Animation Pulse (Seulement si Live)
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let pulse: Animated.CompositeAnimation | null = null;
    
    if (IS_LIVE_NOW) {
      pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 0.4, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      );
      pulse.start();
    } else {
      pulseAnim.setValue(1); // Fixe si pas de live
    }

    return () => pulse?.stop();
  }, []);

  const handleSwitchChannel = (channel: typeof CHANNELS[0]) => {
    Animated.timing(fadeAnim, { toValue: 0.5, duration: 100, useNativeDriver: true }).start(() => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setActiveChannel(channel);
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    });
  };

  const handlePressScreen = () => {
    if (IS_LIVE_NOW) {
      Linking.openURL(activeChannel.url).catch(err => console.error("Error", err));
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant }]}>
          En Direct
        </Text>
        
        {/* BADGE ON/OFF AIR */}
        <View style={[
          styles.liveBadge, 
          { backgroundColor: IS_LIVE_NOW ? '#FEE2E2' : theme.colors.surfaceVariant }
        ]}>
          <Animated.View style={[
            styles.dot, 
            { 
              backgroundColor: IS_LIVE_NOW ? '#DC2626' : theme.colors.outline,
              opacity: pulseAnim 
            }
          ]} />
          <Text style={[
            styles.liveText,
            { color: IS_LIVE_NOW ? '#DC2626' : theme.colors.outline }
          ]}>
            {IS_LIVE_NOW ? 'ON AIR' : 'OFF AIR'}
          </Text>
        </View>
      </View>

      {/* CONSOLE */}
      <View style={styles.consoleContainer}>
        
        {/* ÉCRAN PRINCIPAL */}
        <TouchableOpacity activeOpacity={IS_LIVE_NOW ? 0.9 : 1} onPress={handlePressScreen}>
          <Animated.View style={[styles.screenFrame, { opacity: fadeAnim }]}>
            <LinearGradient
              colors={IS_LIVE_NOW ? activeChannel.colors : activeChannel.offColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.screenGradient}
            >
              {/* Fond technique */}
              <MaterialCommunityIcons 
                name="access-point-network-off" 
                size={120} 
                color="rgba(255,255,255,0.03)" 
                style={styles.bgSignal} 
              />
              
              <View style={styles.screenContent}>
                {/* Haut de l'écran */}
                <View style={styles.screenTop}>
                  <View style={[styles.platformBadge, { backgroundColor: 'rgba(0,0,0,0.3)' }]}>
                    <FontAwesome5 name={activeChannel.iconName as any} size={14} color="white" />
                    <Text style={styles.platformName}>{activeChannel.name}</Text>
                  </View>
                </View>

                {/* Centre de l'écran (Message ou Player) */}
                <View style={styles.screenCenter}>
                  {IS_LIVE_NOW ? (
                    <>
                      <View style={styles.playButton}>
                        <FontAwesome5 name="play" size={24} color="white" style={{ marginLeft: 4 }} />
                      </View>
                      <Text style={styles.mainMsg}>Rejoindre le Direct</Text>
                    </>
                  ) : (
                    <>
                      <View style={styles.offlineIcon}>
                        <MaterialCommunityIcons name="broadcast-off" size={32} color="rgba(255,255,255,0.5)" />
                      </View>
                      <Text style={styles.mainMsg}>Aucun événement en direct</Text>
                      <Text style={styles.subMsg}>Les prochains lives s'afficheront ici.</Text>
                    </>
                  )}
                </View>
              </View>
            </LinearGradient>
          </Animated.View>
        </TouchableOpacity>

        {/* SWITCHER (Sélecteur de plateforme) */}
        <View style={[styles.switcher, { backgroundColor: theme.colors.surfaceVariant }]}>
          {CHANNELS.map((channel) => {
            const isActive = activeChannel.id === channel.id;
            return (
              <TouchableOpacity
                key={channel.id}
                style={[
                  styles.channelBtn,
                  isActive && { backgroundColor: theme.colors.surface, elevation: 2 }
                ]}
                onPress={() => handleSwitchChannel(channel)}
              >
                <FontAwesome5 
                  name={channel.iconName as any} 
                  size={18} 
                  color={isActive ? channel.colors[0] : theme.colors.onSurfaceVariant + '99'} // Opacité augmentée (~0.6)
                />
                {isActive && (
                  <Text style={[styles.activeLabel, { color: channel.colors[0] }]}>
                    {channel.name}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  liveText: {
    fontSize: 10,
    fontFamily: 'Nunito_800ExtraBold',
  },
  
  // CONSOLE
  consoleContainer: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  
  screenFrame: {
    height: 160,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  screenGradient: {
    flex: 1,
    padding: 20,
  },
  bgSignal: {
    position: 'absolute',
    right: -20,
    top: -20,
  },
  screenContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  screenTop: {
    flexDirection: 'row',
    justifyContent: 'flex-start', // Align left
  },
  platformBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 8,
  },
  platformName: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Nunito_700Bold',
  },
  
  // Centre
  screenCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -10, // Remonter un peu pour centrer visuellement
    gap: 8,
  },
  playButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  offlineIcon: {
    opacity: 0.8,
    marginBottom: 4,
  },
  mainMsg: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    textAlign: 'center',
  },
  subMsg: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontFamily: 'Nunito_600SemiBold',
    textAlign: 'center',
  },

  // SWITCHER
  switcher: {
    flexDirection: 'row',
    height: 60,
    padding: 6,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    gap: 6,
  },
  channelBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
    gap: 8,
  },
  activeLabel: {
    fontSize: 12,
    fontFamily: 'Nunito_800ExtraBold',
  },
});

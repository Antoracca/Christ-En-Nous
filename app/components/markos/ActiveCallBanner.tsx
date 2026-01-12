import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence } from 'react-native-reanimated';
import { ActiveCall } from '@/data/markosChatData';

export default function ActiveCallBanner({ call, onPress }: { call: ActiveCall; onPress: () => void }) {
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: 0.6,
  }));

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <LinearGradient
        colors={['#10B981', '#059669']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Animated.View style={[styles.pulseCircle, animatedStyle]} />
            <Ionicons name="mic" size={20} color="white" />
          </View>
          <View style={styles.info}>
            <Text style={styles.title}>{call.title}</Text>
            <Text style={styles.subtitle}>
              {call.participants.length} participants • {call.duration}
            </Text>
          </View>
        </View>
        
        <View style={styles.avatars}>
          {call.participants.slice(0, 3).map((p, i) => (
            <Image
              key={p.id}
              source={{ uri: p.avatar }}
              style={[styles.avatar, { marginLeft: i > 0 ? -10 : 0, zIndex: 3 - i }]}
              contentFit="cover"
            />
          ))}
          <View style={styles.joinBadge}>
             <Text style={styles.joinText}>Rejoindre</Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  pulseCircle: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 20,
    backgroundColor: 'white',
  },
  info: {
    flex: 1,
  },
  title: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 11,
    fontFamily: 'Nunito_600SemiBold',
  },
  avatars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#059669',
  },
  joinBadge: {
    backgroundColor: 'white',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  joinText: {
    color: '#059669',
    fontSize: 10,
    fontFamily: 'Nunito_700Bold',
  },
});

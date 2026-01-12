import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';

export default function BusinessStoryCircle({ story }: { story: any }) {
  return (
    <TouchableOpacity style={styles.container}>
      <LinearGradient
        colors={story.isLive ? ['#EC4899', '#8B5CF6'] : ['#E5E7EB', '#D1D5DB']}
        style={styles.borderGradient}
      >
        <View style={styles.whiteBorder}>
          <Image source={{ uri: story.sellerAvatar }} style={styles.avatar} contentFit="cover" />
        </View>
      </LinearGradient>
      {story.isLive && (
        <View style={styles.liveBadge}>
          <Text style={styles.liveText}>NOUVEAU</Text>
        </View>
      )}
      <Text style={styles.name} numberOfLines={1}>{story.sellerName}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: 80,
    marginRight: 15,
  },
  borderGradient: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  whiteBorder: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  name: {
    fontSize: 11,
    fontFamily: 'Nunito_600SemiBold',
    textAlign: 'center',
    color: '#1F2937',
  },
  liveBadge: {
    position: 'absolute',
    bottom: 20,
    backgroundColor: '#EC4899',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 10,
  },
  liveText: {
    color: 'white',
    fontSize: 8,
    fontFamily: 'Nunito_800ExtraBold',
  },
});

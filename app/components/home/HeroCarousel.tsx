import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  ImageBackground,
  TouchableOpacity,
  Animated
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '../../hooks/useAppTheme';
import { HOME_DATA, type HomeBanner } from '../../data/homeData';

const { width } = Dimensions.get('window');
const CAROUSEL_HEIGHT = 280;

export default function HeroCarousel() {
  const theme = useAppTheme();
  const [activeIndex, setActiveTab] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

  const renderItem = ({ item }: { item: HomeBanner }) => (
    <View style={styles.cardContainer}>
      <ImageBackground source={{ uri: item.image }} style={styles.image} imageStyle={{ borderRadius: 24 }}>
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.gradient}
        >
          <View style={styles.content}>
            <View style={[styles.badge, { backgroundColor: item.color }]}>
              <Text style={styles.badgeText}>À LA UNE</Text>
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
            
            <TouchableOpacity style={styles.actionBtn}>
              <Text style={styles.actionText}>{item.actionLabel}</Text>
              <Feather name="arrow-right" size={16} color="white" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </ImageBackground>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={HOME_DATA.banners}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(ev) => {
          setActiveTab(Math.round(ev.nativeEvent.contentOffset.x / width));
        }}
      />
      
      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {HOME_DATA.banners.map((_, i) => (
          <View 
            key={i} 
            style={[
              styles.dot, 
              { backgroundColor: i === activeIndex ? theme.colors.primary : 'rgba(255,255,255,0.3)' }
            ]} 
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: CAROUSEL_HEIGHT,
    marginTop: 10,
  },
  cardContainer: {
    width: width,
    paddingHorizontal: 20,
    height: '100%',
  },
  image: {
    flex: 1,
    overflow: 'hidden',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: 24,
    borderRadius: 24,
  },
  content: {
    gap: 8,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontFamily: 'Nunito_800ExtraBold',
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontFamily: 'Nunito_800ExtraBold',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontFamily: 'Nunito_600SemiBold',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  actionText: {
    color: 'white',
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  pagination: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 40,
    right: 40,
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  }
});

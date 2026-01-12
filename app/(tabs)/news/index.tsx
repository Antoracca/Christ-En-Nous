import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StatusBar,
  Alert,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@/hooks/useAppTheme';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { NEWS_DATA, NewsItem } from '@/data/newsData';
import Animated, { useSharedValue, useAnimatedStyle, interpolate, useAnimatedScrollHandler } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');
const HEADER_HEIGHT = 350;

export default function NewsScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const scrollY = useSharedValue(0);
  const [activeTab, setActiveTab] = useState<'news' | 'announcements'>('news');
  const [likedItems, setLikedItems] = useState<string[]>([]);

  // Filtrage intelligent
  const isAnnouncement = (category: string) => ['Urgent', 'Église', 'Convocation', 'Inscription'].includes(category);
  
  const filteredData = NEWS_DATA.filter(item => 
    activeTab === 'announcements' ? isAnnouncement(item.category) : !isAnnouncement(item.category)
  );

  const featuredItem = filteredData.find(n => n.isFeatured) || filteredData[0];
  const listItems = filteredData.filter(n => n.id !== featuredItem?.id);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const handleAdminAction = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    Alert.alert(
      "Accès Restreint",
      "Désolé, cette fonctionnalité est réservée à l'administration de la communauté.",
      [{ text: "Compris" }]
    );
  };

  const toggleLike = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (likedItems.includes(id)) {
      setLikedItems(prev => prev.filter(item => item !== id));
    } else {
      setLikedItems(prev => [...prev, id]);
    }
  };

  // Animations pour le Hero
  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      height: interpolate(scrollY.value, [-100, 0], [HEADER_HEIGHT + 100, HEADER_HEIGHT], 'clamp'),
      transform: [
        { scale: interpolate(scrollY.value, [-100, 0], [1.2, 1], 'clamp') },
        { translateY: interpolate(scrollY.value, [-100, 0], [-50, 0], 'clamp') }
      ],
    };
  });

  const NewsRow = ({ item, index }: { item: NewsItem; index: number }) => {
    const isLiked = likedItems.includes(item.id);
    return (
      <TouchableOpacity style={styles.newsRow} activeOpacity={0.7} onPress={() => {}}>
        <View style={styles.dateColumn}>
          <Text style={[styles.dateDay, { color: theme.colors.onSurface }]}>{item.date.split(' ')[0]}</Text>
          <Text style={[styles.dateMonth, { color: theme.colors.onSurfaceVariant }]}>{item.date.split(' ').slice(1).join(' ')}</Text>
          <View style={[styles.timelineLine, { backgroundColor: theme.colors.outline + '20' }]} />
        </View>
        
        <View style={styles.newsContent}>
          <View style={styles.newsHeader}>
            <View style={[
              styles.categoryBadge, 
              { backgroundColor: isAnnouncement(item.category) ? '#FEE2E2' : '#E0F2FE' }
            ]}>
              <Text style={[
                styles.categoryText, 
                { color: isAnnouncement(item.category) ? '#EF4444' : '#0284C7' }
              ]}>{item.category.toUpperCase()}</Text>
            </View>
            <Text style={[styles.readTime, { color: theme.colors.outline }]}>• {item.readTime}</Text>
          </View>
          
          <Text style={[styles.newsTitle, { color: theme.colors.onSurface }]}>{item.title}</Text>
          <Text style={[styles.newsExcerpt, { color: theme.colors.onSurfaceVariant }]} numberOfLines={2}>
            {item.excerpt}
          </Text>
          
          {/* Actions Row */}
          <View style={styles.actionsRow}>
            <View style={styles.authorRow}>
              <Image source={{ uri: item.author.avatar }} style={styles.authorAvatar} />
              <Text style={[styles.authorName, { color: theme.colors.onSurfaceVariant }]}>{item.author.name}</Text>
            </View>
            
            <View style={styles.reactions}>
              <TouchableOpacity onPress={() => toggleLike(item.id)} style={styles.reactionBtn}>
                <Ionicons name={isLiked ? "heart" : "heart-outline"} size={18} color={isLiked ? "#EF4444" : theme.colors.onSurfaceVariant} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.reactionBtn}>
                <Ionicons name="share-social-outline" size={18} color={theme.colors.onSurfaceVariant} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <Image source={{ uri: item.image }} style={styles.newsThumbnail} contentFit="cover" />
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="light-content" />

      {/* Hero Background (Fixed) */}
      <Animated.View style={[styles.heroBackground, headerAnimatedStyle]}>
        {featuredItem && (
          <Image source={{ uri: featuredItem.image }} style={styles.heroImage} contentFit="cover" />
        )}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.9)']}
          style={styles.heroGradient}
        />
      </Animated.View>

      {/* Fixed Navigation Header */}
      <SafeAreaView style={styles.navHeader}>
        <View style={styles.navTopRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
            <BlurView intensity={30} tint="dark" style={styles.blurIcon}>
              <Feather name="arrow-left" size={24} color="white" />
            </BlurView>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleAdminAction} style={styles.publishButton}>
            <BlurView intensity={30} tint="dark" style={styles.blurButton}>
              <Feather name="edit-3" size={16} color="white" />
              <Text style={styles.publishText}>Publier</Text>
            </BlurView>
          </TouchableOpacity>
        </View>

        {/* Segmented Control (Tabs) */}
        <View style={styles.tabsWrapper}>
          <BlurView intensity={30} tint="dark" style={styles.tabsContainer}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'news' && styles.activeTab]} 
              onPress={() => setActiveTab('news')}
            >
              <Text style={[styles.tabText, activeTab === 'news' ? { color: '#1F2937' } : { color: 'white' }]}>Actualités</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'announcements' && styles.activeTab]} 
              onPress={() => setActiveTab('announcements')}
            >
              <Text style={[styles.tabText, activeTab === 'announcements' ? { color: '#1F2937' } : { color: 'white' }]}>Annonces</Text>
            </TouchableOpacity>
          </BlurView>
        </View>
      </SafeAreaView>

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Espacement pour le Hero */}
        <View style={{ height: HEADER_HEIGHT - 100 }} />

        {/* Featured News Content */}
        {featuredItem && (
          <View style={styles.featuredContent}>
            <View style={[styles.tagContainer, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.tagText}>À LA UNE</Text>
            </View>
            <Text style={styles.featuredTitle}>{featuredItem.title}</Text>
            <Text style={styles.featuredExcerpt}>{featuredItem.excerpt}</Text>
          </View>
        )}

        {/* List Content */}
        <View style={[styles.listContainer, { backgroundColor: theme.colors.background }]}>
          <View style={styles.listHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              {activeTab === 'news' ? 'Dernières Actualités' : 'Annonces Officielles'}
            </Text>
            <TouchableOpacity onPress={() => setActiveTab(activeTab === 'news' ? 'announcements' : 'news')}>
               <Text style={{ color: theme.colors.primary, fontFamily: 'Nunito_700Bold', fontSize: 12 }}>Tout voir</Text>
            </TouchableOpacity>
          </View>

          {listItems.length > 0 ? (
            listItems.map((item, index) => (
              <NewsRow key={item.id} item={item} index={index} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Feather name="info" size={40} color={theme.colors.outline} />
              <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>Aucun contenu pour le moment</Text>
            </View>
          )}

          <View style={{ height: 100 }} />
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  
  heroBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 0,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '80%',
  },

  navHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 10,
  },
  navTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  iconButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  blurIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  publishButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  blurButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 40,
    gap: 8,
  },
  publishText: {
    color: 'white',
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
  },

  tabsWrapper: {
    alignItems: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderRadius: 25,
    padding: 4,
    overflow: 'hidden',
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: 'white',
  },
  tabText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
  },

  scrollContent: {
    paddingBottom: 0,
  },

  featuredContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  tagContainer: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 12,
  },
  tagText: {
    color: 'white',
    fontSize: 10,
    fontFamily: 'Nunito_800ExtraBold',
    letterSpacing: 1,
  },
  featuredTitle: {
    color: 'white',
    fontSize: 32,
    fontFamily: 'Nunito_800ExtraBold',
    lineHeight: 38,
    marginBottom: 12,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  featuredExcerpt: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    fontFamily: 'Nunito_600SemiBold',
    lineHeight: 24,
  },

  listContainer: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -20,
    paddingTop: 30,
    paddingHorizontal: 20,
    minHeight: height,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Nunito_800ExtraBold',
    letterSpacing: 0.5,
  },

  newsRow: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  dateColumn: {
    width: 60,
    alignItems: 'center',
    marginRight: 15,
  },
  dateDay: {
    fontSize: 16,
    fontFamily: 'Nunito_800ExtraBold',
  },
  dateMonth: {
    fontSize: 12,
    fontFamily: 'Nunito_600SemiBold',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  timelineLine: {
    width: 1,
    flex: 1,
    borderRadius: 1,
  },
  newsContent: {
    flex: 1,
    marginRight: 10,
  },
  newsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: 9,
    fontFamily: 'Nunito_800ExtraBold',
    letterSpacing: 0.5,
  },
  readTime: {
    fontSize: 10,
    fontFamily: 'Nunito_600SemiBold',
    marginLeft: 6,
  },
  newsTitle: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    marginBottom: 6,
    lineHeight: 22,
  },
  newsExcerpt: {
    fontSize: 13,
    fontFamily: 'Nunito_400Regular',
    marginBottom: 10,
    lineHeight: 18,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  authorAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  authorName: {
    fontSize: 11,
    fontFamily: 'Nunito_600SemiBold',
  },
  reactions: {
    flexDirection: 'row',
    gap: 12,
  },
  reactionBtn: {
    padding: 4,
  },
  newsThumbnail: {
    width: 80,
    height: 100,
    borderRadius: 12,
  },
  
  emptyState: {
    alignItems: 'center',
    marginTop: 40,
    gap: 10,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Nunito_600SemiBold',
  },
});

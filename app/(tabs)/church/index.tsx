import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StatusBar,
  ImageBackground,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { Feather, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@/hooks/useAppTheme';
import { LinearGradient } from 'expo-linear-gradient';
import { CHURCH_INFO, LEADERS, WEEKLY_PROGRAM, DEPARTMENTS, Leader, Department, WeeklyEvent } from '@/data/churchData';
import Animated, { useSharedValue, useAnimatedStyle, interpolate, useAnimatedScrollHandler } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');
const HEADER_HEIGHT = 300;

export default function ChurchScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      height: interpolate(scrollY.value, [-100, 0], [HEADER_HEIGHT + 100, HEADER_HEIGHT], 'clamp'),
      transform: [
        { translateY: interpolate(scrollY.value, [-100, 0], [-50, 0], 'clamp') }
      ],
    };
  });

  const titleOpacity = useAnimatedStyle(() => {
    return {
      opacity: interpolate(scrollY.value, [0, 200], [1, 0], 'clamp'),
      transform: [
        { translateY: interpolate(scrollY.value, [0, 200], [0, -50], 'clamp') }
      ]
    };
  });

  // Composant Carte Leader
  const LeaderCard = ({ leader }: { leader: Leader }) => (
    <View style={[styles.leaderCard, { backgroundColor: theme.colors.surface }]}>
      <Image source={{ uri: leader.image }} style={styles.leaderImage} contentFit="cover" />
      <View style={styles.leaderInfo}>
        <Text style={[styles.leaderName, { color: theme.colors.onSurface }]}>{leader.name}</Text>
        <Text style={[styles.leaderRole, { color: theme.colors.primary }]}>{leader.role}</Text>
        <Text style={[styles.leaderBio, { color: theme.colors.onSurfaceVariant }]} numberOfLines={3}>
          {leader.bio}
        </Text>
      </View>
    </View>
  );

  // Composant Carte Département
  const DepartmentCard = ({ dept }: { dept: Department }) => (
    <View style={[styles.deptCard, { backgroundColor: theme.colors.surface }]}>
      <View style={[styles.deptIconCircle, { backgroundColor: dept.color + '15' }]}>
        <Feather name={dept.icon as any} size={24} color={dept.color} />
      </View>
      <View style={styles.deptContent}>
        <Text style={[styles.deptName, { color: theme.colors.onSurface }]}>{dept.name}</Text>
        <Text style={[styles.deptTime, { color: theme.colors.outline }]}>
          <Feather name="clock" size={12} /> {dept.meetingTime}
        </Text>
        <Text style={[styles.deptDesc, { color: theme.colors.onSurfaceVariant }]} numberOfLines={2}>
          {dept.description}
        </Text>
      </View>
    </View>
  );

  // Composant Jour Programme
  const ProgramDay = ({ day }: { day: WeeklyEvent }) => (
    <View style={styles.dayContainer}>
      <View style={styles.dayHeader}>
        <View style={[styles.dayBadge, { backgroundColor: theme.colors.primary }]}>
          <Text style={styles.dayText}>{day.day.substring(0, 3).toUpperCase()}</Text>
        </View>
        <View style={[styles.dayLine, { backgroundColor: theme.colors.outline + '20' }]} />
      </View>
      <View style={styles.eventsList}>
        {day.events.map((evt, idx) => (
          <View key={idx} style={[styles.eventItem, { backgroundColor: theme.colors.surface }]}>
            <View style={[styles.eventTypeBar, { backgroundColor: theme.colors.primary }]} />
            <View style={styles.eventContent}>
              <Text style={[styles.eventTime, { color: theme.colors.primary }]}>{evt.time}</Text>
              <Text style={[styles.eventTitle, { color: theme.colors.onSurface }]}>{evt.title}</Text>
              <Text style={[styles.eventLocation, { color: theme.colors.onSurfaceVariant }]}>
                <Feather name="map-pin" size={12} /> {evt.location}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="light-content" />

      {/* Parallax Header */}
      <Animated.View style={[styles.heroHeader, headerAnimatedStyle]}>
        <Image source={{ uri: CHURCH_INFO.mainImage }} style={styles.heroImage} contentFit="cover" />
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
          style={styles.heroGradient}
        />
        <Animated.View style={[styles.heroContent, titleOpacity]}>
          <View style={styles.churchLogo}>
            <Image source={require('../../../assets/images/christlg.png')} style={{ width: 60, height: 60 }} contentFit="contain" />
          </View>
          <Text style={styles.churchName}>{CHURCH_INFO.name.toUpperCase()}</Text>
          <Text style={styles.churchSlogan}>{CHURCH_INFO.slogan}</Text>
        </Animated.View>
      </Animated.View>

      {/* Navigation Bar (Fixed Top) */}
      <SafeAreaView style={styles.navBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <BlurView intensity={30} tint="dark" style={styles.blurBtn}>
            <Feather name="arrow-left" size={24} color="white" />
          </BlurView>
        </TouchableOpacity>
        <TouchableOpacity style={styles.infoButton}>
          <BlurView intensity={30} tint="dark" style={styles.blurBtn}>
            <Feather name="info" size={24} color="white" />
          </BlurView>
        </TouchableOpacity>
      </SafeAreaView>

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={{ height: HEADER_HEIGHT - 30 }} />

        {/* Content Body */}
        <View style={[styles.bodyContainer, { backgroundColor: theme.colors.background }]}>
          
          {/* Quick Actions Grid */}
          <View style={styles.gridMenu}>
            <TouchableOpacity style={[styles.gridItem, { backgroundColor: theme.colors.surface }]}>
              <MaterialCommunityIcons name="church" size={28} color="#4F46E5" />
              <Text style={[styles.gridLabel, { color: theme.colors.onSurface }]}>Vision</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.gridItem, { backgroundColor: theme.colors.surface }]}>
              <MaterialCommunityIcons name="account-tie" size={28} color="#10B981" />
              <Text style={[styles.gridLabel, { color: theme.colors.onSurface }]}>Pasteurs</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.gridItem, { backgroundColor: theme.colors.surface }]}>
              <MaterialCommunityIcons name="calendar-clock" size={28} color="#F59E0B" />
              <Text style={[styles.gridLabel, { color: theme.colors.onSurface }]}>Agenda</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.gridItem, { backgroundColor: theme.colors.surface }]}>
              <MaterialCommunityIcons name="account-group" size={28} color="#EC4899" />
              <Text style={[styles.gridLabel, { color: theme.colors.onSurface }]}>Groupes</Text>
            </TouchableOpacity>
          </View>

          {/* Vision Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Notre Vision</Text>
            <View style={[styles.visionCard, { backgroundColor: theme.colors.primary + '10' }]}>
              <Text style={[styles.visionText, { color: theme.colors.primary }]}>
                "{CHURCH_INFO.vision}"
              </Text>
              <View style={styles.missionList}>
                <Text style={[styles.missionItem, { color: theme.colors.onSurfaceVariant }]}>• Évangéliser</Text>
                <Text style={[styles.missionItem, { color: theme.colors.onSurfaceVariant }]}>• Édifier</Text>
                <Text style={[styles.missionItem, { color: theme.colors.onSurfaceVariant }]}>• Équiper</Text>
                <Text style={[styles.missionItem, { color: theme.colors.onSurfaceVariant }]}>• Envoyer</Text>
              </View>
            </View>
          </View>

          {/* Leadership Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Nos Leaders</Text>
              <TouchableOpacity>
                <Text style={{ color: theme.colors.primary, fontFamily: 'Nunito_700Bold' }}>Voir tout</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
              {LEADERS.map((leader) => (
                <LeaderCard key={leader.id} leader={leader} />
              ))}
            </ScrollView>
          </View>

          {/* Weekly Program */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Programme Hebdomadaire</Text>
            <View style={styles.programContainer}>
              {WEEKLY_PROGRAM.map((day) => (
                <ProgramDay key={day.id} day={day} />
              ))}
            </View>
          </View>

          {/* Departments */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Départements</Text>
            <View style={styles.deptGrid}>
              {DEPARTMENTS.map((dept) => (
                <DepartmentCard key={dept.id} dept={dept} />
              ))}
            </View>
          </View>

          {/* Contact / Map Placeholder */}
          <View style={[styles.contactCard, { backgroundColor: '#1F2937' }]}>
            <Text style={styles.contactTitle}>Nous Rendre Visite</Text>
            <View style={styles.contactRow}>
              <Feather name="map-pin" size={18} color="#9CA3AF" />
              <Text style={styles.contactText}>{CHURCH_INFO.address}</Text>
            </View>
            <View style={styles.contactRow}>
              <Feather name="phone" size={18} color="#9CA3AF" />
              <Text style={styles.contactText}>{CHURCH_INFO.phone}</Text>
            </View>
            <View style={styles.contactRow}>
              <Feather name="mail" size={18} color="#9CA3AF" />
              <Text style={styles.contactText}>{CHURCH_INFO.email}</Text>
            </View>
            <TouchableOpacity style={styles.mapButton}>
              <Text style={styles.mapButtonText}>Ouvrir dans Maps</Text>
              <Feather name="external-link" size={16} color="#1F2937" />
            </TouchableOpacity>
          </View>

          <View style={{ height: 50 }} />
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  
  heroHeader: {
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
    ...StyleSheet.absoluteFillObject,
  },
  heroContent: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  churchLogo: {
    marginBottom: 10,
    shadowColor: 'black',
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  churchName: {
    color: 'white',
    fontSize: 28,
    fontFamily: 'Nunito_800ExtraBold',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 1,
  },
  churchSlogan: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontFamily: 'Nunito_600SemiBold',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },

  navBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 10,
  },
  blurBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  backButton: {},
  infoButton: {},

  scrollContent: {
    paddingBottom: 0,
  },
  bodyContainer: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 30,
    minHeight: height - HEADER_HEIGHT + 30,
  },

  gridMenu: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  gridItem: {
    width: (width - 40 - 30) / 4,
    aspectRatio: 1,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    gap: 4,
  },
  gridLabel: {
    fontSize: 10,
    fontFamily: 'Nunito_700Bold',
  },

  section: {
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Nunito_800ExtraBold',
    marginBottom: 15,
  },

  visionCard: {
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4F46E5', // Primary
  },
  visionText: {
    fontSize: 15,
    fontFamily: 'Nunito_700Bold',
    fontStyle: 'italic',
    marginBottom: 15,
    lineHeight: 22,
  },
  missionList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  missionItem: {
    fontSize: 12,
    fontFamily: 'Nunito_600SemiBold',
  },

  horizontalList: {
    paddingRight: 20,
  },
  leaderCard: {
    width: 220,
    borderRadius: 16,
    marginRight: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  leaderImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#E5E7EB',
  },
  leaderInfo: {
    padding: 16,
  },
  leaderName: {
    fontSize: 16,
    fontFamily: 'Nunito_800ExtraBold',
    marginBottom: 2,
  },
  leaderRole: {
    fontSize: 12,
    fontFamily: 'Nunito_700Bold',
    marginBottom: 8,
  },
  leaderBio: {
    fontSize: 12,
    fontFamily: 'Nunito_400Regular',
    lineHeight: 16,
  },

  programContainer: {
    gap: 20,
  },
  dayContainer: {
    flexDirection: 'row',
  },
  dayHeader: {
    width: 50,
    alignItems: 'center',
  },
  dayBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  dayText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Nunito_800ExtraBold',
  },
  dayLine: {
    width: 2,
    flex: 1,
    marginTop: -5,
  },
  eventsList: {
    flex: 1,
    paddingLeft: 15,
    gap: 10,
    paddingBottom: 20,
  },
  eventItem: {
    flexDirection: 'row',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  eventTypeBar: {
    width: 4,
  },
  eventContent: {
    flex: 1,
    padding: 12,
  },
  eventTime: {
    fontSize: 12,
    fontFamily: 'Nunito_700Bold',
    marginBottom: 2,
  },
  eventTitle: {
    fontSize: 15,
    fontFamily: 'Nunito_800ExtraBold',
    marginBottom: 2,
  },
  eventLocation: {
    fontSize: 12,
    fontFamily: 'Nunito_500Medium',
  },

  deptGrid: {
    gap: 15,
  },
  deptCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    gap: 15,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  deptIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deptContent: {
    flex: 1,
  },
  deptName: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    marginBottom: 4,
  },
  deptTime: {
    fontSize: 12,
    fontFamily: 'Nunito_600SemiBold',
    marginBottom: 4,
  },
  deptDesc: {
    fontSize: 12,
    fontFamily: 'Nunito_400Regular',
  },

  contactCard: {
    margin: 20,
    padding: 24,
    borderRadius: 20,
  },
  contactTitle: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'Nunito_800ExtraBold',
    marginBottom: 20,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  contactText: {
    color: '#D1D5DB',
    fontSize: 14,
    fontFamily: 'Nunito_600SemiBold',
  },
  mapButton: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
    gap: 8,
  },
  mapButtonText: {
    color: '#1F2937',
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
  },
});

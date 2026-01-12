import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Image,
  FlatList,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@/hooks/useAppTheme';
import {
  MARKOS_ACADEMY,
  MARKOS_EVENTS,
  MARKOS_MARKET,
  MarkosEvent,
} from '@/data/markosData';
import { AVAILABLE_QUIZZES } from '@/data/quizData';

// Composants
import SectionHeader from '../../components/markos/SectionHeader';
import LiveQuizCard from '../../components/markos/LiveQuizCard';
import EventCard from '../../components/markos/EventCard';
import MenuGridItem from '../../components/markos/MenuGridItem';
import EventDetailsModal from '../../components/markos/EventDetailsModal';
import TopToast from '../../components/markos/TopToast';

const { width } = Dimensions.get('window');

export default function MarkosScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  
  const [selectedEvent, setSelectedEvent] = useState<MarkosEvent | null>(null);
  const [eventModalVisible, setEventModalVisible] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);

  // Utiliser la source de vérité des Quiz
  const liveQuiz = AVAILABLE_QUIZZES.find(q => q.status === 'live');

  const handleEventPress = (event: MarkosEvent) => {
    setSelectedEvent(event);
    setEventModalVisible(true);
  };

  const handleParticipate = () => {
    setEventModalVisible(false);
    // Petit délai pour l'animation
    setTimeout(() => {
      setToastVisible(true);
    }, 300);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Toast Notification */}
      <TopToast 
        visible={toastVisible} 
        message="Vous avez confirmé votre participation. L'hôte sera informé et vous recevrez un mail. Shalom."
        onHide={() => setToastVisible(false)}
      />

      {/* Header personnalisé */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.push('/(tabs)')} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color={theme.colors.onSurface} />
          </TouchableOpacity>
          <Image 
            source={require('../../../public/assets/markos.png')}
            style={{ width: 180, height: 60, marginLeft: -20, resizeMode: 'contain' }}
          />
        </View>
        <View style={styles.headerRight}>
           <TouchableOpacity style={[styles.xpBadge, { backgroundColor: theme.colors.surfaceVariant }]}>
            <MaterialCommunityIcons name="lightning-bolt" size={16} color="#F59E0B" />
            <Text style={[styles.xpText, { color: theme.colors.onSurface }]}>1250 XP</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.iconButton, { backgroundColor: theme.colors.surfaceVariant }]}
            onPress={() => router.push('/(tabs)/markos/conversations')}
          >
             <Feather name="message-circle" size={20} color={theme.colors.onSurface} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Section de Bienvenue / Status */}
        <View style={styles.welcomeSection}>
           <Text style={[styles.welcomeText, { color: theme.colors.onSurface }]}>
             Salut, <Text style={{ color: theme.colors.primary }}>Champion !</Text>
           </Text>
           <Text style={[styles.welcomeSubtext, { color: theme.colors.onSurfaceVariant }]}>
             Prêt pour les défis de la semaine ?
           </Text>
        </View>

        {/* Live Quiz Banner */}
        {liveQuiz && (
          <View style={styles.section}>
            <LiveQuizCard 
              quiz={liveQuiz} 
              onPress={() => router.push(`/(tabs)/markos/games/quiz/${liveQuiz.id}`)}
            />
          </View>
        )}

        {/* Quick Access Grid */}
        <View style={styles.gridContainer}>
          <MenuGridItem 
            title="Markos Chat" 
            subtitle="Communauté" 
            icon="chat-processing-outline" 
            color="#EC4899" 
            onPress={() => router.push('/(tabs)/markos/conversations')}
          />
          <MenuGridItem 
            title="Academy" 
            subtitle="Entraide" 
            icon="school-outline" 
            color="#3B82F6" 
            onPress={() => router.push('/(tabs)/markos/academy')}
          />
          <MenuGridItem 
            title="Business" 
            subtitle="Marketplace" 
            icon="storefront-outline" 
            color="#10B981" 
            onPress={() => router.push('/(tabs)/markos/business')}
          />
          <MenuGridItem 
            title="Jeux & Quiz" 
            subtitle="Gagne des XP" 
            icon="gamepad-variant-outline" 
            color="#F59E0B" 
            onPress={() => router.push('/(tabs)/markos/games')}
          />
        </View>

        {/* Upcoming Events Horizontal Scroll */}
        <View style={styles.section}>
          <SectionHeader 
            title="Prochaines Activités" 
            icon="calendar" 
            color="#8B5CF6" 
            onSeeAll={() => router.push('/(tabs)/markos/events')} 
          />
          <FlatList
            data={MARKOS_EVENTS}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <EventCard 
                event={item} 
                onPress={() => handleEventPress(item)}
              />
            )}
          />
        </View>

        {/* Markos Academy Preview */}
        <View style={styles.section}>
           <SectionHeader 
            title="Markos Academy" 
            icon="book-open" 
            color="#3B82F6" 
            onSeeAll={() => router.push('/(tabs)/markos/academy')} 
          />
          {MARKOS_ACADEMY.map((request) => (
            <View key={request.id} style={[styles.academyCard, { backgroundColor: theme.colors.surface }]}>
               <View style={styles.academyHeader}>
                 <View style={[styles.academyTag, { backgroundColor: request.type === 'demande' ? '#FEE2E2' : '#D1FAE5' }]}>
                   <Text style={[styles.academyTagText, { color: request.type === 'demande' ? '#EF4444' : '#10B981' }]}>
                     {request.type === 'demande' ? 'DEMANDE AIDE' : 'PROPOSE AIDE'}
                   </Text>
                 </View>
                 <Text style={[styles.academyLevel, { color: theme.colors.onSurfaceVariant }]}>{request.level}</Text>
               </View>
               <Text style={[styles.academySubject, { color: theme.colors.onSurface }]}>{request.subject}</Text>
               <Text style={[styles.academyDesc, { color: theme.colors.onSurfaceVariant }]}>{request.description}</Text>
               <View style={styles.academyFooter}>
                 <View style={styles.userInfo}>
                   <View style={styles.userAvatarPlaceholder}>
                      <Text style={styles.userAvatarText}>{request.studentName.charAt(0)}</Text>
                   </View>
                   <Text style={[styles.userName, { color: theme.colors.onSurface }]}>{request.studentName}</Text>
                 </View>
                 <TouchableOpacity style={styles.contactButton}>
                   <Text style={styles.contactButtonText}>Contacter</Text>
                 </TouchableOpacity>
               </View>
            </View>
          ))}
        </View>

        {/* Markos Business Preview */}
        <View style={styles.section}>
           <SectionHeader 
            title="Markos Business" 
            icon="shopping" 
            color="#10B981" 
            onSeeAll={() => router.push('/(tabs)/markos/business')} 
          />
          {MARKOS_MARKET.map((item) => (
             <View key={item.id} style={[styles.marketCard, { backgroundColor: theme.colors.surface }]}>
                <Image source={{ uri: item.image }} style={styles.marketImage} />
                <View style={styles.marketContent}>
                   <Text style={[styles.marketTitle, { color: theme.colors.onSurface }]}>{item.title}</Text>
                   <Text style={[styles.marketPrice, { color: theme.colors.primary }]}>
                     {item.price > 0 ? `${item.price} ${item.currency}` : item.currency}
                   </Text>
                   <View style={styles.marketSeller}>
                      <Feather name="user" size={12} color={theme.colors.onSurfaceVariant} />
                      <Text style={[styles.marketSellerName, { color: theme.colors.onSurfaceVariant }]}>
                        {item.sellerName}
                      </Text>
                   </View>
                </View>
                <TouchableOpacity style={[styles.whatsappButton, { backgroundColor: '#25D366' }]}>
                  <MaterialCommunityIcons name="whatsapp" size={20} color="white" />
                </TouchableOpacity>
             </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Event Details Modal */}
      <EventDetailsModal 
        visible={eventModalVisible}
        event={selectedEvent}
        onClose={() => setEventModalVisible(false)}
        onParticipate={handleParticipate}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    padding: 4,
    marginRight: 4,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  xpText: {
    fontSize: 12,
    fontFamily: 'Nunito_700Bold',
  },
  scrollContent: {
    paddingTop: 10,
  },
  welcomeSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 22,
    fontFamily: 'Nunito_700Bold',
  },
  welcomeSubtext: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
  },
  section: {
    marginBottom: 25,
  },
  // Grid Menu
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 25,
  },
  // Events
  horizontalList: {
    paddingHorizontal: 20,
    gap: 15,
  },
  // Academy & Market cards
  academyCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  academyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  academyTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  academyTagText: {
    fontSize: 10,
    fontFamily: 'Nunito_700Bold',
  },
  academyLevel: {
    fontSize: 12,
    fontFamily: 'Nunito_600SemiBold',
  },
  academySubject: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    marginBottom: 4,
  },
  academyDesc: {
    fontSize: 13,
    fontFamily: 'Nunito_400Regular',
    marginBottom: 12,
    lineHeight: 18,
  },
  academyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userAvatarPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    fontSize: 10,
    fontFamily: 'Nunito_700Bold',
    color: '#6B7280',
  },
  userName: {
    fontSize: 12,
    fontFamily: 'Nunito_600SemiBold',
  },
  contactButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  contactButtonText: {
    fontSize: 11,
    fontFamily: 'Nunito_700Bold',
    color: '#4B5563',
  },
  // Market Item Small
  marketCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  marketImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
  },
  marketContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  marketTitle: {
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
    marginBottom: 2,
  },
  marketPrice: {
    fontSize: 13,
    fontFamily: 'Nunito_800ExtraBold',
    marginBottom: 2,
  },
  marketSeller: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  marketSellerName: {
    fontSize: 11,
    fontFamily: 'Nunito_500Medium',
  },
  whatsappButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
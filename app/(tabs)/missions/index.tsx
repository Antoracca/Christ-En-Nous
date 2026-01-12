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
} from 'react-native';
import { Image } from 'expo-image';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@/hooks/useAppTheme';
import { LinearGradient } from 'expo-linear-gradient';
import { BOMI_PROJECTS, BOMI_STATS, BOMI_TESTIMONIES, MissionProject } from '@/data/bomiData';
import * as Haptics from 'expo-haptics';
import PaymentModal from '@/components/bomi/PaymentModal';
import ReceiptModal from '@/components/bomi/ReceiptModal';
import TopToast from '@/components/markos/TopToast';

const { width } = Dimensions.get('window');

// Composant Carte Projet
const ProjectCard = ({ project, onSupport, isSupported }: { project: MissionProject; onSupport: () => void; isSupported: boolean }) => {
  const theme = useAppTheme();
  const progress = project.currentAmount / project.targetAmount;
  const percent = Math.round(progress * 100);

  return (
    <View style={[styles.projectCard, { backgroundColor: theme.colors.surface }]}>
      <Image source={{ uri: project.image }} style={styles.projectImage} contentFit="cover" />
      <View style={styles.categoryBadge}>
        <Text style={styles.categoryText}>{project.category}</Text>
      </View>
      
      <View style={styles.projectContent}>
        <Text style={[styles.projectTitle, { color: theme.colors.onSurface }]}>{project.title}</Text>
        <View style={styles.locationRow}>
          <Feather name="map-pin" size={12} color={theme.colors.outline} />
          <Text style={[styles.locationText, { color: theme.colors.outline }]}>{project.location}</Text>
        </View>
        
        <Text style={[styles.projectDesc, { color: theme.colors.onSurfaceVariant }]} numberOfLines={2}>
          {project.description}
        </Text>

        <View style={styles.progressContainer}>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${Math.min(percent, 100)}%` }]} />
          </View>
          <View style={styles.progressStats}>
            <Text style={[styles.amountText, { color: theme.colors.primary }]}>
              {project.currentAmount.toLocaleString()} FCFA
            </Text>
            <Text style={[styles.percentText, { color: theme.colors.onSurfaceVariant }]}>
              {percent}%
            </Text>
          </View>
        </View>

        {isSupported ? (
          <View>
            <View style={styles.supportedBadge}>
              <Feather name="check" size={14} color="#10B981" />
              <Text style={styles.supportedText}>Vous avez soutenu ce projet</Text>
            </View>
            <TouchableOpacity style={styles.supportAgainLink} onPress={onSupport}>
              <Text style={[styles.supportAgainText, { color: theme.colors.primary }]}>Soutenir encore</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            style={[styles.donateButton, { backgroundColor: theme.colors.primary }]}
            onPress={onSupport}
          >
            <Text style={styles.donateButtonText}>Soutenir ce projet</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default function MissionsScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  
  // State
  const [paymentVisible, setPaymentVisible] = useState(false);
  const [receiptVisible, setReceiptVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState<MissionProject | null>(null);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [supportedProjects, setSupportedProjects] = useState<string[]>([]);

  // Handlers
  const openPayment = (project?: MissionProject) => {
    setSelectedProject(project || null);
    setPaymentVisible(true);
  };

  const handlePaymentSuccess = (amount: number, method: string) => {
    setPaymentVisible(false);
    
    if (selectedProject) {
      if (!supportedProjects.includes(selectedProject.id)) {
        setSupportedProjects([...supportedProjects, selectedProject.id]);
      }
    }
    
    // Show Toast
    setTimeout(() => {
      setToastVisible(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 500);
  };

  const handleReceiptGeneration = (amount: number, ref: string) => {
    setPaymentVisible(false);
    setReceiptData({
      reference: ref,
      amount: amount,
      projectTitle: selectedProject ? selectedProject.title : 'Don Général BOMI',
      date: new Date().toLocaleDateString(),
    });
    setTimeout(() => setReceiptVisible(true), 500);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="light-content" />
      
      <TopToast 
        visible={toastVisible} 
        message="Merci pour votre don ! Que Dieu vous bénisse abondamment."
        onHide={() => setToastVisible(false)} 
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* HERO SECTION / MAP */}
        <View style={styles.heroContainer}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=800' }} 
            style={styles.heroImage} 
            contentFit="cover"
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.8)']}
            style={styles.heroOverlay}
          >
            <View style={styles.headerTop}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Feather name="arrow-left" size={24} color="white" />
              </TouchableOpacity>
              <Image source={require('../../../public/assets/mission.png')} style={{ width: 40, height: 40 }} contentFit="contain"/>
            </View>
            
            <View style={styles.heroTextContainer}>
              <Text style={styles.heroTitle}>BOMI</Text>
              <Text style={styles.heroSubtitle}>Bonnes Œuvres Missions Internationales</Text>
              <Text style={styles.heroTagline}>"Allez, faites de toutes les nations des disciples"</Text>
            </View>
          </LinearGradient>
        </View>

        {/* STATS */}
        <View style={styles.statsContainer}>
          {BOMI_STATS.map((stat) => (
            <View key={stat.id} style={[styles.statItem, { backgroundColor: theme.colors.surface }]}>
              <View style={[styles.statIcon, { backgroundColor: stat.color + '15' }]}>
                <Feather name={stat.icon as any} size={20} color={stat.color} />
              </View>
              <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* PROJETS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Projets en Cours</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/missions/all-projects')}>
              <Text style={{ color: theme.colors.primary, fontFamily: 'Nunito_700Bold' }}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.projectsList}>
            {BOMI_PROJECTS.map((project) => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                onSupport={() => openPayment(project)}
                isSupported={supportedProjects.includes(project.id)}
              />
            ))}
          </ScrollView>
        </View>

        {/* TEMOIGNAGES */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface, paddingHorizontal: 20 }]}>Vies Transformées</Text>
          {BOMI_TESTIMONIES.map((t) => (
            <View key={t.id} style={[styles.testimonyCard, { backgroundColor: theme.colors.surface }]}>
              <View style={styles.testimonyHeader}>
                <Image source={{ uri: t.avatar }} style={styles.testimonyAvatar} />
                <View>
                  <Text style={[styles.testimonyName, { color: theme.colors.onSurface }]}>{t.name}</Text>
                  <Text style={[styles.testimonyRole, { color: theme.colors.primary }]}>{t.role} • {t.location}</Text>
                </View>
              </View>
              <Text style={[styles.testimonyContent, { color: theme.colors.onSurfaceVariant }]}>"{t.content}"</Text>
            </View>
          ))}
        </View>

        {/* DONATE CTA */}
        <View style={styles.donateSection}>
          <LinearGradient
            colors={['#10B981', '#059669']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.donateCard}
          >
            <View style={styles.donateContent}>
              <Text style={styles.donateTitle}>Soutenez la Mission</Text>
              <Text style={styles.donateSubtitle}>Votre générosité permet d'apporter l'Évangile et l'aide humanitaire là où c'est nécessaire.</Text>
              <TouchableOpacity style={styles.mainDonateButton} onPress={() => openPayment()}>
                <Text style={styles.mainDonateText}>Faire un Don</Text>
                <Feather name="heart" size={18} color="#059669" />
              </TouchableOpacity>
            </View>
            <Ionicons name="gift-outline" size={100} color="rgba(255,255,255,0.2)" style={styles.donateIcon} />
          </LinearGradient>
        </View>

        <View style={{ height: 50 }} />
      </ScrollView>

      {/* MODALS */}
      <PaymentModal 
        visible={paymentVisible}
        onClose={() => setPaymentVisible(false)}
        projectTitle={selectedProject ? selectedProject.title : 'Don Général'}
        onSuccess={handlePaymentSuccess}
        onReceipt={handleReceiptGeneration}
      />

      {receiptData && (
        <ReceiptModal 
          visible={receiptVisible}
          onClose={() => setReceiptVisible(false)}
          data={receiptData}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // ... (Garder les styles existants)
  container: { flex: 1 },
  scrollContent: { paddingBottom: 20 },
  
  heroContainer: {
    height: 300,
    width: '100%',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    padding: 20,
    justifyContent: 'space-between',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTextContainer: {
    marginBottom: 40,
  },
  heroTitle: {
    color: 'white',
    fontSize: 42,
    fontFamily: 'Nunito_800ExtraBold',
    letterSpacing: 2,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    marginBottom: 8,
  },
  heroTagline: {
    color: 'white',
    fontSize: 14,
    fontStyle: 'italic',
    fontFamily: 'Nunito_600SemiBold',
  },

  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: -30,
    marginBottom: 30,
  },
  statItem: {
    width: '31%',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 16,
    fontFamily: 'Nunito_800ExtraBold',
  },
  statLabel: {
    fontSize: 10,
    fontFamily: 'Nunito_600SemiBold',
    textAlign: 'center',
  },

  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Nunito_800ExtraBold',
  },
  
  projectsList: {
    paddingHorizontal: 20,
    paddingRight: 10,
  },
  projectCard: {
    width: 280,
    borderRadius: 16,
    marginRight: 15,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    paddingBottom: 16,
  },
  projectImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#E5E7EB',
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'white',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 10,
    fontFamily: 'Nunito_800ExtraBold',
    color: '#1F2937',
  },
  projectContent: {
    padding: 16,
  },
  projectTitle: {
    fontSize: 16,
    fontFamily: 'Nunito_800ExtraBold',
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
  },
  locationText: {
    fontSize: 12,
    fontFamily: 'Nunito_600SemiBold',
  },
  projectDesc: {
    fontSize: 13,
    fontFamily: 'Nunito_400Regular',
    lineHeight: 18,
    marginBottom: 16,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  amountText: {
    fontSize: 13,
    fontFamily: 'Nunito_800ExtraBold',
  },
  percentText: {
    fontSize: 12,
    fontFamily: 'Nunito_600SemiBold',
  },
  donateButton: {
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  donateButtonText: {
    color: 'white',
    fontSize: 13,
    fontFamily: 'Nunito_700Bold',
  },
  
  // Supported State Styles
  supportedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#D1FAE5',
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 8,
  },
  supportedText: {
    color: '#10B981',
    fontSize: 12,
    fontFamily: 'Nunito_700Bold',
  },
  supportAgainLink: {
    alignItems: 'center',
  },
  supportAgainText: {
    fontSize: 12,
    fontFamily: 'Nunito_700Bold',
    textDecorationLine: 'underline',
  },

  testimonyCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  testimonyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  testimonyAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  testimonyName: {
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
  },
  testimonyRole: {
    fontSize: 11,
    fontFamily: 'Nunito_600SemiBold',
  },
  testimonyContent: {
    fontSize: 13,
    fontFamily: 'Nunito_400Regular',
    fontStyle: 'italic',
    lineHeight: 20,
  },

  donateSection: {
    paddingHorizontal: 20,
  },
  donateCard: {
    padding: 24,
    borderRadius: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  donateContent: {
    position: 'relative',
    zIndex: 2,
  },
  donateTitle: {
    color: 'white',
    fontSize: 20,
    fontFamily: 'Nunito_800ExtraBold',
    marginBottom: 8,
  },
  donateSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontFamily: 'Nunito_600SemiBold',
    marginBottom: 20,
    lineHeight: 20,
  },
  mainDonateButton: {
    backgroundColor: 'white',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  mainDonateText: {
    color: '#059669',
    fontSize: 14,
    fontFamily: 'Nunito_800ExtraBold',
  },
  donateIcon: {
    position: 'absolute',
    right: -20,
    bottom: -20,
    transform: [{ rotate: '-15deg' }],
  },
});


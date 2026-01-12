// app/screens/bible/BibleProgressModal.tsx
// Refonte V2.1 : Style Compact, Détails Déroulants, Alignement Pro.

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  SafeAreaView,
  Alert,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useResponsiveSafe } from '@/context/ResponsiveContext';
import { useBible } from '@/context/EnhancedBibleContext';
import { progress } from '@/services/bible/tracking/progressTracking';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { height } = Dimensions.get('window');

interface BibleProgressModalProps {
  visible: boolean;
  onClose: () => void;
}

// --- Helpers Logiques ---

const formatTime = (seconds: number) => {
  if (seconds < 60) return `${seconds}s`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m} min`;
};

// --- Composants UI ---

const StatBadge = ({ icon, value, label, color, theme }: any) => (
  <View style={[styles.statBadge, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline + '15', borderWidth: 1 }]}>
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
        <Feather name={icon} size={14} color={color} style={{ marginRight: 6 }} />
        <Text style={[styles.statBadgeValue, { color: theme.custom.colors.text }]}>{value}</Text>
    </View>
    <Text style={[styles.statBadgeLabel, { color: theme.custom.colors.placeholder }]}>{label}</Text>
  </View>
);

const TestamentCard = ({ title, data, color, theme, expanded, onToggle }: any) => {
  return (
    <View style={[styles.testamentCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline + '20' }]}>
      <TouchableOpacity 
        style={styles.testamentHeader} 
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View style={styles.testamentTitleRow}>
            <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
                {/* Icône Bible/Livre demandée */}
                <FontAwesome5 name="bible" size={16} color={color} />
            </View>
            <View>
                <Text style={[styles.testamentTitle, { color: theme.custom.colors.text }]}>{title}</Text>
                <Text style={[styles.testamentSubtitle, { color: theme.custom.colors.placeholder }]}>
                    {data.chapters.completed}/{data.chapters.total} chapitres
                </Text>
            </View>
        </View>
        <View style={styles.headerRight}>
            <Text style={[styles.percentText, { color: color }]}>{Math.round(data.percent)}%</Text>
            <Feather name={expanded ? "chevron-up" : "chevron-down"} size={20} color={theme.custom.colors.placeholder} />
        </View>
      </TouchableOpacity>

      <View style={[styles.miniProgressTrack, { backgroundColor: theme.colors.outline + '20' }]}>
         <View style={[styles.miniProgressFill, { width: `${data.percent}%`, backgroundColor: color }]} />
      </View>

      {expanded && (
        <View style={styles.testamentDetails}>
            <View style={styles.gridStats}>
                <View style={styles.gridItem}>
                    <Text style={[styles.gridValue, { color: theme.custom.colors.text }]}>{data.booksCompleted}/{data.booksTotal}</Text>
                    <Text style={[styles.gridLabel, { color: theme.custom.colors.placeholder }]}>Livres</Text>
                </View>
                <View style={styles.gridItem}>
                    <Text style={[styles.gridValue, { color: theme.custom.colors.text }]}>{data.verses.read}</Text>
                    <Text style={[styles.gridLabel, { color: theme.custom.colors.placeholder }]}>Versets</Text>
                </View>
                <View style={styles.gridItem}>
                    <Text style={[styles.gridValue, { color: theme.custom.colors.text }]}>{formatTime(data.timeSpent || 0)}</Text>
                    <Text style={[styles.gridLabel, { color: theme.custom.colors.placeholder }]}>Temps</Text>
                </View>
            </View>
        </View>
      )}
    </View>
  );
};

// ✅ HERO COMPACT (SLIM)
const HeroBookCard = ({ book, onAction, theme }: any) => {
  if (!book) return null;
  
  return (
    <View style={[styles.heroCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.primary }]}>
      <View style={styles.heroTopRow}>
          <View>
            <Text style={[styles.heroLabel, { color: theme.colors.primary }]}>LECTURE EN COURS</Text>
            <Text style={[styles.heroTitle, { color: theme.custom.colors.text }]}>{book.bookName}</Text>
            <Text style={[styles.heroSubtitle, { color: theme.custom.colors.placeholder }]}>
                Chapitre {book.currentChapter} • {Math.round(book.percent)}%
            </Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.heroButtonCompact, { backgroundColor: theme.colors.primary }]}
            onPress={() => onAction(book)}
            activeOpacity={0.9}
          >
            <Feather name="play" size={20} color="white" />
          </TouchableOpacity>
      </View>
      
      <View style={[styles.progressBar, { backgroundColor: theme.colors.outline + '30', marginTop: 12 }]}>
          <View style={[styles.progressFill, { width: `${book.percent}%`, backgroundColor: theme.colors.primary }]} />
      </View>
    </View>
  );
};

// ✅ HISTORIQUE DÉROULANT
const HistoryItem = ({ book, onAction, theme }: any) => {
  const [expanded, setExpanded] = useState(false);
  const isCompleted = book.isCompleted;
  const color = isCompleted ? '#4CAF50' : theme.colors.secondary;
  
  const toggle = () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setExpanded(!expanded);
  };

  return (
    <View style={[styles.historyItemContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline + '15', borderWidth: 1 }]}>
        <TouchableOpacity style={styles.historyHeader} onPress={toggle} activeOpacity={0.7}>
            <View style={styles.historyLeft}>
                <View style={[styles.historyIcon, { backgroundColor: color + '15' }]}>
                    <Feather name={isCompleted ? "check" : "bookmark"} size={16} color={color} />
                </View>
                <View>
                    <Text style={[styles.historyName, { color: theme.custom.colors.text }]}>{book.bookName}</Text>
                    <Text style={[styles.historyPercent, { color: color }]}>
                        {isCompleted ? "Terminé" : `${Math.round(book.percent)}%`}
                    </Text>
                </View>
            </View>
            <Feather name={expanded ? "chevron-up" : "chevron-down"} size={20} color={theme.custom.colors.placeholder} />
        </TouchableOpacity>
        
        {expanded && (
            <View style={styles.historyContent}>
                <View style={[styles.progressTrack, { backgroundColor: theme.colors.outline + '20' }]}>
                    <View style={[styles.progressFill, { width: `${book.percent}%`, backgroundColor: color }]} />
                </View>

                <View style={styles.historyStatsGrid}>
                    <View style={styles.historyStatBox}>
                        <Text style={[styles.historyStatLabel, {color: theme.custom.colors.placeholder}]}>Temps</Text>
                        <Text style={[styles.historyStatValue, {color: theme.custom.colors.text}]}>{formatTime(book.timeSpentSec)}</Text>
                    </View>
                    <View style={styles.historyStatBox}>
                        <Text style={[styles.historyStatLabel, {color: theme.custom.colors.placeholder}]}>Vitesse</Text>
                        <Text style={[styles.historyStatValue, {color: theme.custom.colors.text}]}>{book.avgVpm.toFixed(1)} v/m</Text>
                    </View>
                    <View style={styles.historyStatBox}>
                        <Text style={[styles.historyStatLabel, {color: theme.custom.colors.placeholder}]}>Chapitres</Text>
                        <Text style={[styles.historyStatValue, {color: theme.custom.colors.text}]}>{book.chaptersRead}/{book.chaptersTotal}</Text>
                    </View>
                </View>

                <TouchableOpacity 
                    style={[styles.historyActionBtn, { backgroundColor: color + '15' }]}
                    onPress={() => onAction(book)}
                >
                    <Text style={[styles.historyActionText, { color: color }]}>
                        {isCompleted ? "Recommencer" : "Reprendre la lecture"}
                    </Text>
                    <Feather name={isCompleted ? "rotate-ccw" : "arrow-right"} size={14} color={color} />
                </TouchableOpacity>
            </View>
        )}
    </View>
  );
};

// ✅ FAQ ITEM COMPONENT
const FaqItem = ({ question, answer, theme, expanded, onToggle }: any) => (
  <View style={[styles.faqItem, { borderBottomColor: theme.colors.outline + '15' }]}>
    <TouchableOpacity onPress={onToggle} style={styles.faqHeader} activeOpacity={0.7}>
        <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
            <Feather name="help-circle" size={16} color={theme.custom.colors.placeholder} style={{marginRight: 8}} />
            <Text style={[styles.faqQuestion, { color: theme.custom.colors.text }]}>{question}</Text>
        </View>
        <Feather name={expanded ? "chevron-up" : "chevron-down"} size={18} color={theme.custom.colors.placeholder} />
    </TouchableOpacity>
    {expanded && (
        <Text style={[styles.faqAnswer, { color: theme.custom.colors.placeholder }]}>{answer}</Text>
    )}
  </View>
);

export default function BibleProgressModal({ visible, onClose }: BibleProgressModalProps) {
  const theme = useAppTheme();
  const responsive = useResponsiveSafe();
  const { bibleBooks, navigateToChapter } = useBible();

  // Data State
  const [activeBook, setActiveBook] = useState<any>(null);
  const [historyBooks, setHistoryBooks] = useState<any[]>([]);
  const [xp, setXp] = useState(0); 
  
  const [globalStats, setGlobalStats] = useState<any>({ percent: 0, totalTime: 0, vpm: 0, versesRead: 0 });
  // ✅ Restauration des stats Testament
  const [otStats, setOtStats] = useState<any>({ percent: 0, chapters: {completed:0, total:0}, booksCompleted:0, booksTotal:0, verses:{read:0}, timeSpent:0 });
  const [ntStats, setNtStats] = useState<any>({ percent: 0, chapters: {completed:0, total:0}, booksCompleted:0, booksTotal:0, verses:{read:0}, timeSpent:0 });
  
  // UI State
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null); // ✅ Ajouté
  
  // ✅ Restauration des états d'expansion
  const [expandOT, setExpandOT] = useState(false);
  const [expandNT, setExpandNT] = useState(false);

  const slideAnim = useRef(new Animated.Value(height)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const tickRef = useRef<any>(null);

  const labelsMap = useMemo(
    () => Object.fromEntries((bibleBooks || []).map((b: any) => [String(b.id || '').toUpperCase(), b.name])),
    [bibleBooks]
  );

  const refreshData = React.useCallback(() => {
    try {
      const allBooks = progress.getBookHistory(labelsMap);
      const times = progress.getLiveTimes();
      const ot = progress.getTestamentPercent('OT');
      const nt = progress.getTestamentPercent('NT');
      const g = progress.getGlobalPercent();
      const est = progress.getEstimates();
      
      setGlobalStats({
          percent: g.percent,
          totalTime: times.globalSeconds,
          vpm: est.paceVersesPerMin || 0,
          versesRead: ot.verses.read + nt.verses.read
      });
      
      // Séparer le livre actif
      const activeSession = progress.getActiveSession();
      let current = null;
      let others = [];

      if (activeSession) {
          current = allBooks.find(b => b.bookId === activeSession.ref.bookId);
          others = allBooks.filter(b => b.bookId !== activeSession.ref.bookId);
      } else if (allBooks.length > 0 && !allBooks[0].isCompleted) {
          current = allBooks[0];
          others = allBooks.slice(1);
      } else {
          others = allBooks;
      }

      setActiveBook(current);
      setHistoryBooks(others);
      
      setOtStats({ ...ot, timeSpent: times.otSeconds });
      setNtStats({ ...nt, timeSpent: times.ntSeconds });

    } catch (e) { console.warn(e); }
  }, [labelsMap]);

  useEffect(() => {
    if (!visible) return;
    refreshData();
    tickRef.current = setInterval(refreshData, 1000); 
    return () => clearInterval(tickRef.current);
  }, [visible, refreshData]);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 50, friction: 10 }), 
        Animated.timing(backdropAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: height, duration: 300, useNativeDriver: true }),
        Animated.timing(backdropAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
    }
  }, [visible, slideAnim, backdropAnim]);

  const handleAction = (book: any) => {
    Haptics.selectionAsync();
    
    if (book.isCompleted) {
        Alert.alert(
            "Recommencer la lecture ?", 
            `Vous avez déjà terminé ${book.bookName}. Voulez-vous le recommencer ? Votre temps de lecture global sera conservé.`,
            [
                { text: "Annuler", style: "cancel" },
                { text: "Recommencer", onPress: async () => {
                    await progress.restartBook(book.bookId);
                    navigateToChapter({ book: book.bookId, chapter: 1, end: undefined }).then(() => onClose());
                }}
            ]
        );
    } else {
        navigateToChapter({
            book: book.nextRef.book,
            chapter: book.nextRef.chapter,
            end: undefined
        }).then(() => onClose());
    }
  };

  // ✅ FAQ DATA
  const faqData = [
      { q: "Comment le temps est-il calculé ?", a: "Le chronomètre démarre quand vous êtes sur un chapitre. Il se met en pause automatiquement si vous quittez l'écran ou après 5 min d'inactivité." },
      { q: "Quand un livre est-il 'Terminé' ?", a: "Un livre est marqué terminé lorsque vous avez ouvert ou validé (bouton Suivant) au moins 90% de ses versets." },
      { q: "À quoi servent les XP ?", a: "Les points d'expérience (XP) sont une fonctionnalité future pour récompenser votre régularité de lecture." },
      { q: "Mes données sont-elles sauvegardées ?", a: "Oui, tout est synchronisé dans le Cloud (Firebase) et accessible sur tous vos appareils connectés." },
  ];

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <View style={styles.container}>
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: backdropAnim }]}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1}>
            <BlurView intensity={40} tint={theme.dark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          style={[
            styles.modalContent,
            {
              backgroundColor: theme.colors.background,
              transform: [{ translateY: slideAnim }],
              height: '92%',
              marginTop: 'auto', 
            },
          ]}
        >
          <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: theme.colors.outline + '10' }]}>
              <View>
                <Text style={[styles.headerTitle, { color: theme.custom.colors.text }]}>Tableau de bord</Text>
                <Text style={[styles.headerSubtitle, { color: theme.custom.colors.placeholder }]}>Statistiques & Historique</Text>
              </View>
              
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
                  {/* Badge XP (Futur) - Visible pour structure */}
                  <View style={[styles.xpBadge, { borderColor: theme.colors.outline + '20' }]}>
                      <Text style={[styles.xpText, { color: theme.custom.colors.text }]}>0 XP</Text>
                  </View>
                  <TouchableOpacity onPress={onClose} style={[styles.closeButton, { backgroundColor: theme.colors.surface }]}>
                    <Feather name="x" size={22} color={theme.custom.colors.text} />
                  </TouchableOpacity>
              </View>
            </View>

            <ScrollView 
              style={styles.content} 
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              
              {/* GLOBAL STATS ROW */}
              <View style={styles.statsRow}>
                 <StatBadge 
                    icon="clock" 
                    value={formatTime(globalStats.totalTime)} 
                    label="Temps total" 
                    color={theme.colors.primary} 
                    theme={theme} 
                 />
                 <StatBadge 
                    icon="zap" 
                    value={globalStats.vpm > 0 ? `${globalStats.vpm.toFixed(1)}` : "--"} 
                    label="Versets/min" 
                    color={theme.colors.secondary} 
                    theme={theme} 
                 />
                 <StatBadge 
                    icon="layers" 
                    value={globalStats.versesRead} 
                    label="Versets lus" 
                    color={theme.colors.tertiary} 
                    theme={theme} 
                 />
              </View>

              {/* VUE D'ENSEMBLE (Testament) - Déplacé en haut */}
              <View style={styles.section}>
                 <Text style={[styles.sectionTitle, { color: theme.custom.colors.placeholder }]}>VUE D'ENSEMBLE</Text>
                 
                 <TestamentCard 
                    title="Ancien Testament" 
                    data={otStats} 
                    color={theme.colors.primary} 
                    theme={theme} 
                    expanded={expandOT}
                    onToggle={() => {
                        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                        setExpandOT(!expandOT);
                    }}
                 />
                 
                 <View style={{height: 12}} />
                 
                 <TestamentCard 
                    title="Nouveau Testament" 
                    data={ntStats} 
                    color={theme.colors.secondary} 
                    theme={theme}
                    expanded={expandNT}
                    onToggle={() => {
                        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                        setExpandNT(!expandNT);
                    }}
                 />
              </View>

              {/* LECTURE ACTIVE (Hero Compact) */}
              {activeBook && (
                  <View style={styles.section}>
                      <HeroBookCard book={activeBook} onAction={handleAction} theme={theme} />
                  </View>
              )}

              {/* BIBLIOTHÈQUE (Historique Déroulant) */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.custom.colors.placeholder }]}>BIBLIOTHÈQUE</Text>
                
                {historyBooks.length > 0 ? (
                    <View style={{ gap: 12 }}>
                        {historyBooks.map((book) => (
                            <HistoryItem 
                                key={book.bookId} 
                                book={book} 
                                onAction={handleAction} 
                                theme={theme} 
                            />
                        ))}
                    </View>
                ) : (
                    <View style={[styles.emptyState, { borderColor: theme.colors.outline + '20' }]}>
                        <Text style={[styles.emptyText, { color: theme.custom.colors.placeholder }]}>
                            Votre historique apparaîtra ici.
                        </Text>
                    </View>
                )}
              </View>

              {/* FAQ PRO */}
              <View style={[styles.section, { marginTop: 20 }]}>
                 <Text style={[styles.sectionTitle, { color: theme.custom.colors.placeholder }]}>INFORMATIONS & FAQ</Text>
                 <View style={[styles.faqContainer, { backgroundColor: theme.colors.surface }]}>
                     {faqData.map((item, index) => (
                         <FaqItem 
                            key={index} 
                            question={item.q} 
                            answer={item.a} 
                            theme={theme} 
                            expanded={expandedFaq === index}
                            onToggle={() => {
                                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                                setExpandedFaq(expandedFaq === index ? null : index);
                            }}
                         />
                     ))}
                 </View>
              </View>

              {/* FOOTER */}
              <View style={{marginTop: 40, alignItems: 'center'}}>
                  <TouchableOpacity 
                    style={[styles.resetButton, { backgroundColor: theme.colors.error + '15', borderColor: theme.colors.error + '30' }]}
                    onPress={async () => {
                        Alert.alert("Zone Danger", "Voulez-vous vraiment effacer tout votre historique de lecture ? Cette action est irréversible.", [
                            {text: "Annuler", style: "cancel"},
                            {text: "Tout effacer", style: "destructive", onPress: async () => { await progress.resetAll(); refreshData(); }}
                        ]);
                    }}
                    activeOpacity={0.8}
                  >
                      <Feather name="trash-2" size={18} color={theme.colors.error} />
                      <Text style={[styles.resetButtonText, { color: theme.colors.error }]}>Réinitialiser toutes les données</Text>
                  </TouchableOpacity>
                  <Text style={[styles.versionText, { color: theme.custom.colors.placeholder }]}>v1.4.0 • Synchronisé</Text>
              </View>
              
              <View style={{height: 60}} />
            </ScrollView>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  modalContent: { 
    borderTopLeftRadius: 32, 
    borderTopRightRadius: 32, 
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 20
  },
  safeArea: { flex: 1 },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 22, fontFamily: 'Nunito_800ExtraBold' },
  headerSubtitle: { fontSize: 14, fontFamily: 'Nunito_600SemiBold', opacity: 0.6, marginTop: 2 },
  closeButton: { padding: 8, borderRadius: 12 },

  xpBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      borderWidth: 1,
  },
  xpText: { fontSize: 12, fontFamily: 'Nunito_800ExtraBold' },

  content: { flex: 1 },
  scrollContent: { padding: 24 },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 32 },
  statBadge: {
    flex: 1, padding: 12, borderRadius: 16, justifyContent: 'center'
  },
  statBadgeValue: { fontSize: 16, fontFamily: 'Nunito_800ExtraBold' },
  statBadgeLabel: { fontSize: 11, fontFamily: 'Nunito_600SemiBold', marginTop: 2 },

  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 12, fontFamily: 'Nunito_800ExtraBold', marginBottom: 12, letterSpacing: 1.2, opacity: 0.7 },

  // HERO COMPACT
  heroCard: {
      padding: 20,
      borderRadius: 24,
      borderWidth: 1,
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
  },
  heroTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  heroLabel: { fontSize: 10, fontFamily: 'Nunito_800ExtraBold', letterSpacing: 1, marginBottom: 4 },
  heroTitle: { fontSize: 20, fontFamily: 'Nunito_800ExtraBold', marginBottom: 2 },
  heroSubtitle: { fontSize: 13, fontFamily: 'Nunito_600SemiBold', opacity: 0.8 },
  heroButtonCompact: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 2
  },
  progressBar: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },

  // HISTORY ITEM
  historyItemContainer: {
      borderRadius: 16,
      overflow: 'hidden',
  },
  historyHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
  },
  historyLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  historyIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  historyName: { fontSize: 16, fontFamily: 'Nunito_700Bold' },
  historyPercent: { fontSize: 12, fontFamily: 'Nunito_600SemiBold', marginTop: 2 },
  
  historyContent: { padding: 16, paddingTop: 0 },
  progressTrack: { height: 4, borderRadius: 2, overflow: 'hidden', marginBottom: 16 },
  
  historyStatsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  historyStatBox: { alignItems: 'center', flex: 1 },
  historyStatLabel: { fontSize: 11, fontFamily: 'Nunito_500Medium', marginBottom: 2 },
  historyStatValue: { fontSize: 14, fontFamily: 'Nunito_700Bold' },
  
  historyActionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      borderRadius: 12,
      gap: 8
  },
  historyActionText: { fontSize: 13, fontFamily: 'Nunito_700Bold' },

  // --- ANCIEN STYLE TESTAMENT (RÉINTRODUIT) ---
  testamentCard: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  testamentHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14 },
  testamentTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  testamentTitle: { fontSize: 15, fontFamily: 'Nunito_700Bold' },
  testamentSubtitle: { fontSize: 12, fontFamily: 'Nunito_500Medium' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  percentText: { fontSize: 14, fontFamily: 'Nunito_800ExtraBold' },
  
  miniProgressTrack: { width: '100%', height: 3 },
  miniProgressFill: { height: '100%' },

  testamentDetails: { padding: 16, paddingTop: 8 },
  gridStats: { flexDirection: 'row', justifyContent: 'space-between' },
  gridItem: { alignItems: 'center', flex: 1 },
  gridValue: { fontSize: 15, fontFamily: 'Nunito_700Bold' },
  gridLabel: { fontSize: 11, fontFamily: 'Nunito_500Medium' },

  // FAQ
  faqContainer: { borderRadius: 16, overflow: 'hidden' },
  faqItem: { borderBottomWidth: 1, padding: 16 },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQuestion: { fontSize: 14, fontFamily: 'Nunito_700Bold', flex: 1, marginRight: 10 },
  faqAnswer: { marginTop: 12, fontSize: 13, fontFamily: 'Nunito_500Medium', lineHeight: 20 },

  emptyState: { padding: 24, alignItems: 'center', borderWidth: 1, borderStyle: 'dashed', borderRadius: 16 },
  emptyText: { fontSize: 13, fontFamily: 'Nunito_500Medium', textAlign: 'center', opacity: 0.6 },

  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
    marginBottom: 12
  },
  resetButtonText: {
    fontSize: 14,
    fontFamily: 'Nunito_700Bold'
  },
  versionText: {
    fontSize: 10,
    fontFamily: 'Nunito_500Medium',
    opacity: 0.4
  }
});
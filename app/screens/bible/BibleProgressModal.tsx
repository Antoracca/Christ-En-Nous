// app/screens/bible/BibleProgressModal.tsx
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
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useResponsiveSafe } from '@/context/ResponsiveContext';
import { useBible } from '@/context/EnhancedBibleContext';
import { progress } from '@/services/bible/tracking/progressTracking';

const { height } = Dimensions.get('window');

interface BibleProgressModalProps {
  visible: boolean;
  onClose: () => void;
}

interface TestamentSectionProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  theme: any;
  testamentTime?: number;
  progressData: {
    booksCompleted: number;
    totalBooks: number;
    chaptersCompleted: number;
    totalChapters: number;
    versesRead: number;
    totalVerses: number;
    progressPercentage: number;
    totalTimeSpent: number;
    estimatedMinutesRemaining: number; // nouveau
  };
  activeBooks: {
    bookId: string;
    bookName: string;
    currentChapter: number;
    totalChapters: number;
    percent: number;
    timeSpentSec: number;
    liveDeltaSec: number;
    speedVpm: number;
    etaMin: number;
    isCompleted: boolean;
    nextRef: { book: string; chapter: number };
  }[];
  onContinue: (ref: { book: string; chapter: number }) => void;
  onGoNext: (ref: { book: string; chapter: number }) => void;
}

const formatTime = (seconds?: number) => {
  const s = Math.max(0, Math.floor(seconds || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h} h ${m} min`;
  return `${m} min`;
};

const formatMinutes = (mins?: number) => {
  const m = Math.max(0, Math.floor(mins || 0));
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (h <= 0) return `${r} min`;
  return `${h} h ${r} min`;
};

const formatETAdate = (mins?: number) => {
  const m = Math.max(0, Math.floor(mins || 0));
  if (m === 0) return '—';
  const d = new Date(Date.now() + m * 60000);
  const months = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
  return `${d.getDate()} ${months[d.getMonth()]}`;
};

const TestamentSection = ({
  title,
  isExpanded,
  onToggle,
  theme,
  testamentTime,
  progressData,
  activeBooks,
  onContinue,
  onGoNext,
}: TestamentSectionProps) => {
  return (
    <View style={styles.testamentSection}>
      <TouchableOpacity
        style={[styles.testamentHeader, { backgroundColor: theme.colors.surface }]}
        onPress={onToggle}
        activeOpacity={0.8}
      >
        <View style={styles.testamentHeaderLeft}>
          <View style={[styles.testamentIcon, { backgroundColor: theme.colors.primary + '20' }]}>
            <Feather name="book" size={20} color={theme.colors.primary} />
          </View>
          <Text style={[styles.testamentTitle, { color: theme.custom.colors.text }]}>{title}</Text>
        </View>
        <View style={styles.testamentHeaderRight}>
          <Text style={[styles.testamentProgress, { color: theme.colors.primary }]}>
            {Math.round(progressData.progressPercentage)}%
          </Text>
          <Feather
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={theme.custom.colors.placeholder}
          />
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={[styles.testamentContent, { backgroundColor: theme.colors.background }]}>
          <View style={styles.metricsGrid}>
            <View style={[styles.metricCard, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.metricNumber, { color: theme.colors.primary }]}>
                {progressData.booksCompleted}/{progressData.totalBooks}
              </Text>
              <Text style={[styles.testamentMetricLabel, { color: theme.custom.colors.text, opacity: 0.8 }]}>
                Livres terminés
              </Text>
              <Text style={[styles.metricDescription, { color: theme.custom.colors.text, opacity: 0.6 }]}>
                Seuil de complétion
              </Text>
            </View>
            <View style={[styles.metricCard, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.metricNumber, { color: theme.colors.secondary }]}>
                {progressData.chaptersCompleted}/{progressData.totalChapters}
              </Text>
              <Text style={[styles.testamentMetricLabel, { color: theme.custom.colors.text, opacity: 0.8 }]}>
                Chapitres terminés
              </Text>
              <Text style={[styles.metricDescription, { color: theme.custom.colors.text, opacity: 0.6 }]}>
                Agrégé
              </Text>
            </View>
            <View style={[styles.metricCard, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.metricNumber, { color: theme.colors.tertiary }]}>
                {progressData.versesRead}/{progressData.totalVerses}
              </Text>
              <Text style={[styles.testamentMetricLabel, { color: theme.custom.colors.text, opacity: 0.8 }]}>
                Versets lus
              </Text>
              <Text style={[styles.metricDescription, { color: theme.custom.colors.text, opacity: 0.6 }]}>
                Granulaire
              </Text>
            </View>
          </View>

          <View style={styles.timeStats}>
            <View style={[styles.timeStatItem, { backgroundColor: theme.colors.surface }]}>
              <Feather name="calendar" size={16} color={theme.colors.primary} />
              <View style={styles.timeStatTextContainer}>
                <Text style={[styles.timeStatLabel, { color: theme.custom.colors.text, opacity: 0.8 }]}>
                  Jours consécutifs
                </Text>
                <Text style={[styles.timeStatDescription, { color: theme.custom.colors.text, opacity: 0.6 }]}>
                  Série quotidienne
                </Text>
              </View>
              <Text style={[styles.timeStatValue, { color: theme.custom.colors.text, fontWeight: '600' }]}>
                0 jours
              </Text>
            </View>

            <View style={[styles.timeStatItem, { backgroundColor: theme.colors.surface }]}>
              <Feather name="clock" size={16} color={theme.colors.secondary} />
              <View style={styles.timeStatTextContainer}>
                <Text style={[styles.timeStatLabel, { color: theme.custom.colors.text, opacity: 0.8 }]}>
                  Temps dans {title}
                </Text>
                <Text style={[styles.timeStatDescription, { color: theme.custom.colors.text, opacity: 0.6 }]}>
                  Cumul en direct
                </Text>
              </View>
              <Text style={[styles.timeStatValue, { color: theme.custom.colors.text, fontWeight: '600' }]}>
                {formatTime(testamentTime)}
              </Text>
            </View>

            <View style={[styles.timeStatItem, { backgroundColor: theme.colors.surface }]}>
              <Feather name="zap" size={16} color={theme.colors.primary} />
              <View style={styles.timeStatTextContainer}>
                <Text style={[styles.timeStatLabel, { color: theme.custom.colors.text, opacity: 0.8 }]}>
                  Reste estimé
                </Text>
                <Text style={[styles.timeStatDescription, { color: theme.custom.colors.text, opacity: 0.6 }]}>
                  À ton rythme actuel
                </Text>
              </View>
              <Text style={[styles.timeStatValue, { color: theme.custom.colors.text, fontWeight: '600' }]}>
                {formatMinutes(progressData.estimatedMinutesRemaining)}
              </Text>
            </View>
          </View>

          {activeBooks.length > 0 && (
            <View style={styles.booksSection}>
              <View style={styles.booksSectionHeader}>
                <View style={[styles.booksIcon, { backgroundColor: theme.colors.secondary + '20' }]}>
                  <Feather name="play-circle" size={18} color={theme.colors.secondary} />
                </View>
                <Text style={[styles.booksSectionTitle, { color: theme.custom.colors.text }]}>
                  Livres en cours ({activeBooks.length})
                </Text>
              </View>

              {activeBooks.map((b) => {
                const totalTime = b.timeSpentSec + b.liveDeltaSec;
                const encour = progress.getEncouragementFor(b.percent, b.bookName);

                return (
                  <View
                    key={b.bookId}
                    style={[
                      styles.bookItem,
                      {
                        backgroundColor: b.isCompleted ? '#4CAF50' + '10' : theme.colors.surface,
                        borderColor: b.isCompleted ? '#4CAF50' : 'transparent',
                        borderWidth: b.isCompleted ? 2 : 0,
                      },
                    ]}
                  >
                    <View style={styles.bookHeader}>
                      <Text
                        style={[
                          styles.bookName,
                          {
                            color: b.isCompleted ? '#2E7D32' : theme.custom.colors.text,
                            fontWeight: b.isCompleted ? '800' : '700',
                          },
                        ]}
                      >
                        {b.bookName} — chap. {b.currentChapter}/{b.totalChapters}
                      </Text>
                      <Text
                        style={[
                          styles.bookProgress,
                          { color: b.isCompleted ? '#2E7D32' : theme.colors.primary, fontWeight: '900' },
                        ]}
                      >
                        {b.isCompleted ? '100' : Math.round(b.percent)}%
                      </Text>
                    </View>

                    <View style={[styles.bookProgressBar, { backgroundColor: theme.colors.outline + '30' }]}>
                      <View
                        style={[
                          styles.bookProgressFill,
                          {
                            backgroundColor: b.isCompleted ? '#4CAF50' : theme.colors.secondary,
                            width: `${Math.min(b.percent, 100)}%`,
                          },
                        ]}
                      />
                    </View>

                    <View style={styles.bookStatsRow}>
                      <Text style={[styles.bookStat, { color: theme.custom.colors.text }]}>
                        Temps : {formatTime(totalTime)}
                      </Text>
                      <Text style={[styles.bookStat, { color: theme.custom.colors.text }]}>
                        Vitesse : {b.speedVpm.toFixed(1)} v/min
                      </Text>
                      <Text style={[styles.bookStat, { color: theme.custom.colors.text }]}>
                        Reste : {formatMinutes(b.etaMin)}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.encouragement,
                        { backgroundColor: b.isCompleted ? '#4CAF50' + '15' : theme.colors.outline + '15' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.encouragementText,
                          { color: b.isCompleted ? '#2E7D32' : theme.custom.colors.text },
                        ]}
                      >
                        {encour.message}
                      </Text>
                    </View>

                    <View style={styles.bookActions}>
                      {!b.isCompleted ? (
                        <TouchableOpacity
                          style={[styles.actionBtn, { 
                            backgroundColor: (b as any).buttonState === 'continuer' ? theme.colors.primary : 
                                           (b as any).buttonState === 'reprendre' ? '#FF9800' : 
                                           '#4CAF50' 
                          }]}
                          onPress={() => onContinue({ book: b.bookId, chapter: b.currentChapter })}
                        >
                          <Feather 
                            name={(b as any).buttonState === 'continuer' ? 'play' : 
                                 (b as any).buttonState === 'reprendre' ? 'rotate-ccw' : 
                                 'play-circle'} 
                            size={16} 
                            color="white" 
                          />
                          <Text style={styles.actionBtnText}>{(b as any).buttonText || 'Continuer'}</Text>
                          {(b as any).isCurrentlyActive && (
                            <View style={{ 
                              width: 6, 
                              height: 6, 
                              borderRadius: 3, 
                              backgroundColor: '#4CAF50',
                              marginLeft: 4
                            }} />
                          )}
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          style={[styles.actionBtn, { backgroundColor: '#2E7D32' }]}
                          onPress={() => onGoNext(b.nextRef)}
                        >
                          <Feather name="check-circle" size={16} color="white" />
                          <Text style={styles.actionBtnText}>Terminé ✨</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default function BibleProgressModal({ visible, onClose }: BibleProgressModalProps) {
  const theme = useAppTheme();
  const responsive = useResponsiveSafe();
  const { bibleBooks, navigateToChapter } = useBible();

  const [expandedTestament, setExpandedTestament] = useState<'OT' | 'NT' | null>(null);

  const [globalPercent, setGlobalPercent] = useState(0);
  const [atPercent, setAtPercent] = useState(0);
  const [ntPercent, setNtPercent] = useState(0);

  const [totalBibleTime, setTotalBibleTime] = useState(0);
  const [atTime, setAtTime] = useState(0);
  const [ntTime, setNtTime] = useState(0);

  const [paceVpm, setPaceVpm] = useState(0);            // nouveau
  const [globalEtaMin, setGlobalEtaMin] = useState(0);  // nouveau

  const [atAgg, setAtAgg] = useState({
    booksCompleted: 0,
    booksTotal: 0,
    chaptersCompleted: 0,
    chaptersTotal: 0,
    versesRead: 0,
    versesTotal: 0,
    estMin: 0, // minutes restantes dans l'AT
  });
  const [ntAgg, setNtAgg] = useState({
    booksCompleted: 0,
    booksTotal: 0,
    chaptersCompleted: 0,
    chaptersTotal: 0,
    versesRead: 0,
    versesTotal: 0,
    estMin: 0, // minutes restantes dans le NT
  });

  const [atActive, setAtActive] = useState<TestamentSectionProps['activeBooks']>([]);
  const [ntActive, setNtActive] = useState<TestamentSectionProps['activeBooks']>([]);

  const slideAnim = useRef(new Animated.Value(height)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const tickRef = useRef<number | null>(null);

  const labelsMap = useMemo(
    () =>
      Object.fromEntries(
        (bibleBooks || []).map((b: any) => [String(b.id || '').toUpperCase(), b.name])
      ),
    [bibleBooks]
  );

  const refresh = React.useCallback(() => {
    try {
      // ✅ NOUVEAU MOTEUR: Lecture-seulement des données session-based avec EMA
      const times = progress.getLiveTimes(); // Temps horodatés (pas d'intervalles JS)
      const otPB = progress.getTestamentPercent('OT'); // Calculs exacts par versets
      const ntPB = progress.getTestamentPercent('NT'); // Calculs exacts par versets
      const gPB = progress.getGlobalPercent(); // Progression déterministe
      const est = progress.getEstimates(); // Vitesse lissée EMA

      setAtTime(times.otSeconds);
      setNtTime(times.ntSeconds);
      setTotalBibleTime(times.globalSeconds);

      setAtPercent(otPB.percent);
      setNtPercent(ntPB.percent);
      setGlobalPercent(gPB.percent);

      const pace = est.paceVersesPerMin || 0;
      setPaceVpm(pace);

      // ✅ NOUVEAU: ETA précises du nouveau moteur (vitesses lissées EMA par testament)
      const atRemain = Math.max(0, otPB.verses.total - otPB.verses.read);
      const ntRemain = Math.max(0, ntPB.verses.total - ntPB.verses.read);
      const gRemain = atRemain + ntRemain;

      // Utilisation des ETA ultra-précises du nouveau moteur
      let atEstMin = pace > 0 ? Math.ceil(atRemain / pace) : 0;
      let ntEstMin = pace > 0 ? Math.ceil(ntRemain / pace) : 0;
      let gEstMin = pace > 0 ? Math.ceil(gRemain / pace) : 0;

      try {
        const preciseETA = progress.getETA();
        // Éviter les valeurs Infinity dans l'affichage
        atEstMin = isFinite(preciseETA.OTMin) ? Math.ceil(preciseETA.OTMin) : atEstMin;
        ntEstMin = isFinite(preciseETA.NTMin) ? Math.ceil(preciseETA.NTMin) : ntEstMin;
        gEstMin = isFinite(preciseETA.globalMin) ? Math.ceil(preciseETA.globalMin) : gEstMin;
        console.log('📊 ETA précises du moteur:', {
          OT: isFinite(preciseETA.OTMin) ? `${Math.ceil(preciseETA.OTMin)} min` : 'Calculé après première lecture',
          NT: isFinite(preciseETA.NTMin) ? `${Math.ceil(preciseETA.NTMin)} min` : 'Calculé après première lecture', 
          Global: isFinite(preciseETA.globalMin) ? `${Math.ceil(preciseETA.globalMin)} min` : 'Calculé après première lecture'
        });
      } catch {};

      setAtAgg({
        booksCompleted: otPB.booksCompleted,
        booksTotal: otPB.booksTotal,
        chaptersCompleted: otPB.chapters.completed,
        chaptersTotal: otPB.chapters.total,
        versesRead: otPB.verses.read,
        versesTotal: otPB.verses.total,
        estMin: atEstMin,
      });
      setNtAgg({
        booksCompleted: ntPB.booksCompleted,
        booksTotal: ntPB.booksTotal,
        chaptersCompleted: ntPB.chapters.completed,
        chaptersTotal: ntPB.chapters.total,
        versesRead: ntPB.verses.read,
        versesTotal: ntPB.verses.total,
        estMin: ntEstMin,
      });
      setGlobalEtaMin(gEstMin);

      const active = progress.getActiveBooks(labelsMap);
      const at = active.filter((x) => progress.getBookProgress(x.bookId)?.testament === 'OT');
      const nt = active.filter((x) => progress.getBookProgress(x.bookId)?.testament === 'NT');
      setAtActive(at);
      setNtActive(nt);

      if (!expandedTestament && active.length > 0) {
        const first = progress.getBookProgress(active[0].bookId);
        if (first?.testament) setExpandedTestament(first.testament);
      }
    } catch {}
  }, [labelsMap, expandedTestament]);

  useEffect(() => {
    if (!visible) return;
    refresh();
    tickRef.current = setInterval(refresh, 1000) as unknown as number;
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [visible, refresh]);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 120, friction: 8 }),
        Animated.timing(backdropAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: height, duration: 250, useNativeDriver: true }),
        Animated.timing(backdropAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start(() => setExpandedTestament(null));
    }
  }, [visible, slideAnim, backdropAnim]);

  const handleTestamentToggle = (t: 'OT' | 'NT') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedTestament(expandedTestament === t ? null : t);
  };

  const handleResetProgress = () => {
    Alert.alert(
      'Supprimer toutes les données',
      'Voulez-vous vraiment supprimer TOUTES vos statistiques de lecture ? Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Oui, tout supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await progress.resetAll();
              refresh();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert('Supprimé', 'Toutes vos données ont été supprimées.');
            } catch {
              Alert.alert('Erreur', 'Impossible de supprimer les données.');
            }
          },
        },
      ]
    );
  };

  const onContinue = async (ref: { book: string; chapter: number }) => {
    try {
      await navigateToChapter({ book: ref.book, chapter: ref.chapter });
      onClose();
    } catch {}
  };

  const onGoNext = async (ref: { book: string; chapter: number }) => {
    try {
      await navigateToChapter({ book: ref.book, chapter: ref.chapter });
      onClose();
    } catch {}
  };

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <View style={styles.container}>
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: backdropAnim }]}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1}>
            <BlurView intensity={20} tint={theme.dark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          style={[
            styles.modalContent,
            {
              backgroundColor: theme.colors.background,
              transform: [{ translateY: slideAnim }],
              marginTop: responsive.isTablet ? height * 0.05 : height * 0.1,
            },
          ]}
        >
          <SafeAreaView style={styles.safeArea}>
            <View style={[styles.header, { borderBottomColor: theme.colors.outline }]}>
              <View style={styles.headerLeft}>
                <Text
                  style={[
                    styles.headerTitle,
                    { color: theme.custom.colors.text, fontSize: responsive.isTablet ? 22 : 20 },
                  ]}
                >
                  📊 Votre Progression
                </Text>
                <Text style={[styles.headerSubtitle, { color: theme.custom.colors.placeholder }]}>
                  Suivi en direct (OT/NT/Global)
                </Text>
              </View>
              <View style={styles.headerButtons}>
                <TouchableOpacity
                  style={[styles.resetButton, { backgroundColor: theme.colors.error + '20' }]}
                  onPress={handleResetProgress}
                  accessibilityRole="button"
                >
                  <Feather name="trash-2" size={20} color={theme.colors.error} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.closeButton, { backgroundColor: theme.colors.surface }]}
                  onPress={onClose}
                  accessibilityRole="button"
                >
                  <Feather name="x" size={24} color={theme.custom.colors.text} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.overallProgress}>
              <View style={[styles.overallCard, { backgroundColor: theme.colors.surface }]}>
                <View style={styles.overallHeader}>
                  <View style={[styles.overallIcon, { backgroundColor: theme.colors.primary + '20' }]}>
                    <Feather name="trending-up" size={24} color={theme.colors.primary} />
                  </View>
                  <View style={styles.overallInfo}>
                    <Text style={[styles.overallTitle, { color: theme.custom.colors.text }]}>Progression Générale</Text>
                    <Text style={[styles.overallSubtitle, { color: theme.custom.colors.placeholder }]}>
                      Ancien + Nouveau Testament
                    </Text>
                  </View>
                  <Text style={[styles.overallPercentage, { color: theme.colors.primary }]}>
                    {Math.round(globalPercent)}%
                  </Text>
                </View>

                <View style={[styles.progressBar, { backgroundColor: theme.colors.outline + '30' }]}>
                  <View
                    style={[
                      styles.progressFill,
                      { backgroundColor: theme.colors.primary, width: `${Math.min(globalPercent, 100)}%` },
                    ]}
                  />
                </View>

                <View style={{ marginTop: 16, gap: 8 }}>
                  {/* Métriques alignées verticalement */}
                  <View style={{ gap: 6 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text style={[styles.metricLabel, { color: theme.custom.colors.text }]}>
                        📖 Temps de lecture
                      </Text>
                      <Text style={[styles.metricValue, { color: theme.colors.primary }]}>
                        {formatTime(totalBibleTime)}
                      </Text>
                    </View>
                    
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text style={[styles.metricLabel, { color: theme.custom.colors.text }]}>
                        ⏳ Estimation pour finir votre Bible
                      </Text>
                      <Text style={[styles.metricValue, { color: theme.colors.primary }]}>
                        {formatMinutes(globalEtaMin)}
                      </Text>
                    </View>
                    
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text style={[styles.metricLabel, { color: theme.custom.colors.text }]}>
                        ⚡ Vitesse moyenne
                      </Text>
                      <Text style={[styles.metricValue, { color: theme.colors.primary }]}>
                        {paceVpm > 0 ? `${paceVpm.toFixed(1)} versets/min` : 'En cours d\'analyse...'}
                      </Text>
                    </View>
                  </View>
                  
                  {/* Répartition OT/NT */}
                  <View style={{ 
                    marginTop: 8, 
                    paddingTop: 8, 
                    borderTopWidth: 1, 
                    borderTopColor: theme.custom.colors.border + '30',
                    flexDirection: 'row', 
                    justifyContent: 'center' 
                  }}>
                    <Text style={{ color: theme.custom.colors.text, opacity: 0.7, fontSize: 12 }}>
                      Ancien Testament {Math.round(atPercent)}% • Nouveau Testament {Math.round(ntPercent)}%
                    </Text>
                  </View>
                  
                  {globalEtaMin > 0 && (
                    <Text style={{ 
                      color: theme.custom.colors.text, 
                      opacity: 0.6, 
                      textAlign: 'center', 
                      fontSize: 11,
                      fontStyle: 'italic',
                      marginTop: 4
                    }}>
                      🎯 Objectif estimé : {formatETAdate(globalEtaMin)}
                    </Text>
                  )}
                </View>
              </View>
            </View>

            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <TestamentSection
                title="Ancien Testament"
                isExpanded={expandedTestament === 'OT'}
                onToggle={() => handleTestamentToggle('OT')}
                theme={theme}
                testamentTime={atTime}
                progressData={{
                  booksCompleted: atAgg.booksCompleted,
                  totalBooks: atAgg.booksTotal,
                  chaptersCompleted: atAgg.chaptersCompleted,
                  totalChapters: atAgg.chaptersTotal,
                  versesRead: atAgg.versesRead,
                  totalVerses: atAgg.versesTotal,
                  progressPercentage: atPercent,
                  totalTimeSpent: atTime,
                  estimatedMinutesRemaining: atAgg.estMin,
                }}
                activeBooks={atActive}
                onContinue={onContinue}
                onGoNext={onGoNext}
              />

              <TestamentSection
                title="Nouveau Testament"
                isExpanded={expandedTestament === 'NT'}
                onToggle={() => handleTestamentToggle('NT')}
                theme={theme}
                testamentTime={ntTime}
                progressData={{
                  booksCompleted: ntAgg.booksCompleted,
                  totalBooks: ntAgg.booksTotal,
                  chaptersCompleted: ntAgg.chaptersCompleted,
                  totalChapters: ntAgg.chaptersTotal,
                  versesRead: ntAgg.versesRead,
                  totalVerses: ntAgg.versesTotal,
                  progressPercentage: ntPercent,
                  totalTimeSpent: ntTime,
                  estimatedMinutesRemaining: ntAgg.estMin,
                }}
                activeBooks={ntActive}
                onContinue={onContinue}
                onGoNext={onGoNext}
              />
            </ScrollView>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  modalContent: { flex: 1, borderTopLeftRadius: 25, borderTopRightRadius: 25, overflow: 'hidden' },
  safeArea: { flex: 1 },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerLeft: { flex: 1 },
  headerTitle: { fontSize: 20, fontFamily: 'Nunito_700Bold' },
  headerSubtitle: { fontSize: 12, fontFamily: 'Nunito_400Regular', marginTop: 4, opacity: 0.8 },
  headerButtons: { flexDirection: 'row', gap: 8 },
  resetButton: {
    padding: 10, borderRadius: 10, elevation: 2, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2,
  },
  closeButton: {
    padding: 12, borderRadius: 12, elevation: 2, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2,
  },

  overallProgress: { padding: 20 },
  overallCard: {
    padding: 20, borderRadius: 20, elevation: 3, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 4,
  },
  overallHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  overallIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  overallInfo: { flex: 1 },
  overallTitle: { fontSize: 18, fontFamily: 'Nunito_700Bold' },
  overallSubtitle: { fontSize: 12, fontFamily: 'Nunito_400Regular', marginTop: 2 },
  overallPercentage: { fontSize: 24, fontFamily: 'Nunito_800ExtraBold' },
  progressBar: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },

  scrollView: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 0 },

  testamentSection: { marginBottom: 16 },
  testamentHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, borderRadius: 16, elevation: 2, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2,
  },
  testamentHeaderLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  testamentIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  testamentTitle: { fontSize: 16, fontFamily: 'Nunito_700Bold', flex: 1 },
  testamentHeaderRight: { flexDirection: 'row', alignItems: 'center' },
  testamentProgress: { fontSize: 16, fontFamily: 'Nunito_700Bold', marginRight: 8 },
  testamentContent: { marginTop: 8, padding: 16, borderRadius: 12 },

  metricsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  metricCard: {
    flex: 1, padding: 16, borderRadius: 12, alignItems: 'center', marginHorizontal: 4,
    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2,
  },
  metricNumber: { fontSize: 20, fontFamily: 'Nunito_800ExtraBold', marginBottom: 4 },
  testamentMetricLabel: { fontSize: 11, fontFamily: 'Nunito_600SemiBold', textAlign: 'center' },
  metricDescription: { fontSize: 9, fontFamily: 'Nunito_400Regular', textAlign: 'center', marginTop: 2, opacity: 0.7 },

  timeStats: { gap: 8 },
  timeStatItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 8 },
  timeStatTextContainer: { flex: 1, marginLeft: 8 },
  timeStatLabel: { fontSize: 12, fontFamily: 'Nunito_600SemiBold' },
  timeStatDescription: { fontSize: 9, fontFamily: 'Nunito_400Regular', marginTop: 1, opacity: 0.8 },
  timeStatValue: { fontSize: 14, fontFamily: 'Nunito_700Bold' },

  booksSection: { marginTop: 16 },
  booksSectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  booksIcon: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  booksSectionTitle: { fontSize: 14, fontFamily: 'Nunito_700Bold' },

  bookItem: {
    padding: 12, borderRadius: 8, marginBottom: 10, elevation: 1, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2,
  },
  bookHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  bookName: { fontSize: 14, fontFamily: 'Nunito_700Bold', flex: 1, marginRight: 10 },
  bookProgress: { fontSize: 14, fontFamily: 'Nunito_800ExtraBold' },
  bookProgressBar: { height: 4, borderRadius: 2, overflow: 'hidden', marginBottom: 8 },
  bookProgressFill: { height: '100%', borderRadius: 2 },
  bookStatsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  bookStat: { fontSize: 11, fontFamily: 'Nunito_400Regular' },
  encouragement: { padding: 10, borderRadius: 8, marginBottom: 10 },
  encouragementText: { fontSize: 12, fontFamily: 'Nunito_600SemiBold' },
  bookActions: { flexDirection: 'row', gap: 10 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  actionBtnText: { color: 'white', fontFamily: 'Nunito_700Bold', fontSize: 13 },
  // Nouveaux styles pour les métriques
  metricLabel: { 
    fontSize: 13, 
    fontFamily: 'Nunito_600SemiBold', 
    opacity: 0.9,
    flex: 1 
  },
  metricValue: { 
    fontSize: 13, 
    fontFamily: 'Nunito_700Bold',
    textAlign: 'right'
  },
});

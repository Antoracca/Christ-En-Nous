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
    estimatedMinutesRemaining: number;
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
    buttonState?: 'continuer' | 'reprendre' | 'terminer' | 'commencer';
    buttonText?: string;
    isCurrentlyActive?: boolean;
  }[];
  onContinue: (ref: { book: string; chapter: number }) => void;
  onGoNext: (ref: { book: string; chapter: number }) => void;
}

const formatTime = (seconds?: number) => {
  const s = Math.max(0, Math.floor(seconds ?? 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h} h ${m} min`;
  return `${m} min`;
};

const formatMinutes = (mins?: number) => {
  const m = Math.max(0, Math.floor(mins ?? 0));
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (h <= 0) return `${r} min`;
  return `${h} h ${r} min`;
};

const formatETAdate = (mins?: number) => {
  const m = Math.max(0, Math.floor(mins ?? 0));
  if (m === 0) return '—';
  const d = new Date(Date.now() + m * 60000);
  const months = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
  return `${d.getDate()} ${months[d.getMonth()]}`;
};

// ---------- Header réutilisable ----------
const SectionHeader = ({
  title,
  percent,
  expanded,
  onToggle,
  theme,
  icon = 'chevrons-right',
}: {
  title: string;
  percent?: number;
  expanded: boolean;
  onToggle: () => void;
  theme: any;
  icon?: keyof typeof Feather.glyphMap;
}) => (
  <TouchableOpacity
    accessibilityRole="button"
    onPress={onToggle}
    activeOpacity={0.85}
    style={[styles.sectionHeader, { backgroundColor: theme.colors.surface }]}
  >
    <View style={styles.sectionHeaderLeft}>
      <View style={[styles.sectionIcon, { backgroundColor: theme.colors.primary + '1A' }]}>
        <Feather name={icon} size={18} color={theme.colors.primary} />
      </View>
      <Text style={[styles.sectionTitle, { color: theme.custom.colors.text }]}>{title}</Text>
    </View>

    <View style={styles.sectionHeaderRight}>
      {typeof percent === 'number' && (
        <View style={[styles.badge, { backgroundColor: theme.colors.primary + '1A' }]}>
          <Text style={[styles.badgeText, { color: theme.colors.primary }]}>{Math.round(percent)}%</Text>
        </View>
      )}
      <Feather name={expanded ? 'chevron-up' : 'chevron-down'} size={20} color={theme.custom.colors.placeholder} />
    </View>
  </TouchableOpacity>
);

// ---------- Section Testament ----------
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
    <View style={styles.sectionCard}>
      <SectionHeader
        title={title}
        percent={progressData.progressPercentage}
        expanded={isExpanded}
        onToggle={onToggle}
        theme={theme}
        icon="book-open"
      />

      {isExpanded && (
        <View style={[styles.sectionBody, { backgroundColor: theme.colors.background }]}>
          <View style={styles.metricsRow}>
            <View style={[styles.metricTile, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.metricValueBig, { color: theme.colors.primary }]}>
                {progressData.booksCompleted}/{progressData.totalBooks}
              </Text>
              <Text style={[styles.metricLabelSmall, { color: theme.custom.colors.text }]}>Livres terminés</Text>
            </View>

            <View style={[styles.metricTile, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.metricValueBig, { color: theme.colors.secondary }]}>
                {progressData.chaptersCompleted}/{progressData.totalChapters}
              </Text>
              <Text style={[styles.metricLabelSmall, { color: theme.custom.colors.text }]}>Chapitres</Text>
            </View>

            <View style={[styles.metricTile, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.metricValueBig, { color: theme.colors.tertiary }]}>
                {progressData.versesRead}/{progressData.totalVerses}
              </Text>
              <Text style={[styles.metricLabelSmall, { color: theme.custom.colors.text }]}>Versets</Text>
            </View>
          </View>

          <View style={styles.chipsRow}>
            <View style={[styles.chip, { backgroundColor: theme.colors.surface }]}>
              <Feather name="clock" size={14} color={theme.colors.primary} />
              <Text style={[styles.chipText, { color: theme.custom.colors.text }]}>
                Temps dans {title} • {formatTime(testamentTime)}
              </Text>
            </View>

            <View style={[styles.chip, { backgroundColor: theme.colors.surface }]}>
              <Feather name="zap" size={14} color={theme.colors.secondary} />
              <Text style={[styles.chipText, { color: theme.custom.colors.text }]}>
                Reste estimé • {formatMinutes(progressData.estimatedMinutesRemaining)}
              </Text>
            </View>
          </View>

          {activeBooks.length > 0 && (
            <View style={{ marginTop: 12 }}>
              <View style={styles.inlineHeader}>
                <View style={[styles.inlineIcon, { backgroundColor: theme.colors.secondary + '1A' }]}>
                  <Feather name="play-circle" size={18} color={theme.colors.secondary} />
                </View>
                <Text style={[styles.inlineTitle, { color: theme.custom.colors.text }]}>
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
                        borderColor: b.isCompleted ? '#4CAF50' : theme.colors.outline + '30',
                        borderWidth: 1,
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
                        numberOfLines={1}
                      >
                        {b.bookName} — chap. {b.currentChapter}/{b.totalChapters}
                      </Text>

                      <View
                        style={[
                          styles.badge,
                          { backgroundColor: (b.isCompleted ? '#4CAF50' : theme.colors.primary) + '1A' },
                        ]}
                      >
                        <Text
                          style={[
                            styles.badgeText,
                            { color: b.isCompleted ? '#2E7D32' : theme.colors.primary, fontWeight: '900' },
                          ]}
                        >
                          {b.isCompleted ? '100' : Math.round(b.percent)}%
                        </Text>
                      </View>
                    </View>

                    <View style={[styles.progressBar, { backgroundColor: theme.colors.outline + '30' }]}>
                      <View
                        style={[
                          styles.progressFill,
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
                          style={[
                            styles.actionBtn,
                            {
                              backgroundColor:
                                b.buttonState === 'continuer'
                                  ? theme.colors.primary
                                  : b.buttonState === 'reprendre'
                                  ? '#FF9800'
                                  : '#4CAF50',
                            },
                          ]}
                          onPress={() => onContinue({ book: b.bookId, chapter: b.currentChapter })}
                        >
                          <Feather
                            name={
                              b.buttonState === 'continuer'
                                ? 'play'
                                : b.buttonState === 'reprendre'
                                ? 'rotate-ccw'
                                : 'play-circle'
                            }
                            size={16}
                            color="white"
                          />
                          <Text style={styles.actionBtnText}>{b.buttonText || 'Continuer'}</Text>
                          {b.isCurrentlyActive && <View style={styles.liveDot} />}
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

// ---------- Section Générale ----------
const GeneralSection = ({
  theme,
  expanded,
  onToggle,
  globalPercent,
  totalBibleTime,
  globalEtaMin,
  paceVpm,
  atAgg,
  ntAgg,
  atPercent,
  ntPercent,
}: {
  theme: any;
  expanded: boolean;
  onToggle: () => void;
  globalPercent: number;
  totalBibleTime: number;
  globalEtaMin: number;
  paceVpm: number;
  atAgg: any;
  ntAgg: any;
  atPercent: number;
  ntPercent: number;
}) => {
  return (
    <View style={styles.sectionCard}>
      <SectionHeader
        title="Progression générale"
        percent={globalPercent}
        expanded={expanded}
        onToggle={onToggle}
        theme={theme}
        icon="trending-up"
      />

      {expanded && (
        <View style={[styles.sectionBody, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.progressBar, { backgroundColor: theme.colors.outline + '30', marginTop: 4 }]}>
            <View
              style={[
                styles.progressFill,
                { backgroundColor: theme.colors.primary, width: `${Math.min(globalPercent, 100)}%` },
              ]}
            />
          </View>

          <View style={[styles.metricsRow, { marginTop: 12 }]}>
            <View style={[styles.metricTile, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.metricValueBig, { color: theme.colors.primary }]}>
                {atAgg.booksCompleted + ntAgg.booksCompleted}/{atAgg.booksTotal + ntAgg.booksTotal}
              </Text>
              <Text style={[styles.metricLabelSmall, { color: theme.custom.colors.text }]}>Livres</Text>
            </View>
            <View style={[styles.metricTile, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.metricValueBig, { color: theme.colors.secondary }]}>
                {atAgg.chaptersCompleted + ntAgg.chaptersCompleted}/{atAgg.chaptersTotal + ntAgg.chaptersTotal}
              </Text>
              <Text style={[styles.metricLabelSmall, { color: theme.custom.colors.text }]}>Chapitres</Text>
            </View>
            <View style={[styles.metricTile, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.metricValueBig, { color: theme.colors.tertiary }]}>
                {atAgg.versesRead + ntAgg.versesRead}/{atAgg.versesTotal + ntAgg.versesTotal}
              </Text>
              <Text style={[styles.metricLabelSmall, { color: theme.custom.colors.text }]}>Versets</Text>
            </View>
          </View>

          <View style={{ marginTop: 10, gap: 8 }}>
            <KpiRow theme={theme} label="📖 Temps de lecture" value={formatTime(totalBibleTime)} />
            <KpiRow theme={theme} label="⏳ Estimation pour finir la Bible" value={formatMinutes(globalEtaMin)} />
            <KpiRow
              theme={theme}
              label="⚡ Vitesse moyenne"
              value={paceVpm > 0 ? `${paceVpm.toFixed(1)} versets/min` : 'En cours d’analyse…'}
            />
          </View>

          <View style={divider(theme)} />

          <View style={styles.splitRow}>
            <View style={styles.splitCol}>
              <Text style={[styles.splitLabel, { color: theme.custom.colors.placeholder }]}>Ancien Testament</Text>
              <Text style={[styles.splitValue, { color: theme.colors.primary }]}>{Math.round(atPercent)}%</Text>
            </View>
            <View style={styles.splitCol}>
              <Text style={[styles.splitLabel, { color: theme.custom.colors.placeholder }]}>Nouveau Testament</Text>
              <Text style={[styles.splitValue, { color: theme.colors.secondary }]}>{Math.round(ntPercent)}%</Text>
            </View>
          </View>

          {globalEtaMin > 0 && (
            <Text style={[styles.etaHint, { color: theme.custom.colors.text }]}>
              🎯 Objectif estimé : {formatETAdate(globalEtaMin)}
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const KpiRow = ({ theme, label, value }: { theme: any; label: string; value: string }) => (
  <View style={styles.kpiRow}>
    <Text style={[styles.metricLabel, { color: theme.custom.colors.text }]}>{label}</Text>
    <Text style={[styles.metricValue, { color: theme.colors.primary }]}>{value}</Text>
  </View>
);

export default function BibleProgressModal({ visible, onClose }: BibleProgressModalProps) {
  const theme = useAppTheme();
  const responsive = useResponsiveSafe();
  const { bibleBooks, navigateToChapter, currentReference } = useBible();

  // → ouvertes par défaut
  const [expandedGeneral, setExpandedGeneral] = useState(true);
  const [expandedOT, setExpandedOT] = useState(true);
  const [expandedNT, setExpandedNT] = useState(true);
  const [expandedMethodology, setExpandedMethodology] = useState(true);

  const [globalPercent, setGlobalPercent] = useState(0);
  const [atPercent, setAtPercent] = useState(0);
  const [ntPercent, setNtPercent] = useState(0);

  const [totalBibleTime, setTotalBibleTime] = useState(0);
  const [atTime, setAtTime] = useState(0);
  const [ntTime, setNtTime] = useState(0);

  const [paceVpm, setPaceVpm] = useState(0);
  const [globalEtaMin, setGlobalEtaMin] = useState(0);

  const [atAgg, setAtAgg] = useState({
    booksCompleted: 0,
    booksTotal: 0,
    chaptersCompleted: 0,
    chaptersTotal: 0,
    versesRead: 0,
    versesTotal: 0,
    estMin: 0,
  });
  const [ntAgg, setNtAgg] = useState({
    booksCompleted: 0,
    booksTotal: 0,
    chaptersCompleted: 0,
    chaptersTotal: 0,
    versesRead: 0,
    versesTotal: 0,
    estMin: 0,
  });

  const [atActive, setAtActive] = useState<TestamentSectionProps['activeBooks']>([]);
  const [ntActive, setNtActive] = useState<TestamentSectionProps['activeBooks']>([]);

  const slideAnim = useRef(new Animated.Value(height)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const tickRef = useRef<number | null>(null);

  const labelsMap = useMemo(
    () => Object.fromEntries((bibleBooks || []).map((b: any) => [String(b.id || '').toUpperCase(), b.name])),
    [bibleBooks]
  );

  const refresh = React.useCallback(() => {
    try {
      const times = progress.getLiveTimes();
      const otPB = progress.getTestamentPercent('OT');
      const ntPB = progress.getTestamentPercent('NT');
      const gPB = progress.getGlobalPercent();
      const est = progress.getEstimates();

      setAtTime(times.otSeconds);
      setNtTime(times.ntSeconds);
      setTotalBibleTime(times.globalSeconds);

      setAtPercent(otPB.percent);
      setNtPercent(ntPB.percent);
      setGlobalPercent(gPB.percent);

      const pace = est.paceVersesPerMin || 0;
      setPaceVpm(pace);

      const atRemain = Math.max(0, otPB.verses.total - otPB.verses.read);
      const ntRemain = Math.max(0, ntPB.verses.total - ntPB.verses.read);
      const gRemain = atRemain + ntRemain;

      let atEstMin = pace > 0 ? Math.ceil(atRemain / pace) : 0;
      let ntEstMin = pace > 0 ? Math.ceil(ntRemain / pace) : 0;
      let gEstMin = pace > 0 ? Math.ceil(gRemain / pace) : 0;

      try {
        const preciseETA = progress.getETA();
        atEstMin = isFinite(preciseETA.OTMin) ? Math.ceil(preciseETA.OTMin) : atEstMin;
        ntEstMin = isFinite(preciseETA.NTMin) ? Math.ceil(preciseETA.NTMin) : ntEstMin;
        gEstMin = isFinite(preciseETA.globalMin) ? Math.ceil(preciseETA.globalMin) : gEstMin;
      } catch {}

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
    } catch {}
  }, [labelsMap]);

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
      ]).start();
    }
  }, [visible, slideAnim, backdropAnim]);

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
      // ✅ NOUVEAU: Différencier "Continuer" vs "Reprendre"
      const isCurrentlyReading = currentReference && 
                                 currentReference.book === ref.book && 
                                 currentReference.chapter === ref.chapter;
      
      if (isCurrentlyReading) {
        // CONTINUER = livre déjà ouvert → juste fermer le modal
        console.log('📖 Continuer la lecture (même livre) - fermeture modal uniquement');
        onClose();
      } else {
        // REPRENDRE = livre différent → navigation complète
        console.log('🔄 Reprendre la lecture (livre différent) - navigation complète');
        await navigateToChapter({
          book: ref.book, chapter: ref.chapter,
          end: undefined
        });
        onClose();
      }
    } catch (err) {
      console.error('Erreur lors de la continuation/reprise:', err);
      onClose();
    }
  };

  const onGoNext = async (ref: { book: string; chapter: number }) => {
    try {
      // ALLER AU CHAPITRE SUIVANT = toujours navigation complète
      console.log('➡️ Aller au chapitre suivant - navigation complète vers:', `${ref.book} ${ref.chapter}`);
      await navigateToChapter({
        book: ref.book, chapter: ref.chapter,
        end: undefined
      });
      onClose();
    } catch (err) {
      console.error('Erreur lors de la navigation vers chapitre suivant:', err);
      onClose();
    }
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
                  📊 Votre progression
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

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              {/* Progression générale */}
              <GeneralSection
                theme={theme}
                expanded={expandedGeneral}
                onToggle={() => setExpandedGeneral((v) => !v)}
                globalPercent={globalPercent}
                totalBibleTime={totalBibleTime}
                globalEtaMin={globalEtaMin}
                paceVpm={paceVpm}
                atAgg={atAgg}
                ntAgg={ntAgg}
                atPercent={atPercent}
                ntPercent={ntPercent}
              />

              {/* Ancien Testament */}
              <TestamentSection
                title="Ancien Testament"
                isExpanded={expandedOT}
                onToggle={() => setExpandedOT((v) => !v)}
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

              {/* Nouveau Testament */}
              <TestamentSection
                title="Nouveau Testament"
                isExpanded={expandedNT}
                onToggle={() => setExpandedNT((v) => !v)}
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

              {/* Comment ça marche ? */}
              <View style={[styles.sectionCard, { marginTop: 8 }]}>
                <SectionHeader 
                  title="Comment ça marche ? 🤔" 
                  expanded={expandedMethodology} 
                  onToggle={() => setExpandedMethodology(v => !v)} 
                  theme={theme} 
                  icon="help-circle" 
                />
                {expandedMethodology && (
                  <View style={[styles.methodologyContainer, { backgroundColor: theme.colors.surface + 'F0' }]}>
                    
                    {/* Section Suivi intelligent */}
                    <View style={[styles.methodCard, { backgroundColor: theme.colors.background }]}>
                      <Text style={[styles.methodCardTitle, { color: theme.colors.primary }]}>📊 Suivi intelligent de votre lecture</Text>
                      <Text style={[styles.methodCardText, { color: theme.custom.colors.text }]}>
                        Nous chronométrons précisément votre temps de lecture réel. Quand vous appuyez sur &quot;Suivant&quot;, nous validons que vous avez terminé le chapitre et comptabilisons votre temps de façon exacte.
                      </Text>
                    </View>

                    {/* Section Vitesse de lecture */}
                    <View style={[styles.methodCard, { backgroundColor: theme.colors.background }]}>
                      <Text style={[styles.methodCardTitle, { color: theme.colors.primary }]}>⚡ Calcul de votre vitesse personnelle</Text>
                      <Text style={[styles.methodCardText, { color: theme.custom.colors.text }]}>
                        Votre vitesse (versets/minute) s&apos;adapte intelligemment : nous lissons vos performances sur plusieurs chapitres pour obtenir votre rythme naturel, en ignorant les pauses ou moments d&apos;interruption.
                      </Text>
                    </View>

                    {/* Section Estimation */}
                    <View style={[styles.methodCard, { backgroundColor: theme.colors.background }]}>
                      <Text style={[styles.methodCardTitle, { color: theme.colors.primary }]}>🎯 Estimations personnalisées</Text>
                      <Text style={[styles.methodCardText, { color: theme.custom.colors.text }]}>
                        Le temps restant = versets qui vous restent ÷ votre vitesse personnelle. Plus vous lisez, plus les estimations deviennent précises et adaptées à votre style !
                      </Text>
                    </View>

                    {/* Section Confidentialité */}
                    <View style={[styles.methodCard, { backgroundColor: theme.colors.background }]}>
                      <Text style={[styles.methodCardTitle, { color: theme.colors.primary }]}>🔒 Vos données restent privées</Text>
                      <Text style={[styles.methodCardText, { color: theme.custom.colors.text }]}>
                        Par défaut, tout est stocké localement sur votre appareil. Aucune donnée n&apos;est envoyée en ligne sans votre autorisation explicite. Votre parcours spirituel vous appartient entièrement et reste confidentiel.
                      </Text>
                    </View>

                    {/* NOUVEAU : Section Synchronisation */}
                    <View style={[styles.methodCard, { backgroundColor: theme.colors.background }]}>
                      <Text style={[styles.methodCardTitle, { color: theme.colors.secondary }]}>☁️ Synchronisation en ligne (optionnelle)</Text>
                      <Text style={[styles.methodCardText, { color: theme.custom.colors.text }]}>
                        Vous pouvez choisir de synchroniser vos données pour partager votre parcours avec d&apos;autres frères et sœurs, accéder à vos statistiques depuis plusieurs appareils, et participer à la communauté. Cette fonctionnalité est entièrement optionnelle et sécurisée.
                      </Text>
                    </View>

                    {/* Note finale */}
                    <View style={[styles.finalNote, { backgroundColor: theme.colors.primary + '15', borderColor: theme.colors.primary + '40' }]}>
                      <Text style={[styles.finalNoteText, { color: theme.colors.primary }]}>
                        💡 Ces statistiques sont là pour vous encourager dans votre parcours avec la Parole de Dieu. L&apos;important n&apos;est pas la vitesse, mais la constance et la méditation ! 🙏
                      </Text>
                    </View>
                    
                  </View>
                )}
              </View>

              <View style={{ height: 16 }} />
            </ScrollView>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

// ---------- helper en dehors du StyleSheet (évite l’erreur TS 2322) ----------
const divider = (theme: any) => ({
  height: StyleSheet.hairlineWidth,
  backgroundColor: (theme?.custom?.colors?.border || '#000') + '30',
  marginTop: 12,
  marginBottom: 10,
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  modalContent: { flex: 1, borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden' },
  safeArea: { flex: 1 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerLeft: { flex: 1 },
  headerTitle: { fontSize: 20, fontFamily: 'Nunito_700Bold' },
  headerSubtitle: { fontSize: 12, fontFamily: 'Nunito_400Regular', marginTop: 2, opacity: 0.8 },
  headerButtons: { flexDirection: 'row', gap: 8 },
  resetButton: {
    padding: 10,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  closeButton: {
    padding: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },

  scrollView: { flex: 1 },
  scrollContent: { padding: 16, paddingTop: 12 },

  sectionCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  sectionHeaderLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  sectionHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  sectionTitle: { fontSize: 16, fontFamily: 'Nunito_700Bold', flex: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  badgeText: { fontSize: 12, fontFamily: 'Nunito_800ExtraBold' },

  sectionBody: { padding: 14 },

  metricsRow: { flexDirection: 'row', gap: 8 },
  metricTile: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    alignItems: 'center',
  },
  metricValueBig: { fontSize: 18, fontFamily: 'Nunito_800ExtraBold', marginBottom: 2 },
  metricLabelSmall: { fontSize: 11, fontFamily: 'Nunito_600SemiBold', opacity: 0.8 },

  chipsRow: { flexDirection: 'row', gap: 8, marginTop: 10, flexWrap: 'wrap' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
  },
  chipText: { fontSize: 12, fontFamily: 'Nunito_600SemiBold' },

  inlineHeader: { flexDirection: 'row', alignItems: 'center', marginTop: 10, marginBottom: 8 },
  inlineIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  inlineTitle: { fontSize: 14, fontFamily: 'Nunito_700Bold' },

  progressBar: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },

  bookItem: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  bookHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  bookName: { fontSize: 14, fontFamily: 'Nunito_700Bold', flex: 1, marginRight: 10 },
  bookStatsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  bookStat: { fontSize: 11, fontFamily: 'Nunito_400Regular' },
  encouragement: { padding: 10, borderRadius: 8, marginBottom: 10 },
  encouragementText: { fontSize: 12, fontFamily: 'Nunito_600SemiBold' },

  bookActions: { flexDirection: 'row', gap: 10 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionBtnText: { color: 'white', fontFamily: 'Nunito_700Bold', fontSize: 13 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4CAF50', marginLeft: 4 },

  splitRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  splitCol: { flex: 1, alignItems: 'center' },
  splitLabel: { fontSize: 11, fontFamily: 'Nunito_600SemiBold' },
  splitValue: { fontSize: 16, fontFamily: 'Nunito_800ExtraBold', marginTop: 2 },

  kpiRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  metricLabel: { fontSize: 13, fontFamily: 'Nunito_600SemiBold', opacity: 0.9, flex: 1 },
  metricValue: { fontSize: 13, fontFamily: 'Nunito_700Bold', textAlign: 'right' },

  etaHint: { fontSize: 11, fontFamily: 'Nunito_500Medium', textAlign: 'center', marginTop: 8, opacity: 0.7 },

  noteText: { fontSize: 12, lineHeight: 18, opacity: 0.85, fontFamily: 'Nunito_500Medium' },
  
  // Nouveaux styles pour la méthodologie
  methodologyContainer: {
    padding: 16,
    borderRadius: 12,
    margin: 4,
  },
  methodCard: {
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  methodCardTitle: { 
    fontSize: 14, 
    fontFamily: 'Nunito_700Bold', 
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center'
  },
  methodCardText: { 
    fontSize: 13, 
    lineHeight: 19, 
    fontFamily: 'Nunito_500Medium', 
    opacity: 0.9
  },
  finalNote: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  finalNoteText: {
    fontSize: 13,
    lineHeight: 20,
    fontFamily: 'Nunito_600SemiBold',
    textAlign: 'center',
  },
});

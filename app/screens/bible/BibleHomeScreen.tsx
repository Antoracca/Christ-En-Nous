import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Alert,
  UIManager,
  Platform,
  LayoutAnimation,
  Animated,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useBible } from '@/context/EnhancedBibleContext';
import { useResponsiveDesign } from '@/hooks/useResponsiveDesign';
import { LinearGradient } from 'expo-linear-gradient';

// Note: setLayoutAnimationEnabledExperimental est automatiquement activé dans la New Architecture
// if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
//   UIManager.setLayoutAnimationEnabledExperimental(true);
// }

const CardShell = ({
  children,
  gradient = false,
}: {
  children: React.ReactNode;
  gradient?: boolean;
}) => {
  const theme = useAppTheme();
  const responsive = useResponsiveDesign();
  const BORDER = (theme.custom?.colors?.border ?? '#000000') + '14';

  if (gradient) {
    // ↳ même style que PremiumCard avec prop `gradient`
    return (
      <LinearGradient
        colors={[theme.colors.primary + '12', theme.colors.primary + '08']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: responsive.components.borderRadius.lg,
          borderWidth: 1,
          borderColor: BORDER,
          overflow: 'hidden',
        }}
      >
        {children}
      </LinearGradient>
    );
  }

  // fallback “classique” si un jour tu ne veux pas de gradient
  return (
    <View
      style={{
        backgroundColor: theme.colors.surface,
        borderRadius: responsive.components.borderRadius.lg,
        borderWidth: 1,
        borderColor: BORDER,
        overflow: 'hidden',
      }}
    >
      {children}
    </View>
  );
};


/** ---------------------------------------------------------------------------------
 * HEADER — V2 | Style plus riche et animations staggérées
 * --------------------------------------------------------------------------------- */
const HeroHeader = () => {
  const theme = useAppTheme();
  const responsive = useResponsiveDesign();
  const isDark = theme.dark;

  // AMÉLIORATION: Couleurs plus profondes pour un look premium
  const ORANGE_MAIN = (theme.custom?.colors as any)?.warning ?? '#F59E0B';
  const ORANGE_DARK = '#D97706';
  const ORANGE_DEEP = '#78350F'; // Nouvelle couleur pour plus de contraste

  const TEXT_ON_ORANGE = '#FFFFFF';
  const SUBTEXT_ON_ORANGE = '#FFFFFFD9';

  // AMÉLIORATION: Animations staggérées pour un effet plus fluide
  const useStaggeredAnimation = (count = 3, duration = 250) => {
    const animatedValues = useRef(Array.from({ length: count }, () => new Animated.Value(0))).current;
    useEffect(() => {
      const animations = animatedValues.map(value =>
        Animated.timing(value, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        })
      );
      Animated.stagger(100, animations).start();
    }, [animatedValues, duration]);
    return animatedValues.map(val => ({
      opacity: val,
      transform: [{
        translateY: val.interpolate({ inputRange: [0, 1], outputRange: [12, 0] })
      }]
    }));
  };
  const [animIcon, animTitle, animPills] = useStaggeredAnimation(3);

  return (
    <View style={{ marginTop: 4, marginBottom: 24 }}>
      {/* AMÉLIORATION: La carte principale est maintenant le seul élément, plus besoin de ruban */}
      <LinearGradient
        colors={isDark ? [ORANGE_DARK, ORANGE_DEEP] : [ORANGE_MAIN, ORANGE_DARK]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: responsive.components.borderRadius.xl,
          overflow: 'hidden', // Important pour les effets de lueur
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: isDark ? 0.4 : 0.25,
          shadowRadius: 20,
          elevation: 10,
        }}
      >
        {/* AMÉLIORATION: Effet de lueur plus doux et coloré */}
        <View
          pointerEvents="none"
          style={{
            position: 'absolute', right: -80, top: -50,
            width: 200, height: 200, borderRadius: 100,
            backgroundColor: ORANGE_MAIN,
            opacity: 0.2,
          }}
        />
         <View
          pointerEvents="none"
          style={{
            position: 'absolute', left: -50, bottom: -100,
            width: 250, height: 250, borderRadius: 125,
            backgroundColor: ORANGE_DARK,
            opacity: 0.2,
          }}
        />

        {/* Contenu */}
        <View style={{ padding: responsive.components.cardPadding }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Animated.View style={[{
              width: responsive.components.iconSize.xl * 1.8, 
              height: responsive.components.iconSize.xl * 1.8, 
              borderRadius: responsive.components.borderRadius.md,
              backgroundColor: 'rgba(0,0,0,0.2)',
              justifyContent: 'center', alignItems: 'center',
              marginRight: 16,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.1)',
            }, animIcon]}>
              <Feather name="book-open" size={responsive.components.iconSize.lg} color={TEXT_ON_ORANGE} />
            </Animated.View>

            <View style={{ flex: 1 }}>
              <Animated.Text style={[{
                fontSize: responsive.fontSize.xl4, lineHeight: responsive.fontSize.xl4 * 1.2, letterSpacing: -1,
                fontFamily: 'Nunito_900Black', color: TEXT_ON_ORANGE,
              }, animTitle]}>
                Espace Biblique
              </Animated.Text>
            </View>
          </View>

          {/* AMÉLIORATION: Sous-titre modernisé avec des "Pills" */}
          <Animated.View style={[{ 
            flexDirection: 'row', alignItems: 'center', marginTop: 16, flexWrap: 'wrap' 
          }, animPills]}>
            {['Lire', 'Méditer', 'Progresser'].map((text, index) => (
              <React.Fragment key={text}>
                <View style={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  paddingVertical: responsive.spacing.xs, 
                  paddingHorizontal: responsive.spacing.sm, 
                  borderRadius: 99,
                }}>
                  <Text style={{ fontSize: responsive.fontSize.sm, fontFamily: 'Nunito_700Bold', color: SUBTEXT_ON_ORANGE }}>
                    {text}
                  </Text>
                </View>
                {index < 2 && (
                  <Feather name="chevron-right" size={responsive.components.iconSize.sm} color={SUBTEXT_ON_ORANGE} style={{ marginHorizontal: responsive.spacing.xs, opacity: 0.6 }} />
                )}
              </React.Fragment>
            ))}
          </Animated.View>
        </View>
      </LinearGradient>
    </View>
  );
};


/* -------------------------- BLOC UNIFIÉ : EXPLORER + VERSET DU JOUR -------------------------- */
const ExploreAndVerseCard = () => {
    const theme = useAppTheme();
    const responsive = useResponsiveDesign();
    const navigation = useNavigation();
    const isDark = theme.dark;
    const { dailyVerse } = useBible();

    // Couleurs
    const BORDER = isDark ? '#FFFFFF1A' : '#0000001A';
    const SURFACE = theme.colors.surface;
    const TEXT_PRIMARY = isDark ? '#F3F4F6' : '#111827';
    const TEXT_SECONDARY = isDark ? '#A0A0AC' : '#6B7280';
    const INPUT_BG = isDark ? '#FFFFFF0F' : '#00000009';

    // Animation d'apparition
    const fade = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.timing(fade, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
        }).start();
    }, [fade]);

    return (
        <Animated.View style={{ opacity: fade, marginBottom: 28 }}>
            <View style={{
                backgroundColor: SURFACE,
                borderRadius: responsive.components.borderRadius.xl,
                borderWidth: 1,
                borderColor: BORDER,
                shadowColor: '#000',
                shadowOpacity: isDark ? 0.2 : 0.05,
                shadowRadius: 15,
                shadowOffset: { width: 0, height: 5 },
                elevation: 5,
                overflow: 'hidden', // Important pour le contenu
            }}>
                
                {/* --- PARTIE 1 : RECHERCHE --- */}
                <View style={{ padding: responsive.spacing.md }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                        <View style={{
                            width: responsive.components.iconSize.xl, 
                            height: responsive.components.iconSize.xl, 
                            borderRadius: responsive.components.borderRadius.sm,
                            backgroundColor: theme.colors.primary + '22',
                            alignItems: 'center', justifyContent: 'center',
                            marginRight: 12,
                        }}>
                            <Feather name="compass" size={responsive.components.iconSize.sm} color={theme.colors.primary} />
                        </View>
                        <View>
                            <Text style={{ fontSize: responsive.fontSize.xl, fontFamily: 'Nunito_800ExtraBold', color: TEXT_PRIMARY }}>
                                Explorer la Bible
                            </Text>
                            <Text style={{ fontSize: responsive.fontSize.sm, fontFamily: 'Nunito_600SemiBold', color: TEXT_SECONDARY }}>
                                Trouvez un passage, un thème ou un mot.
                            </Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={() => navigation.navigate('BibleRecherche' as never)}
                        activeOpacity={0.8}
                        style={{
                            backgroundColor: INPUT_BG,
                            borderRadius: responsive.components.borderRadius.md,
                            padding: responsive.spacing.sm,
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}
                    >
                        <Feather name="search" size={responsive.components.iconSize.md} color={TEXT_SECONDARY} style={{ marginRight: responsive.spacing.sm }}/>
                        <Text style={{ flex: 1, fontSize: responsive.fontSize.base, fontFamily: 'Nunito_600SemiBold', color: TEXT_SECONDARY }}>
                            Rechercher...
                        </Text>
                        <View style={{
                            width: responsive.components.iconSize.xl, 
                            height: responsive.components.iconSize.xl, 
                            borderRadius: responsive.components.borderRadius.sm,
                            backgroundColor: theme.colors.primary,
                            justifyContent: 'center', alignItems: 'center',
                        }}>
                            <Feather name="arrow-right" size={responsive.components.iconSize.sm} color="#FFFFFF" />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* --- SÉPARATEUR --- */}
                <View style={{ height: 1, backgroundColor: BORDER, marginHorizontal: responsive.spacing.md }} />

                {/* --- PARTIE 2 : VERSET DU JOUR --- */}
                <TouchableOpacity activeOpacity={0.8} style={{ padding: responsive.spacing.md }}>
                    <Text style={{
                        position: 'absolute', right: 10, top: 10,
                        fontSize: responsive.fontSize.xl5 * 2.2, fontFamily: 'Nunito_900Black',
                        color: isDark ? '#FFFFFF0A' : '#0000000A',
                        lineHeight: 80,
                    }}>
                      “
                    </Text>

                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                      <Feather name="sunrise" size={responsive.components.iconSize.sm} color={TEXT_SECONDARY} style={{ marginRight: responsive.spacing.xs }}/>
                      <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 14, color: TEXT_SECONDARY }}>
                          Verset du jour
                      </Text>
                    </View>
                    <Text style={{
                      color: TEXT_PRIMARY,
                      fontFamily: 'Nunito_600SemiBold',
                      fontSize: 15, lineHeight: 22,
                      fontStyle: 'italic',
                      marginBottom: 8,
                      paddingRight: 16,
                    }} numberOfLines={3}>
                      {dailyVerse.verse}
                    </Text>
                    <Text style={{
                      color: TEXT_SECONDARY, fontFamily: 'Nunito_700Bold',
                      fontSize: 12, textAlign: 'right',
                    }}>
                      — {dailyVerse.reference}
                    </Text>
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
};




/* --------------------------- LECTURE + PROGRESSION -------------------------- */
/** 
 * Nouvel accordéon “Progression” avec aperçu empilé visible (cartes qui dépassent),
 * couleurs par métrique, chevron animé, LayoutAnimation pour l’ouverture/fermeture.
 */
const OuvrirBibleCard = () => {
  const theme = useAppTheme();
  const responsive = useResponsiveDesign();
  const navigation = useNavigation();
  const { userProgress } = useBible();

  // Données — avec fallback si le contexte ne fournit pas certains champs
  const booksRead = (userProgress as any)?.booksRead ?? 0;
  const versesRead = (userProgress as any)?.versesRead ?? 0;
  const progressPct = Math.round(userProgress.progressPercentage ?? 0);

  // État de l’accordéon
  const [expanded, setExpanded] = useState(false);
  const chevron = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(chevron, {
      toValue: expanded ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [expanded, chevron]);

  const rotate = chevron.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    setExpanded((v) => !v);
  };

  // Palette élégante par métrique
  const palette = {
    progress: { c: theme.colors.primary, bg: theme.colors.surface, icon: 'trending-up' as const, label: 'Progression', v: `${progressPct}%` },
    days:     { c: '#10B981', bg: '#10B9811A', icon: 'calendar' as const,       label: 'Jours consécutifs', v: String(userProgress.consecutiveDays ?? 0) },
    books:    { c: '#F59E0B', bg: '#F59E0B1A', icon: 'book-open' as const,      label: 'Livres lus',        v: String(booksRead) },
    chapters: { c: '#3B82F6', bg: '#3B82F61A', icon: 'book' as const,           label: 'Chapitres lus',     v: String(userProgress.chaptersRead ?? 0) },
    verses:   { c: '#8B5CF6', bg: '#8B5CF61A', icon: 'type' as const,           label: 'Versets lus',       v: String(versesRead) },
  };

  // Ordre décroissant (progression devant, puis le reste empilé derrière)
  const metricsOrder = ['progress', 'days', 'books', 'chapters', 'verses'] as const;

  // Couleurs pour l'effet de pile (actuellement non utilisées mais gardées pour évolution future)
  // const peekCardBg = theme.dark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';
  // const peekCardBorder = theme.dark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)';

  // Carte réutilisable pour les métriques
  const MetricCard = ({ mKey }: { mKey: keyof typeof palette }) => {
    const m = palette[mKey];
    const borderColor = m.bg === theme.colors.surface ? (theme.custom.colors.border + '33') : (m.c + '40');
    return (
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: m.bg, 
        borderRadius: responsive.components.borderRadius.md, 
        padding: responsive.spacing.sm, 
        borderWidth: 1, 
        borderColor: borderColor, 
        height: responsive.isPhone ? 60 : responsive.isTablet ? 70 : 80 
      }}>
        <View style={{ 
          width: responsive.components.iconSize.xl, 
          height: responsive.components.iconSize.xl, 
          borderRadius: responsive.components.borderRadius.sm, 
          backgroundColor: m.c, 
          alignItems: 'center', 
          justifyContent: 'center', 
          marginRight: responsive.spacing.sm 
        }}>
          <Feather name={m.icon} size={responsive.components.iconSize.sm} color="#FFF" />
        </View>
        <View style={{flex: 1}}>
          <Text style={{ fontFamily: 'Nunito_600SemiBold', color: theme.custom.colors.placeholder, fontSize: responsive.fontSize.sm }}>{m.label}</Text>
          <Text style={{ fontFamily: 'Nunito_800ExtraBold', color: m.c, fontSize: responsive.fontSize.lg, marginTop: -2 }}>{m.v}</Text>
        </View>
      </View>
    );
  };

return (
  <View style={{ marginBottom: 18 }}>
    <CardShell gradient>
      {/* PART 1: Lien vers le lecteur */}
      <TouchableOpacity
        onPress={() => navigation.navigate('BibleReader' as never)}
        activeOpacity={0.85}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: responsive.components.cardPadding,
          paddingBottom: responsive.spacing.sm,
        }}
      >
        <View
          style={{
            width: responsive.components.iconSize.xl * 1.5,
            height: responsive.components.iconSize.xl * 1.5,
            borderRadius: responsive.components.borderRadius.md,
            backgroundColor: theme.colors.primary + '1A',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12,
          }}
        >
          <Feather name="book-open" size={22} color={theme.colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: responsive.fontSize.xl, color: theme.custom.colors.text }}>
            Ouvrir la Bible
          </Text>
          <Text
            style={{ fontFamily: 'Nunito_400Regular', fontSize: responsive.fontSize.sm, color: theme.custom.colors.placeholder, marginTop: 2 }}
            numberOfLines={2}
          >
            Navigation fluide : livre → chapitre → verset.
          </Text>
        </View>
        <Feather name="arrow-right" size={responsive.components.iconSize.md} color={theme.custom.colors.placeholder} />
      </TouchableOpacity>

      {/* PART 2: Accordéon Progression */}
      <View style={{ paddingHorizontal: responsive.spacing.md, paddingBottom: responsive.spacing.md, paddingTop: responsive.spacing.xs }}>
        <View style={{ minHeight: expanded ? 350 : 72 }}>
          {/* Conteneur de la pile */}
          <View style={{ position: 'relative', width: '100%', height: 60 }}>
            {/* Cartes qui dépassent par le HAUT */}
            {!expanded && metricsOrder.slice(1, 4).reverse().map((key, revIndex) => {
              const index = 3 - revIndex;
              return (
                <View
                  key={key}
                  style={{
                    position: 'absolute',
                    top: (2 - index) * 5,
                    left: index * 4,
                    right: index * 4,
                    height: 60,
                    borderRadius: 14,
                    backgroundColor: theme.colors.surface,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 5 },
                    shadowOpacity: 0.27,
                    shadowRadius: 4.75,
                    elevation: 6,
                  }}
                />
              );
            })}

            {/* Carte principale cliquable */}
            <View style={{ position: 'absolute', top: 12, left: 0, width: '100%', zIndex: 100 }}>
              <TouchableOpacity onPress={toggleExpand} activeOpacity={0.9}>
                <MetricCard mKey="progress" />
                <Animated.View
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 12,
                    bottom: 0,
                    justifyContent: 'center',
                    transform: [{ rotate }],
                  }}
                >
                  <Feather name="chevron-down" size={24} color={palette.progress.c} />
                </Animated.View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Liste dépliée */}
          {expanded && (
            <View style={{ marginTop: 8 }}>
              {metricsOrder.slice(1).map(key => (
                <View key={key} style={{ marginTop: 8 }}>
                  <MetricCard mKey={key} />
                </View>
              ))}
            </View>
          )}
        </View>

        {expanded && (
          <Text style={{ marginTop: 12, fontSize: 12, fontFamily: 'Nunito_600SemiBold', color: theme.custom.colors.placeholder, lineHeight: 20 }}>
            Nourrissez votre âme pour ne pas être affamé. Ces indicateurs se remplissent automatiquement dès que vous activez un plan de lecture.
          </Text>
        )}
      </View>
    </CardShell>
  </View>
);

};

/* --------------------------- MÉDITATION (nouvel accordéon) -------------------------- */
const MeditationProgressCard = () => {
  const theme = useAppTheme();
  const responsive = useResponsiveDesign();
  const navigation = useNavigation();
  const { userProgress } = useBible();

  // Données de méditation (avec fallback)
  const meditationsCount = userProgress.meditationsCount ?? 0;
  const meditationStreak = (userProgress as any).meditationStreak ?? 0;
  const totalMeditationTime = (userProgress as any).totalMeditationTime ?? 0;

  // État de l’accordéon
  const [expanded, setExpanded] = useState(false);
  const chevron = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(chevron, {
      toValue: expanded ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [expanded, chevron]);

  const rotate = chevron.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    setExpanded((v) => !v);
  };

  // Palette pour la méditation
  const palette = {
    sessions: { c: theme.colors.primary, bg: theme.colors.surface, icon: 'coffee' as const, label: 'Méditations terminées', v: String(meditationsCount) },
    streak:   { c: '#10B981', bg: '#10B9811A', icon: 'calendar' as const, label: 'Jours consécutifs', v: String(meditationStreak) },
    time:     { c: '#3B82F6', bg: '#3B82F61A', icon: 'clock' as const, label: 'Minutes totales', v: String(totalMeditationTime) },
  };

  const metricsOrder = ['sessions', 'streak', 'time'] as const;

  const MetricCard = ({ mKey }: { mKey: keyof typeof palette }) => {
    const m = palette[mKey];
    const borderColor = m.bg === theme.colors.surface ? (theme.custom.colors.border + '33') : (m.c + '40');
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: m.bg, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: borderColor, height: 60 }}>
        <View style={{ 
          width: responsive.components.iconSize.xl, 
          height: responsive.components.iconSize.xl, 
          borderRadius: responsive.components.borderRadius.sm, 
          backgroundColor: m.c, 
          alignItems: 'center', 
          justifyContent: 'center', 
          marginRight: responsive.spacing.sm 
        }}>
          <Feather name={m.icon} size={responsive.components.iconSize.sm} color="#FFF" />
        </View>
        <View style={{flex: 1}}>
          <Text style={{ fontFamily: 'Nunito_600SemiBold', color: theme.custom.colors.placeholder, fontSize: responsive.fontSize.sm }}>{m.label}</Text>
          <Text style={{ fontFamily: 'Nunito_800ExtraBold', color: m.c, fontSize: responsive.fontSize.lg, marginTop: -2 }}>{m.v}</Text>
        </View>
      </View>
    );
  };

  return (
    <CardShell gradient>
      {/* PART 1: Lien vers les méditations */}
      <TouchableOpacity
        onPress={() => navigation.navigate('BibleMeditation' as never)}
        activeOpacity={0.85}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: responsive.components.cardPadding,
          paddingBottom: responsive.spacing.sm,
        }}
      >
        <View
          style={{
            width: responsive.components.iconSize.xl * 1.5,
            height: responsive.components.iconSize.xl * 1.5,
            borderRadius: responsive.components.borderRadius.md,
            backgroundColor: theme.colors.primary + '1A',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12,
          }}
        >
          <Feather name="coffee" size={22} color={theme.colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: responsive.fontSize.xl, color: theme.custom.colors.text }}>
            Méditations quotidiennes
          </Text>
          <Text
            style={{ fontFamily: 'Nunito_400Regular', fontSize: responsive.fontSize.sm, color: theme.custom.colors.placeholder, marginTop: 2 }}
            numberOfLines={2}
          >
            Des temps courts pour lire, réfléchir et prier.
          </Text>
        </View>
        <Feather name="arrow-right" size={responsive.components.iconSize.md} color={theme.custom.colors.placeholder} />
      </TouchableOpacity>

      {/* PART 2: Accordéon Progression Méditation */}
      <View style={{ paddingHorizontal: responsive.spacing.md, paddingBottom: responsive.spacing.md, paddingTop: responsive.spacing.xs }}>
        <View style={{ minHeight: expanded ? 210 : 72 }}>
          {/* Conteneur de la pile */}
          <View style={{ position: 'relative', width: '100%', height: 60 }}>
            {/* Cartes qui dépassent */}
            {!expanded && metricsOrder.slice(1, 3).reverse().map((key, revIndex) => {
              const index = 2 - revIndex;
              return (
                <View
                  key={key}
                  style={{
                    position: 'absolute',
                    top: (2 - index) * 5,
                    left: index * 4,
                    right: index * 4,
                    height: 60,
                    borderRadius: 14,
                    backgroundColor: theme.colors.surface,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 5 },
                    shadowOpacity: 0.27,
                    shadowRadius: 4.75,
                    elevation: 6,
                  }}
                />
              );
            })}

            {/* Carte principale cliquable */}
            <View style={{ position: 'absolute', top: 12, left: 0, width: '100%', zIndex: 100 }}>
              <TouchableOpacity onPress={toggleExpand} activeOpacity={0.9}>
                <MetricCard mKey="sessions" />
                <Animated.View style={{ position: 'absolute', top: 0, right: 12, bottom: 0, justifyContent: 'center', transform: [{ rotate }] }}>
                  <Feather name="chevron-down" size={24} color={palette.sessions.c} />
                </Animated.View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Liste dépliée */}
          {expanded && (
            <View style={{ marginTop: 8 }}>
              {metricsOrder.slice(1).map(key => (
                <View key={key} style={{ marginTop: 8 }}>
                  <MetricCard mKey={key} />
                </View>
              ))}

              <Text style={{ marginTop: 12, fontSize: 12, fontFamily: 'Nunito_600SemiBold', color: theme.custom.colors.placeholder, lineHeight: 20 }}>
                Prenez un moment pour vous recentrer, quelles que soient les circonstances. Votre progression se mettra à jour dès que vous commencerez et évoluera en fonction du temps passé.
              </Text>
            </View>
          )}
        </View>
      </View>
    </CardShell>
  );
};

/* --------------------------- MÉDITATION -------------------------- */
const MeditationSection = () => {
  const theme = useAppTheme();
  const responsive = useResponsiveDesign();

  return (
    <View style={{ marginBottom: 28 }}>
      <Text style={{ fontSize: 20, fontFamily: 'Nunito_700Bold', color: theme.custom.colors.text, marginBottom: 6 }}>
        Méditation & Réflexion
      </Text>
      <Text style={{ fontSize: 14, fontFamily: 'Nunito_400Regular', color: theme.custom.colors.placeholder, marginBottom: 12 }}>
        Approfondissez et mettez en pratique la Parole.
      </Text>
      <MeditationProgressCard />
    </View>
  );
};

/* --------------------------- APPRENTISSAGE (nouvel accordéon) -------------------------- */
const LearningProgressCard = () => {
  const theme = useAppTheme();
  const responsive = useResponsiveDesign();
  const navigation = useNavigation();
  const { userProgress } = useBible();

  // Données d'apprentissage (avec fallback)
  const modulesCompleted = userProgress.learningModulesCompleted ?? 0;
  const quizzesPassed = (userProgress as any).quizzesPassed ?? 0;
  const certificatesEarned = (userProgress as any).certificatesEarned ?? 0;

  // État de l’accordéon
  const [expanded, setExpanded] = useState(false);
  const chevron = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(chevron, {
      toValue: expanded ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [expanded, chevron]);

  const rotate = chevron.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    setExpanded((v) => !v);
  };

  // Palette pour l'apprentissage
  const palette = {
    modules:    { c: theme.colors.primary, bg: theme.colors.surface, icon: 'award' as const, label: 'Modules terminés', v: String(modulesCompleted) },
    quizzes:    { c: '#10B981', bg: '#10B9811A', icon: 'check-square' as const, label: 'Quizz réussis', v: String(quizzesPassed) },
    certs:      { c: '#3B82F6', bg: '#3B82F61A', icon: 'shield' as const, label: 'Certificats', v: String(certificatesEarned) },
  };

  const metricsOrder = ['modules', 'quizzes', 'certs'] as const;

  const MetricCard = ({ mKey }: { mKey: keyof typeof palette }) => {
    const m = palette[mKey];
    const borderColor = m.bg === theme.colors.surface ? (theme.custom.colors.border + '33') : (m.c + '40');
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: m.bg, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: borderColor, height: 60 }}>
        <View style={{ 
          width: responsive.components.iconSize.xl, 
          height: responsive.components.iconSize.xl, 
          borderRadius: responsive.components.borderRadius.sm, 
          backgroundColor: m.c, 
          alignItems: 'center', 
          justifyContent: 'center', 
          marginRight: responsive.spacing.sm 
        }}>
          <Feather name={m.icon} size={responsive.components.iconSize.sm} color="#FFF" />
        </View>
        <View style={{flex: 1}}>
          <Text style={{ fontFamily: 'Nunito_600SemiBold', color: theme.custom.colors.placeholder, fontSize: responsive.fontSize.sm }}>{m.label}</Text>
          <Text style={{ fontFamily: 'Nunito_800ExtraBold', color: m.c, fontSize: responsive.fontSize.lg, marginTop: -2 }}>{m.v}</Text>
        </View>
      </View>
    );
  };

  return (
    <CardShell gradient>
      {/* PART 1: Lien vers les cours */}
      <TouchableOpacity
        onPress={() => navigation.navigate('BibleLearning' as never)}
        activeOpacity={0.85}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: responsive.components.cardPadding,
          paddingBottom: responsive.spacing.sm,
        }}
      >
        <View
          style={{
            width: responsive.components.iconSize.xl * 1.5,
            height: responsive.components.iconSize.xl * 1.5,
            borderRadius: responsive.components.borderRadius.md,
            backgroundColor: theme.colors.primary + '1A',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12,
          }}
        >
          <Feather name="award" size={22} color={theme.colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: responsive.fontSize.xl, color: theme.custom.colors.text }}>
            Cours & Apprentissage
          </Text>
          <Text
            style={{ fontFamily: 'Nunito_400Regular', fontSize: responsive.fontSize.sm, color: theme.custom.colors.placeholder, marginTop: 2 }}
            numberOfLines={2}
          >
            Parcours guidés, notions, exemples, exercices avec l’assistant IA.
          </Text>
        </View>
        <Feather name="arrow-right" size={responsive.components.iconSize.md} color={theme.custom.colors.placeholder} />
      </TouchableOpacity>

      {/* PART 2: Accordéon Progression Apprentissage */}
      <View style={{ paddingHorizontal: responsive.spacing.md, paddingBottom: responsive.spacing.md, paddingTop: responsive.spacing.xs }}>
        <View style={{ minHeight: expanded ? 210 : 72 }}>
          {/* Conteneur de la pile */}
          <View style={{ position: 'relative', width: '100%', height: 60 }}>
            {/* Cartes qui dépassent */}
            {!expanded && metricsOrder.slice(1, 3).reverse().map((key, revIndex) => {
              const index = 2 - revIndex;
              return (
                <View
                  key={key}
                  style={{
                    position: 'absolute',
                    top: (2 - index) * 5,
                    left: index * 4,
                    right: index * 4,
                    height: 60,
                    borderRadius: 14,
                    backgroundColor: theme.colors.surface,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 5 },
                    shadowOpacity: 0.27,
                    shadowRadius: 4.75,
                    elevation: 6,
                  }}
                />
              );
            })}

            {/* Carte principale cliquable */}
            <View style={{ position: 'absolute', top: 12, left: 0, width: '100%', zIndex: 100 }}>
              <TouchableOpacity onPress={toggleExpand} activeOpacity={0.9}>
                <MetricCard mKey="modules" />
                <Animated.View style={{ position: 'absolute', top: 0, right: 12, bottom: 0, justifyContent: 'center', transform: [{ rotate }] }}>
                  <Feather name="chevron-down" size={24} color={palette.modules.c} />
                </Animated.View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Liste dépliée */}
          {expanded && (
            <View style={{ marginTop: 8 }}>
              {metricsOrder.slice(1).map(key => (
                <View key={key} style={{ marginTop: 8 }}>
                  <MetricCard mKey={key} />
                </View>
              ))}
            </View>
          )}
        </View>

        {expanded && (
          <Text style={{ marginTop: 12, fontSize: 12, fontFamily: 'Nunito_600SemiBold', color: theme.custom.colors.placeholder, lineHeight: 20 }}>
            Approfondissez vos connaissances à votre rythme. Ces indicateurs se remplissent automatiquement à la fin de chaque module.
          </Text>
        )}
      </View>
    </CardShell>
  );
};

/* --------------------------- APPRENTISSAGE -------------------------- */
const LearningSection = () => {
  const theme = useAppTheme();
  const responsive = useResponsiveDesign();

  return (
    <View style={{ marginBottom: 28 }}>
      <Text style={{ fontSize: 20, fontFamily: 'Nunito_700Bold', color: theme.custom.colors.text, marginBottom: 6 }}>
        Apprentissage
      </Text>
      <Text style={{ fontSize: 14, fontFamily: 'Nunito_400Regular', color: theme.custom.colors.placeholder, marginBottom: 12 }}>
        Parcours guidés, notions, exemples, exercices avec l’assistant IA.
      </Text>
      <LearningProgressCard />
    </View>
  );
};


/* ------------------------- Premium “list card” (modern) --------------------- */
const PremiumCard = ({
  icon,
  title,
  description,
  onPress,
  badge,
  gradient,
  featured,
  rightElement,
}: {
  icon: React.ComponentProps<typeof Feather>['name'];
  title: string;
  description?: string;
  onPress: () => void;
  badge?: string;
  gradient?: boolean;
  featured?: boolean;
  rightElement?: React.ReactNode;
}) => {
  const theme = useAppTheme();
  const responsive = useResponsiveDesign();

  const Content = () => (
    <View style={{ flexDirection: 'row', alignItems: 'center', padding: responsive.components.cardPadding }}>
      <View
        style={{
          width: responsive.components.iconSize.xl * 1.5,
          height: responsive.components.iconSize.xl * 1.5,
          borderRadius: responsive.components.borderRadius.sm,
          backgroundColor: featured ? theme.colors.primary + '1A' : theme.colors.primary + '1A',
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 12,
        }}
      >
        <Feather name={icon} size={responsive.components.iconSize.lg} color={theme.colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: responsive.fontSize.xl, color: theme.custom.colors.text }}>{title}</Text>
          {badge && (
            <View style={{ backgroundColor: theme.colors.primary, paddingHorizontal: responsive.spacing.xs, paddingVertical: 2, borderRadius: 999, marginLeft: responsive.spacing.xs }}>
              <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: responsive.fontSize.xs, color: '#FFFFFF', textTransform: 'uppercase' }}>{badge}</Text>
            </View>
          )}
        </View>
        {description ? (
          <Text style={{ fontFamily: 'Nunito_400Regular', fontSize: responsive.fontSize.sm, color: theme.custom.colors.placeholder, marginTop: 4 }} numberOfLines={3}>
            {description}
          </Text>
        ) : null}
      </View>
      {rightElement || <Feather name="chevron-right" size={responsive.components.iconSize.md} color={theme.custom.colors.placeholder} />}
    </View>
  );

  if (gradient) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={{ marginBottom: responsive.spacing.sm }}>
        <LinearGradient
          colors={[theme.colors.primary + '12', theme.colors.primary + '08']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: responsive.components.borderRadius.md,
            borderWidth: 1,
            borderColor: (theme.custom.colors.border ?? '#000000') + '14',
          }}
        >
          <Content />
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={{ marginBottom: 12 }}>
      <View
        style={{
          backgroundColor: theme.colors.surface,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: (theme.custom.colors.border ?? '#000000') + '14',
        }}
      >
        <Content />
      </View>
    </TouchableOpacity>
  );
};

/* ------------------------------- MAIN SCREEN -------------------------------- */
export default function BibleHomeScreen() {
  const theme = useAppTheme();
  const responsive = useResponsiveDesign();
  const navigation = useNavigation();
  const handleSoon = (f: string) => Alert.alert('Bientôt disponible', `"${f}" arrive très bientôt.`, [{ text: 'OK' }]);
  

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.dark ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />
      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          {
            paddingHorizontal: responsive.layout.sideMargins,
            maxWidth: responsive.layout.maxContentWidth,
            alignSelf: 'center',
            width: '100%'
          }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* 1) Header minimal, sans fond */}
        <HeroHeader />

        <ExploreAndVerseCard />

        {/* 4) Lecture de la Bible + progression intégrée (accordéon “stack”) */}
        <View style={{ marginBottom: responsive.spacing.sm }}>
          <Text style={{ fontSize: responsive.fontSize.xl2, fontFamily: 'Nunito_700Bold', color: theme.custom.colors.text, marginBottom: responsive.spacing.xs }}>
            Lecture de la Bible
          </Text>
          <Text style={{ fontSize: responsive.fontSize.base, fontFamily: 'Nunito_400Regular', color: theme.custom.colors.placeholder, marginBottom: responsive.spacing.sm }}>
            Plongez dans les Écritures et découvrez la richesse de la Parole de Dieu.
          </Text>
          <OuvrirBibleCard />
        </View>

        {/* 5) Méditation & Réflexion */}
        <MeditationSection />

        {/* 6) Apprentissage */}
        <LearningSection />

        {/* 7) Inspiration & Communauté */}
<View style={{ marginBottom: responsive.spacing.xl2 }}>
  <Text
    style={{
      fontSize: responsive.fontSize.xl2,
      fontFamily: 'Nunito_700Bold',
      color: theme.custom.colors.text,
      marginBottom: responsive.spacing.xs,
    }}
  >
    Inspiration/Force & Communauté
  </Text>

  <Text
    style={{
      fontSize: responsive.fontSize.base,
      fontFamily: 'Nunito_400Regular',
      color: theme.custom.colors.placeholder,
      marginBottom: responsive.spacing.sm,
    }}
  >
    Paroles d’encouragement et pratiques à vivre ensemble.
  </Text>

  {/* → même “background” que Plans & Défis : on passe gradient */}
  <PremiumCard
    icon="message-circle"
    title="Paroles d’encouragement"
    description="Des lectures brèves qui relèvent quand c’est lourd."
    onPress={() => handleSoon('Paroles d’encouragement')}
    gradient
  />

  <PremiumCard
    icon="users"
    title="Méditer à deux, trois ou plusieurs"
    description={"Partagez des passages et priez ensemble en ligne comme si c'était en présentiel."}
    onPress={() => handleSoon('Méditation communautaire')}
    gradient
  />
</View>


        {/* 8) Plans & Défis */}
        <View style={{ marginBottom: responsive.spacing.xl2 }}>
          <Text style={{ fontSize: responsive.fontSize.xl2, fontFamily: 'Nunito_700Bold', color: theme.custom.colors.text, marginBottom: responsive.spacing.xs }}>
            Plans & Défis
          </Text>
          <Text style={{ fontSize: responsive.fontSize.base, fontFamily: 'Nunito_400Regular', color: theme.custom.colors.placeholder, marginBottom: responsive.spacing.sm }}>
            Thématiques, 30 jours, parcours 1 an — choisissez votre cadence.
          </Text>

          <PremiumCard
            icon="calendar"
            title="Découvrir les plans"
            description="Activez un plan pour suivre jours, chapitres et pourcentage de progression."
            onPress={() => navigation.navigate('BiblePlan' as never)}
            gradient
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------------------------------- STYLES --------------------------------- */
const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContainer: { 
    paddingTop: 10, 
    paddingBottom: 50, 
    // paddingHorizontal sera défini dynamiquement via le responsive hook
  },
});

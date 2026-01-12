// app/screens/bible/BibleReaderSettingsScreen.tsx
import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useResponsiveSafe } from '@/context/ResponsiveContext';
import { useBible } from '@/context/EnhancedBibleContext';

/* -------------------------------------------------------------------------- */
/*                               TYPE ASSIST (TS)                             */
/* -------------------------------------------------------------------------- */
// On caste légèrement l'API du contexte pour éviter de casser le build
// si "settings"/"updateSettings" ne sont pas encore exposés.
// Remplace par tes vrais types quand prêts.

type FontChoice = 'default' | 'serif' | 'mono';

type BibleSettingsApi = {
  currentVersion?: { name?: string } | null;
  settings?: {
    reader?: {
      fontSize?: number;
      lineHeight?: number;
      fontFamily?: FontChoice;
    };
  };
  updateSettings?: (partial: {
    reader?: Partial<{
      fontSize: number;
      lineHeight: number;
      fontFamily: FontChoice;
    }>;
  }) => void;
};

/* -------------------------------------------------------------------------- */
/*                               MAIN COMPONENT                               */
/* -------------------------------------------------------------------------- */

const BibleReaderSettingsScreen = () => {
  const theme = useAppTheme();
  const responsive = useResponsiveSafe();
  const bible = useBible() as unknown as BibleSettingsApi; // voir le type ci-dessus
  const tabBarHeight = useBottomTabBarHeight();

  // Source of truth (SI dispo) => settings du contexte
  const ctxFontSize = bible.settings?.reader?.fontSize ?? 16;
  const ctxLineHeight = bible.settings?.reader?.lineHeight ?? 1.6;
  const ctxFontFamily = bible.settings?.reader?.fontFamily ?? 'default';

  // État local pour prévisualiser sans spammer le contexte (anti-scintillement)
  const [fontSize, setFontSize] = useState<number>(ctxFontSize);
  const [lineHeight, setLineHeight] = useState<number>(ctxLineHeight);
  const [fontFamily, setFontFamily] = useState<FontChoice>(ctxFontFamily);

  // Debounce léger sur l'application contextuelle
  const applyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const safeApply = (payload: Partial<{ fontSize: number; lineHeight: number; fontFamily: FontChoice }>) => {
    if (applyTimer.current) clearTimeout(applyTimer.current);
    applyTimer.current = setTimeout(() => {
      bible.updateSettings?.({ reader: payload });
    }, 120);
  };

  const getCurrentVersionName = () => {
    if (bible.currentVersion && typeof bible.currentVersion === 'object' && bible.currentVersion.name) {
      return bible.currentVersion.name;
    }
    return 'Bible J.N. Darby';
  };

  const handleFontFamilyChange = () => {
    const fontOptions: FontChoice[] = ['default', 'serif', 'mono'];
    const currentIndex = fontOptions.indexOf(fontFamily);
    const nextIndex = (currentIndex + 1) % fontOptions.length;
    const next = fontOptions[nextIndex];
    setFontFamily(next);
    safeApply({ fontFamily: next });
  };

  const previewFontFamily = useMemo(() => {
    switch (fontFamily) {
      case 'serif':
        return 'Times New Roman';
      case 'mono':
        return 'Courier New';
      default:
        return 'Nunito_400Regular';
    }
  }, [fontFamily]);

  const SettingItem: React.FC<{
    title: string;
    subtitle?: string;
    icon: keyof typeof Feather.glyphMap | string;
    children: React.ReactNode;
  }> = ({ title, subtitle, icon, children }) => (
    <View style={[styles.settingItem, { backgroundColor: theme.colors.surface }]}> 
      <View style={styles.settingHeader}>
        <Feather name={icon as any} size={20} color={theme.colors.primary} />
        <View style={styles.settingTitles}>
          <Text style={[styles.settingTitle, { color: theme.custom.colors.text }]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.settingSubtitle, { color: theme.custom.colors.placeholder }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.settingContent}>{children}</View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <StatusBar
        barStyle={theme.dark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: tabBarHeight + 24 }}
      >
        <View
          style={[
            styles.content,
            {
              paddingHorizontal: responsive.isTablet ? responsive.spacing.lg : responsive.spacing.md,
            },
          ]}
        >
          {/* -------------------------------- Mode lecture (placeholder) -------------------------------- */}
          <SettingItem
            title="Mode lecture"
            subtitle="Lecture immersive : masquage de l'interface, défilement auto, mode nuit intelligent. (Pas de réglage de luminosité ici)"
            icon="eye"
          >
            <View style={[styles.ghostBadge, { borderColor: theme.custom.colors.border }]}>
              <Text style={[styles.ghostText, { color: theme.custom.colors.placeholder }]}>Fonctionnalité à venir</Text>
            </View>
          </SettingItem>

          {/* -------------------------------- Police de caractères -------------------------------- */}
          <SettingItem
            title="Police de caractères"
            subtitle={`Actuellement : ${
              fontFamily === 'default'
                ? 'Nunito (Sans-Serif)'
                : fontFamily === 'serif'
                ? 'Times New Roman (Serif)'
                : 'Courier New (Monospace)'
            }`}
            icon="font"
          >
            <TouchableOpacity
              onPress={handleFontFamilyChange}
              style={[styles.actionChip, { borderColor: theme.colors.primary }]}
            >
              <Text style={[styles.actionChipText, { color: theme.colors.primary }]}>Changer</Text>
            </TouchableOpacity>
          </SettingItem>

          {/* -------------------------------- Taille du texte -------------------------------- */}
          <SettingItem title="Taille du texte" subtitle={`${fontSize}px`} icon="type">
            <View style={styles.sliderWithPreviewContainer}>
              <View style={[styles.textPreview, { borderColor: theme.custom.colors.border }]}> 
                <Text
                  style={{
                    color: theme.custom.colors.text,
                    fontSize,
                    fontFamily: previewFontFamily,
                    textAlign: 'center',
                  }}
                >
                  Car Dieu a tant aimé le monde
                </Text>
              </View>

              <View style={styles.sliderContainer}>
                <Text style={[styles.sliderLabel, { color: theme.custom.colors.placeholder }]}>12</Text>
                <Slider
                  style={styles.slider}
                  value={fontSize}
                  minimumValue={12}
                  maximumValue={28}
                  step={1}
                  onValueChange={setFontSize}
                  onSlidingComplete={(value: number) => {
                    const v = Math.round(value || 16);
                    setFontSize(v);
                    safeApply({ fontSize: v });
                  }}
                  minimumTrackTintColor={theme.colors.primary}
                  maximumTrackTintColor={theme.custom.colors.border}
                  thumbTintColor={theme.colors.primary}
                />
                <Text style={[styles.sliderLabel, { color: theme.custom.colors.placeholder }]}>28</Text>
              </View>
            </View>
          </SettingItem>

          {/* -------------------------------- Interligne -------------------------------- */}
          <SettingItem title="Interligne" subtitle={`${lineHeight.toFixed(1)}`} icon="align-justify">
            <View style={styles.sliderWithPreviewContainer}>
              <View style={[styles.textPreview, { borderColor: theme.custom.colors.border }]}> 
                <Text
                  style={{
                    color: theme.custom.colors.text,
                    fontSize: 14,
                    lineHeight: 14 * lineHeight,
                    fontFamily: previewFontFamily,
                    textAlign: 'center',
                  }}
                >
                  Car Dieu a tant aimé le monde{"\n"}qu&apos;il a donné son Fils unique
                </Text>
              </View>

              <View style={styles.sliderContainer}>
                <Text style={[styles.sliderLabel, { color: theme.custom.colors.placeholder }]}>1.0</Text>
                <Slider
                  style={styles.slider}
                  value={lineHeight}
                  minimumValue={1.0}
                  maximumValue={2.0}
                  step={0.1}
                  onValueChange={setLineHeight}
                  onSlidingComplete={(value: number) => {
                    const v = Math.round((value || 1.6) * 10) / 10;
                    setLineHeight(v);
                    safeApply({ lineHeight: v });
                  }}
                  minimumTrackTintColor={theme.colors.primary}
                  maximumTrackTintColor={theme.custom.colors.border}
                  thumbTintColor={theme.colors.primary}
                />
                <Text style={[styles.sliderLabel, { color: theme.custom.colors.placeholder }]}>2.0</Text>
              </View>
            </View>
          </SettingItem>

          {/* -------------------------------- Fonctionnalités à venir -------------------------------- */}
          <Text style={[styles.sectionTitle, { color: theme.custom.colors.text, marginTop: 32, marginBottom: 16 }]}>Fonctionnalités à venir</Text>

          <SettingItem
            title="Annotations et surlignage"
            subtitle="Surligner des versets, ajouter des notes perso, collections thématiques"
            icon="edit-3"
          >
            <View style={[styles.ghostBadge, { borderColor: theme.custom.colors.border }]}> 
              <Text style={[styles.ghostText, { color: theme.custom.colors.placeholder }]}>À venir bientôt</Text>
            </View>
          </SettingItem>

          <SettingItem
            title="Plans de lecture"
            subtitle="Guides quotidiens, chronologique, thèmes spécifiques, suivi"
            icon="calendar"
          >
            <View style={[styles.ghostBadge, { borderColor: theme.custom.colors.border }]}> 
              <Text style={[styles.ghostText, { color: theme.custom.colors.placeholder }]}>À venir bientôt</Text>
            </View>
          </SettingItem>

          <SettingItem
            title="Audio et prononciation"
            subtitle="Lecture audio des versets, noms bibliques"
            icon="headphones"
          >
            <View style={[styles.ghostBadge, { borderColor: theme.custom.colors.border }]}> 
              <Text style={[styles.ghostText, { color: theme.custom.colors.placeholder }]}>À venir bientôt</Text>
            </View>
          </SettingItem>

          {/* -------------------------------- Version courant -------------------------------- */}
          <SettingItem title="Version de la Bible" subtitle="Version actuellement utilisée" icon="book">
            <Text style={[styles.versionName, { color: theme.colors.primary }]}>{getCurrentVersionName()}</Text>
          </SettingItem>

          {/* -------------------------------- Actions -------------------------------- */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.secondaryBtn, { borderColor: theme.custom.colors.border }]}
              onPress={() => {
                setFontSize(16);
                setLineHeight(1.6);
                setFontFamily('default');
                bible.updateSettings?.({ reader: { fontSize: 16, lineHeight: 1.6, fontFamily: 'default' } });
              }}
            >
              <Text style={[styles.secondaryBtnText, { color: theme.custom.colors.text }]}>Réinitialiser</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: theme.colors.primary }]}
              onPress={() => {
                bible.updateSettings?.({ reader: { fontSize, lineHeight, fontFamily } });
              }}
            >
              <Text style={styles.primaryBtnText}>Appliquer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

/* -------------------------------------------------------------------------- */
/*                                    CSS                                     */
/* -------------------------------------------------------------------------- */

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  content: { paddingVertical: 16 },

  settingItem: {
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  settingHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  settingTitles: { flex: 1, marginLeft: 12 },
  settingTitle: { fontSize: 16, fontFamily: 'Nunito_600SemiBold' },
  settingSubtitle: { fontSize: 13, fontFamily: 'Nunito_400Regular', marginTop: 2 },
  settingContent: { marginTop: 8 },

  sliderContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  slider: { flex: 1, marginHorizontal: 12 },
  sliderLabel: { fontSize: 12, fontFamily: 'Nunito_400Regular', minWidth: 30, textAlign: 'center' },

  actionChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-end',
    borderWidth: 1,
  },
  actionChipText: { fontSize: 14, fontFamily: 'Nunito_600SemiBold' },

  ghostBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: 'flex-end',
    borderStyle: 'dashed',
  },
  ghostText: { fontSize: 14, fontFamily: 'Nunito_600SemiBold', fontStyle: 'italic' },

  sliderWithPreviewContainer: { marginTop: 8 },
  textPreview: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
  },

  sectionTitle: { fontSize: 18, fontFamily: 'Nunito_700Bold', marginLeft: 4 },
  versionName: { fontSize: 14, fontFamily: 'Nunito_600SemiBold', textAlign: 'right' },

  actionsRow: { flexDirection: 'row', gap: 12, justifyContent: 'flex-end', marginTop: 8 },
  secondaryBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, borderWidth: 1 },
  secondaryBtnText: { fontSize: 14, fontFamily: 'Nunito_600SemiBold' },
  primaryBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  primaryBtnText: { fontSize: 14, fontFamily: 'Nunito_700Bold', color: 'white' },
});

export default BibleReaderSettingsScreen;

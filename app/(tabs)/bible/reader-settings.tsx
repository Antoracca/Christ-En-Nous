// app/screens/bible/BibleReaderSettingsScreen.tsx
import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useResponsiveSafe } from '@/context/ResponsiveContext';
import { useBible } from '@/context/EnhancedBibleContext';

/* -------------------------------------------------------------------------- */
/*                               MAIN COMPONENT                               */
/* -------------------------------------------------------------------------- */

const BibleReaderSettingsScreen = () => {
  const theme = useAppTheme();
  const responsive = useResponsiveSafe();
  const { settings, updateSettings, currentVersion } = useBible(); 
  const tabBarHeight = useBottomTabBarHeight();

  // Initialisation unique
  const initialSettings = useRef({
      fontSize: settings.fontSize || 16,
      lineHeight: settings.lineHeight || 1.6,
      fontFamily: settings.fontFamily || 'default'
  }).current;

  // État local
  const [fontSize, setFontSize] = useState<number>(initialSettings.fontSize);
  const [lineHeight, setLineHeight] = useState<number>(initialSettings.lineHeight);
  const [fontFamily, setFontFamily] = useState<string>(initialSettings.fontFamily);

  const handleApply = () => {
      updateSettings({ fontSize, lineHeight, fontFamily });
      Alert.alert("Succès", "Paramètres de lecture appliqués.");
  };

  const handleFontFamilyChange = () => {
    const fontOptions = ['default', 'serif', 'mono'];
    const currentIndex = fontOptions.indexOf(fontFamily);
    const nextIndex = (currentIndex + 1) % fontOptions.length;
    const next = fontOptions[nextIndex];
    setFontFamily(next);
  };

  const previewFontFamily = useMemo(() => {
    switch (fontFamily) {
      case 'serif': return 'Times New Roman';
      case 'mono': return 'Courier New';
      default: return 'Nunito_400Regular';
    }
  }, [fontFamily]);

  const SettingItem: React.FC<{
    title: string;
    subtitle?: string;
    icon: keyof typeof Feather.glyphMap;
    children: React.ReactNode;
  }> = ({ title, subtitle, icon, children }) => (
    <View style={[styles.settingItem, { backgroundColor: theme.colors.surface }]}> 
      <View style={styles.settingHeader}>
        <Feather name={icon} size={20} color={theme.colors.primary} />
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

  // Composant Stepper interne
  const Stepper = ({ value, onDecrease, onIncrease, format }: any) => (
      <View style={[styles.stepperContainer, { borderColor: theme.custom.colors.border }]}>
          <TouchableOpacity onPress={onDecrease} style={styles.stepperBtn} activeOpacity={0.7}>
              <Feather name="minus" size={20} color={theme.colors.onSurface} />
          </TouchableOpacity>
          <View style={[styles.stepperValueContainer, { borderLeftColor: theme.custom.colors.border, borderRightColor: theme.custom.colors.border }]}>
              <Text style={[styles.stepperValue, { color: theme.colors.primary }]}>{format ? format(value) : value}</Text>
          </View>
          <TouchableOpacity onPress={onIncrease} style={styles.stepperBtn} activeOpacity={0.7}>
              <Feather name="plus" size={20} color={theme.colors.onSurface} />
          </TouchableOpacity>
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
          {/* -------------------------------- Mode lecture -------------------------------- */}
          <SettingItem
            title="Mode lecture"
            subtitle="Lecture immersive : masquage de l'interface."
            icon="eye"
          >
            <View style={[styles.ghostBadge, { borderColor: theme.custom.colors.border }]}>
              <Text style={[styles.ghostText, { color: theme.custom.colors.placeholder }]}>Bientôt disponible</Text>
            </View>
          </SettingItem>

          {/* -------------------------------- Police -------------------------------- */}
          <SettingItem
            title="Police de caractères"
            subtitle={`Actuellement : ${ 
              fontFamily === 'default' ? 'Nunito' : fontFamily === 'serif' ? 'Serif' : 'Monospace'
            }`}
            icon="type"
          >
            <TouchableOpacity
              onPress={handleFontFamilyChange}
              style={[styles.actionChip, { borderColor: theme.colors.primary }]}            >
              <Text style={[styles.actionChipText, { color: theme.colors.primary }]}>Changer</Text>
            </TouchableOpacity>
          </SettingItem>

          {/* -------------------------------- Taille (STEPPER) -------------------------------- */}
          <SettingItem title="Taille du texte" subtitle={`${fontSize}px`} icon="maximize-2">
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

              <Stepper 
                  value={fontSize} 
                  onDecrease={() => setFontSize(Math.max(12, fontSize - 1))}
                  onIncrease={() => setFontSize(Math.min(32, fontSize + 1))}
                  format={(v: number) => `${v} px`}
              />
            </View>
          </SettingItem>

          {/* -------------------------------- Interligne (STEPPER) -------------------------------- */}
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

              <Stepper 
                  value={lineHeight} 
                  onDecrease={() => setLineHeight(Math.max(1.0, Number((lineHeight - 0.1).toFixed(1))))}
                  onIncrease={() => setLineHeight(Math.min(2.5, Number((lineHeight + 0.1).toFixed(1))))}
                  format={(v: number) => v.toFixed(1)}
              />
            </View>
          </SettingItem>

          {/* -------------------------------- Version de la Bible -------------------------------- */}
          <SettingItem title="Version de la Bible" subtitle="Version actuellement utilisée" icon="book">
            <Text style={[styles.versionName, { color: theme.colors.primary }]}>{getCurrentVersionName()}</Text>
          </SettingItem>

          {/* -------------------------------- Actions -------------------------------- */}
          <View style={[styles.actionsRow, { marginBottom: 40 }]}> 
            <TouchableOpacity
              style={[styles.secondaryBtn, { borderColor: theme.custom.colors.border }]}              onPress={() => {
                setFontSize(16);
                setLineHeight(1.6);
                setFontFamily('default');
                updateSettings({ fontSize: 16, lineHeight: 1.6, fontFamily: 'default' });
                Alert.alert("Info", "Paramètres réinitialisés par défaut.");
              }}
            >
              <Text style={[styles.secondaryBtnText, { color: theme.custom.colors.text }]}>Réinitialiser</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: theme.colors.primary }]}              onPress={handleApply}
            >
              <Text style={styles.primaryBtnText}>Appliquer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

// Fonction helper pour le nom de version si manquant
const getCurrentVersionName = () => 'Bible J.N. Darby'; // Placeholder simple

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

  // STEPPER STYLES
  stepperContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderRadius: 12,
      height: 48,
      marginTop: 8,
      overflow: 'hidden'
  },
  stepperBtn: {
      width: 50,
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.02)'
  },
  stepperValueContainer: {
      flex: 1,
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      borderLeftWidth: 1,
      borderRightWidth: 1,
  },
  stepperValue: { fontSize: 16, fontFamily: 'Nunito_800ExtraBold' },

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

  versionName: { fontSize: 14, fontFamily: 'Nunito_600SemiBold', textAlign: 'right' },

  actionsRow: { flexDirection: 'row', gap: 12, justifyContent: 'flex-end', marginTop: 32 },
  secondaryBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, borderWidth: 1 },
  secondaryBtnText: { fontSize: 14, fontFamily: 'Nunito_600SemiBold' },
  primaryBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  primaryBtnText: { fontSize: 14, fontFamily: 'Nunito_700Bold', color: 'white' },
});

export default BibleReaderSettingsScreen;
// app/screens/bible/BibleVersionSelectorScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useBible } from '@/context/EnhancedBibleContext';
import { useResponsiveSafe } from '@/context/ResponsiveContext';
import { bibleService } from '@/services/bible';

interface BibleVersionGroup {
  title: string;
  versions: any[];
  icon: string;
  flag: string;
}

export default function BibleVersionSelectorScreen() {
  const theme = useAppTheme();
  const responsive = useResponsiveSafe();
  const router = useRouter();
  const { 
    currentVersion, 
    setCurrentVersion, 
    navigateToChapter,
    userProgress,
    updateSettings
  } = useBible();

  // Header styling configured in parent layout

  const [loading, setLoading] = useState(true);
  const [changingVersion, setChangingVersion] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [versionGroups, setVersionGroups] = useState<BibleVersionGroup[]>([]);
  const [defaultVersionId, setDefaultVersionId] = useState<string | null>(null);

  // Charger les versions au montage
  useEffect(() => {
    loadVersions();
  }, []);

  const loadVersions = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Chargement des versions de Bible...');

      // Charger la version par défaut
      const defaultId = await bibleService.getDefaultVersion();
      setDefaultVersionId(defaultId);
      console.log('📌 Version par défaut identifiée:', defaultId);

      // Charger toutes les versions séparément et marquer la version par défaut
      const [frenchVersions, englishVersions, africanVersions] = await Promise.all([
        loadFrenchVersions(),
        loadEnglishVersions(),
        loadAfricanVersions()
      ]);
      
      // Marquer la version par défaut dans chaque groupe
      const markDefaultInVersions = (versions: any[]) => 
        versions.map(v => ({ ...v, isDefault: v.id === defaultId }));
      
      const frenchWithDefault = markDefaultInVersions(frenchVersions);
      const englishWithDefault = markDefaultInVersions(englishVersions);
      const africanWithDefault = markDefaultInVersions(africanVersions);

      setVersionGroups([
        {
          title: 'Versions Françaises',
          versions: frenchWithDefault.slice(0, 10),
          icon: 'book-open',
          flag: '🇫🇷'
        },
        {
          title: 'Versions Anglaises',
          versions: englishWithDefault.slice(0, 10),
          icon: 'book-open',
          flag: '🇺🇸'
        },
        {
          title: 'Langue Nationale',
          versions: africanWithDefault,
          icon: 'book-open',
          flag: '🇨🇫'
        }
      ]);

      console.log(`✅ ${frenchWithDefault.length} versions françaises et ${englishWithDefault.length} versions anglaises chargées avec marquage défaut`);

    } catch (err) {
      console.error('❌ Erreur lors du chargement des versions:', err);
      setError('Impossible de charger les versions. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
    }
  };

  const loadFrenchVersions = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300)); // Délai pour éviter le spam API
      const response = await bibleService.getVersions('fra');
      
      console.log('🔍 Versions françaises récupérées:', response?.length || 0);
      
      if (!response || response.length === 0) {
        console.warn('⚠️ Aucune version française de l\'API, utilisation du fallback');
        return [{
          id: 'a93a92589195411f-01',
          name: 'Bible J.N. Darby',
          abbreviation: 'DARBY',
          language: 'French',
          description: 'Bible J.N. Darby (Français)',
          isDefault: true,
        }];
      }
      
      return response;
    } catch (error) {
      console.warn('❌ Erreur versions françaises:', error);
      return [{
        id: 'a93a92589195411f-01',
        name: 'Bible J.N. Darby',
        abbreviation: 'DARBY',
        language: 'French',
        description: 'Bible J.N. Darby (Français)',
        isDefault: true,
      }];
    }
  };

  const loadEnglishVersions = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Délai pour éviter rate limiting
      const response = await bibleService.getVersions('eng');
      
      console.log('🔍 Versions anglaises récupérées:', response?.length || 0);
      
      if (!response || response.length === 0) {
        console.warn('⚠️ Aucune version anglaise de l\'API, utilisation du fallback');
        return [
          {
            id: 'de4e12af7f28f599-02',
            name: 'King James Version',
            abbreviation: 'KJV',
            language: 'English',
            description: 'King James Version',
          },
          {
            id: 'english-niv',
            name: 'New International Version',
            abbreviation: 'NIV',
            language: 'English',
            description: 'New International Version',
          }
        ];
      }

      // Retourner toutes les versions à partir du service (déjà filtrées)
      return response.slice(0, 10);
    } catch (error) {
      console.warn('❌ Erreur versions anglaises:', error);
      return [
        {
          id: 'de4e12af7f28f599-02',
          name: 'King James Version',
          abbreviation: 'KJV',
          language: 'English',
          description: 'King James Version',
        }
      ];
    }
  };

  const loadAfricanVersions = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 700)); // Délai pour éviter rate limiting
      
      // Récupérer les versions Sango depuis l'API
      const sangoVersions = await bibleService.getVersions('sag');
      console.log('🇨🇫 Versions Sango récupérées:', sangoVersions);
      
      // Retourner uniquement les versions Sango (langue nationale de Centrafrique)
      const africanVersions = [...sangoVersions];
      
      console.log(`🇨🇫 ${africanVersions.length} version(s) Sango chargée(s)`);
      return africanVersions;
      
    } catch (error) {
      console.warn('❌ Erreur versions africaines:', error);
      // Fallback en cas d'erreur - uniquement le Sango
      return [
        {
          id: 'sango-fallback',
          name: 'Mbeti ti Nzapa - Sängö',
          abbreviation: 'MNF2010',
          language: 'Sango',
          description: 'Bible en Sango - Société Biblique de Centrafrique (2010)',
          isAvailable: false,
          comingSoon: true
        }
      ];
    }
  };

  const handleVersionChange = useCallback(async (version: any) => {
    try {
      // 🚫 Empêcher la sélection de la même version
      if (version.id === currentVersion.id) {
        console.log('⚡ Version déjà sélectionnée, aucune action nécessaire');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        return; // Sortir directement sans rien faire
      }

      setChangingVersion(version.id);
      console.log('🔄 CHANGEMENT DE VERSION:');
      console.log('  - Ancienne version:', currentVersion.name, '(ID:', currentVersion.id, ')');
      console.log('  - Nouvelle version:', version.name, '(ID:', version.id, ')');
      
      // Délai pour éviter le spam API
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Changer la version (avec await pour la persistance)
      await setCurrentVersion({
        id: version.id,
        name: version.name,
        abbrev: version.abbreviation,
        language: version.language.includes('French') ? 'fr' : 'en'
      });

      // Recharger le chapitre actuel dans la nouvelle version
      if (userProgress.currentBook && userProgress.currentChapter) {
        console.log('🔄 Rechargement du chapitre dans la nouvelle version...');
        await navigateToChapter({
          book: userProgress.currentBook,
          chapter: userProgress.currentChapter,
          verse: userProgress.currentVerse
        });
      }

      // Feedback haptique
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Recharger la version par défaut actuelle pour s'assurer de la synchronisation
      const currentDefaultId = await bibleService.getDefaultVersion();
      setDefaultVersionId(currentDefaultId);
      console.log('🔄 Version par défaut rechargée:', currentDefaultId);
      
      // Message de succès avec options (avec defaultVersionId mis à jour)
      showSuccessMessage(version, currentDefaultId);

    } catch (error) {
      console.error('❌ Erreur lors du changement de version:', error);
      
      let errorMessage = `Une erreur s'est produite lors du chargement de "${version.name}".\n\nVeuillez essayer une autre version ou réessayer plus tard.`;
      let errorTitle = 'Version indisponible';
      
      if (error instanceof Error) {
        if (error.message.includes('network') || error.message.includes('timeout')) {
          errorMessage = `Impossible de charger "${version.name}" en raison d'un problème de connexion.\n\nVérifiez votre réseau et réessayez, ou choisissez une autre version.`;
          errorTitle = 'Problème de connexion';
        } else if (error.message.includes('rate limit')) {
          errorMessage = `Trop de requêtes en cours.\n\nVeuillez patienter quelques instants avant de réessayer "${version.name}".`;
          errorTitle = 'Limite atteinte';
        } else if (error.message.includes('HTTP 404') || error.message.includes('not found')) {
          errorMessage = `La version "${version.name}" n'est pas disponible actuellement.\n\nVeuillez choisir une autre version.`;
          errorTitle = 'Version non trouvée';
        }
      }
      
      Alert.alert(
        errorTitle,
        errorMessage,
        [
          {
            text: 'Choisir autre version',
            style: 'cancel'
          },
          {
            text: 'Réessayer',
            onPress: () => handleVersionChange(version)
          }
        ]
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setChangingVersion(null);
    }
  }, [userProgress, navigateToChapter, setCurrentVersion]);

  const handleComingSoonVersion = useCallback((version: any) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    
    // Message spécial pour les versions Sango
    if (version.language === 'Sango') {
      Alert.alert(
        '🇨🇫 Bible en Sango',
        `"${version.name}" existe mais n'est pas encore disponible dans API.Bible.\n\n📱 Vous pouvez l'utiliser dès maintenant sur :\n• YouVersion Bible App\n• Bible.is (Faith Comes By Hearing)\n\n🔄 Nous travaillons sur l'intégration avec d'autres sources bibliques.\n\n📝 En attendant, utilisez la Bible J.N. Darby en français.`,
        [
          {
            text: 'Plus tard',
            style: 'cancel'
          },
          {
            text: 'Télécharger YouVersion',
            onPress: () => {
              console.log('Redirection vers YouVersion pour Sango');
              // TODO: Ouvrir le store ou l'app YouVersion
            }
          }
        ]
      );
    } else {
      // Message standard pour les autres langues
      Alert.alert(
        '🕰️ Version à venir',
        `"${version.name}" sera bientôt disponible !\n\n🚧 En cours de développement\n🚀 Disponible dans les prochaines mises à jour\n\n📝 Pour l'instant, vous pouvez utiliser la Bible J.N. Darby en français ou les versions anglaises disponibles.`,
        [
          {
            text: 'OK',
            style: 'default'
          }
        ]
      );
    }
  }, []);


  const showSuccessMessage = (version: any, actualDefaultId?: string) => {
    // 🔍 Utiliser la version par défaut passée en paramètre ou celle stockée
    const currentDefaultId = actualDefaultId || defaultVersionId;
    const isSelectingDefaultVersion = version.id === currentDefaultId;
    
    console.log('🔍 Analyse du changement de version:');
    console.log('  - Version sélectionnée:', version.name, '(ID:', version.id, ')');
    console.log('  - Version courante précédente:', currentVersion.name, '(ID:', currentVersion.id, ')');
    console.log('  - Version par défaut actuelle:', currentDefaultId);
    console.log('  - Sélectionne la version par défaut?', isSelectingDefaultVersion);
    
    if (isSelectingDefaultVersion) {
      // ✅ Retour ou activation de la version par défaut - pas de question
      Alert.alert(
        '✅ Version par défaut activée',
        `La Bible "${version.name}" est maintenant active.\n\n📌 Cette version est votre version par défaut configurée.`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
      return;
    }
    
    const message = `La Bible "${version.name}" est maintenant active.\n\n🔄 Voulez-vous également la définir comme votre version par défaut ?\n\n(Cela remplacera "${currentVersion.name}" comme version par défaut)`;
    
    Alert.alert(
      '✅ Version changée',
      message,
      [
        {
          text: 'Non, garder l\'ancienne par défaut',
          style: 'cancel',
          onPress: () => {
            console.log('❌ Utilisateur a gardé l\'ancienne version par défaut');
            // On reste sur la nouvelle version courante mais l'ancienne reste par défaut
            router.back();
          }
        },
        {
          text: 'Oui, définir par défaut',
          onPress: async () => {
            try {
              console.log('📝 Changement version par défaut vers:', version.name, '(ID:', version.id, ')');
              
              // Mettre à jour dans les paramètres ET définir comme version par défaut
              await bibleService.setDefaultVersion(version.id);
              await updateSettings({ defaultVersion: version.id, version: version.id });
              setDefaultVersionId(version.id);
              
              console.log('✅ Version par défaut changée avec succès');
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              
              // Recharger les versions pour mettre à jour les badges
              await loadVersions();
              
              // Message de confirmation
              setTimeout(() => {
                Alert.alert(
                  '✅ Version par défaut mise à jour',
                  `"${version.name}" est maintenant votre Bible par défaut.`,
                  [{ text: 'OK', onPress: () => router.back() }]
                );
              }, 500);
              
            } catch (error) {
              console.error('❌ Erreur changement version par défaut:', error);
              Alert.alert('Erreur', 'Impossible de changer la version par défaut.');
            }
          }
        }
      ]
    );
  };

  const renderVersionGroup = (group: BibleVersionGroup) => (
    <View key={group.title} style={styles.versionGroup}>
      <View style={[styles.groupHeader, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.groupHeaderLeft}>
          <View style={[styles.groupIcon, { backgroundColor: theme.colors.primary + '20' }]}>
            <Feather name={group.icon as any} size={18} color={theme.colors.primary} />
          </View>
          <Text style={[styles.groupTitle, { color: theme.custom.colors.text }]}>
            {group.flag} {group.title}
          </Text>
        </View>
        <Text style={[styles.groupCount, { color: theme.custom.colors.placeholder }]}>
          {group.versions.length} versions
        </Text>
      </View>

      <View style={styles.versionsList}>
        {group.versions.map((version, index) => {
          const isSelected = version.id === currentVersion.id;
          const isChanging = changingVersion === version.id;
          
          return (
            <TouchableOpacity
              key={version.id}
              style={[styles.versionItem, {
                backgroundColor: isSelected ? theme.colors.primary + '15' : theme.colors.surface,
                borderColor: isSelected ? theme.colors.primary : theme.colors.outline + '30',
                opacity: isChanging ? 0.7 : (version.comingSoon ? 0.5 : 1)
              }]}
              onPress={() => {
                if (version.comingSoon) {
                  handleComingSoonVersion(version);
                } else if (version.id === currentVersion.id) {
                  // 🚫 Version déjà sélectionnée - feedback haptique uniquement
                  console.log('⚡ Version déjà active, aucune action');
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                } else {
                  handleVersionChange(version);
                }
              }}
              disabled={isChanging || (version.id === currentVersion.id && !version.comingSoon)}
              activeOpacity={version.comingSoon ? 0.3 : (version.id === currentVersion.id ? 0.5 : 0.7)}
            >
              <View style={styles.versionItemContent}>
                <View style={styles.versionNameRow}>
                  <Text style={[styles.versionName, {
                    color: version.comingSoon ? theme.custom.colors.placeholder : (isSelected ? theme.colors.primary : theme.custom.colors.text),
                    fontFamily: isSelected ? 'Nunito_700Bold' : 'Nunito_600SemiBold'
                  }]}>
                    {version.name}
                  </Text>
                  {version.isDefault && (
                    <View style={[styles.miniDefaultBadge, { backgroundColor: theme.colors.primary }]}>
                      <Text style={styles.miniDefaultBadgeText}>DÉFAUT</Text>
                    </View>
                  )}
                  {version.comingSoon && (
                    <View style={[styles.comingSoonBadge, { backgroundColor: theme.colors.secondary + '80' }]}>
                      <Text style={styles.comingSoonBadgeText}>À VENIR</Text>
                    </View>
                  )}
                  {(version.isAvailable || version.language === 'Sango') && !version.comingSoon && (
                    <View style={[styles.availableBadge, { backgroundColor: '#4CAF50' }]}>
                      <Text style={styles.availableBadgeText}>DISPONIBLE</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.versionDetails, { 
                  color: version.comingSoon ? theme.custom.colors.placeholder : theme.custom.colors.placeholder 
                }]}>
                  {version.abbreviation} • {
                    version.language === 'French' || version.language === 'fr' ? 'Français' : 
                    version.language === 'Sango' ? '🇨🇫 Sängö' : 
                    'English'
                  }
                  {version.description && version.description !== version.name && (
                    <Text style={{ opacity: version.comingSoon ? 0.6 : 0.8 }}> • {version.description}</Text>
                  )}
                </Text>
              </View>

              <View style={styles.versionItemRight}>
                {isChanging ? (
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                ) : isSelected ? (
                  <Feather name="check-circle" size={20} color={theme.colors.primary} />
                ) : (
                  <Feather name="circle" size={20} color={theme.colors.outline} />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { 
            color: theme.custom.colors.text,
            marginTop: 16 
          }]}>
            Chargement des versions...
          </Text>
         <Text
  style={[
    styles.loadingSubText,
    { color: theme.custom.colors.placeholder, marginTop: 8 },
  ]}
>
  Récupération depuis l&apos;API Scripture
</Text>

        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.errorContainer}>
          <Feather name="wifi-off" size={48} color={theme.colors.error} />
          <Text style={[styles.errorText, { color: theme.colors.error, marginTop: 16 }]}>
            {error}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
            onPress={loadVersions}
            activeOpacity={0.8}
          >
            <Text style={[styles.retryButtonText, { color: 'white' }]}>
              Réessayer
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* En-tête amélioré avec version actuelle */}
        <View style={[styles.headerSection, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.currentVersionCard, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.currentVersionContent}>
              <View style={styles.currentVersionHeader}>
                <View style={[styles.versionIcon, { backgroundColor: theme.colors.primary + '20' }]}>
                  <Feather name="book-open" size={24} color={theme.colors.primary} />
                </View>
                <View style={styles.versionInfo}>
                  <Text style={[styles.currentVersionLabel, { color: theme.custom.colors.placeholder }]}>
                    VERSION ACTUELLE
                  </Text>
                  <Text style={[styles.currentVersionName, { color: theme.custom.colors.text }]}>
                    {currentVersion.name}
                  </Text>
                  <View style={styles.versionMeta}>
                    <Text style={[styles.currentVersionDetails, { color: theme.custom.colors.placeholder }]}>
                      {currentVersion.abbrev} • {currentVersion.language === 'fr' ? '🇫🇷 Traduction française' : '🇺🇸 English Translation'}
                    </Text>
                    {currentVersion.id === defaultVersionId && (
                      <View style={[styles.defaultBadge, { backgroundColor: theme.colors.primary }]}>
                        <Text style={styles.defaultBadgeText}>PAR DÉFAUT</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </View>
          </View>
          
          {/* Statistiques rapides */}
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
              <View style={styles.statNumberContainer}>
                <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
                  {versionGroups.reduce((total, group) => total + group.versions.length, 0)}
                </Text>
              </View>
              <Text style={[styles.statLabel, { color: theme.custom.colors.placeholder }]}>Versions</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.colors.surface, marginLeft: 8 }]}>
              <View style={styles.statNumberContainer}>
                <Text style={[styles.statNumber, { color: theme.colors.secondary }]}>
                  {versionGroups.find(g => g.title.includes('Françaises'))?.versions.length || 0}
                </Text>
              </View>
              <Text style={[styles.statLabel, { color: theme.custom.colors.placeholder }]}>Françaises</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.colors.surface, marginLeft: 8 }]}>
              <View style={styles.statNumberContainer}>
                <Text style={[styles.statNumber, { color: theme.colors.tertiary }]}>
                  {versionGroups.find(g => g.title.includes('Anglaises'))?.versions.length || 0}
                </Text>
              </View>
              <Text style={[styles.statLabel, { color: theme.custom.colors.placeholder }]}>Anglaises</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.colors.surface, marginLeft: 8 }]}>
              <View style={styles.statNumberContainer}>
                <Text style={[styles.statNumber, { color: '#FF6B6B' }]}>
                  {versionGroups.find(g => g.title.includes('Nationale'))?.versions.length || 0}
                </Text>
              </View>
              <Text style={[styles.statLabel, { color: theme.custom.colors.placeholder }]}>Sango</Text>
            </View>
          </View>
        </View>

        {/* Groupes de versions */}
        {versionGroups.map(renderVersionGroup)}

        {/* Note en bas */}
        <View style={[styles.noteCard, { backgroundColor: theme.colors.surface, marginBottom: 40 }]}>
          <Feather name="info" size={16} color={theme.colors.primary} />
          <Text style={[styles.noteText, { color: theme.custom.colors.placeholder }]}>
            Les versions sont chargées depuis l&apos;API Scripture. Le changement recharge automatiquement votre lecture actuelle.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    fontFamily: 'Nunito_600SemiBold',
    textAlign: 'center',
  },
  loadingSubText: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    textAlign: 'center',
  },

  // Error
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Nunito_600SemiBold',
    textAlign: 'center',
    lineHeight: 24,
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    textAlign: 'center',
  },

  // Header section amélioré
  headerSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  
  // Version actuelle améliorée
  currentVersionCard: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  currentVersionContent: {
    // Removed alignItems: 'center' pour alignement à gauche
  },
  currentVersionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  versionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  versionInfo: {
    flex: 1,
  },
  currentVersionLabel: {
    fontSize: 11,
    fontFamily: 'Nunito_700Bold',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    opacity: 0.8,
  },
  currentVersionName: {
    fontSize: 22,
    fontFamily: 'Nunito_800ExtraBold',
    marginTop: 6,
    lineHeight: 28,
  },
  versionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    flexWrap: 'wrap',
  },
  currentVersionDetails: {
    fontSize: 14,
    fontFamily: 'Nunito_500Medium',
  },
  defaultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 2,
    marginTop: 15,
  },
  defaultBadgeText: {
    fontSize: 10,
    fontFamily: 'Nunito_700Bold',
    color: 'white',
    letterSpacing: 0.5,
  },
  
  // Statistiques
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    padding: 1,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    minHeight: 70,
    justifyContent: 'center',
  },
  statNumberContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statNumber: {
    fontSize: 20,
    fontFamily: 'Nunito_800ExtraBold',
    lineHeight: 24,
  },
  statLabel: {
    fontSize: 9,
    fontFamily: 'Nunito_600SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },

  // Groupes de versions
  versionGroup: {
    marginBottom: 24,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  groupHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  groupTitle: {
    fontSize: 18,
    fontFamily: 'Nunito_700Bold',
  },
  groupCount: {
    fontSize: 12,
    fontFamily: 'Nunito_600SemiBold',
  },

  versionsList: {
    gap: 8,
  },
  versionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  versionItemContent: {
    flex: 1,
  },
  versionNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  versionName: {
    fontSize: 16,
    lineHeight: 22,
    flex: 1,
    marginRight: 8,
  },
  miniDefaultBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  miniDefaultBadgeText: {
    fontSize: 9,
    fontFamily: 'Nunito_700Bold',
    color: 'white',
    letterSpacing: 0.3,
  },
  comingSoonBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginLeft: 8,
  },
  comingSoonBadgeText: {
    fontSize: 8,
    fontFamily: 'Nunito_700Bold',
    color: 'white',
    letterSpacing: 0.5,
  },
  availableBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginLeft: 8,
  },
  availableBadgeText: {
    fontSize: 8,
    fontFamily: 'Nunito_700Bold',
    color: 'white',
    letterSpacing: 0.5,
  },
  versionDetails: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 18,
  },
  compatibilityNote: {
    fontSize: 11,
    fontFamily: 'Nunito_600SemiBold',
    fontStyle: 'italic',
  },
  versionItemRight: {
    marginLeft: 12,
  },

  // Note
  noteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Nunito_400Regular',
    lineHeight: 18,
    marginLeft: 8,
  },
});
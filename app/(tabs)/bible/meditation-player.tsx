// app/(tabs)/bible/meditation-player.tsx
// Player de méditation avec chronomètre, audio, et incitations
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StatusBar,
  Alert,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Animated
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useBible } from '@/context/EnhancedBibleContext';
import { meditationJournalService } from '@/services/bible/meditationJournalService';
import { meditationProgressService } from '@/services/bible/meditationProgressService';
import type { MeditationSession } from '@/services/bible/meditationProgressService';
import { meditationAudioService } from '@/services/meditation/audioService';
import { useAuth } from '@/context/AuthContext';
import Toast from '@/components/Toast';
import { useToast } from '@/hooks/useToast';

const { width, height } = Dimensions.get('window');

// 10 Messages spirituels d'incitation pour prendre des notes (sans emojis)
const INCITATION_MESSAGES = [
  "Que dit l'Esprit à votre cœur en ce moment ?",
  "Prenez un instant pour noter ce qui vous touche",
  "Quelle vérité Dieu vous révèle-t-il ici ?",
  "Un verset résonne en vous ? Gardez-en la trace",
  "Écoutez la voix douce de l'Esprit et notez",
  "Quel enseignement retenez-vous de ce passage ?",
  "Laissez la Parole transformer votre cœur",
  "Notez ce que Dieu dépose dans votre esprit",
  "Cette parole vous interpelle ? Écrivez-la",
  "Méditez et conservez ce trésor par écrit"
];

export default function MeditationPlayer() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const { getChapter } = useBible();
  const { userProfile } = useAuth();
  const { toast, info, reminder, hideToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [chapterData, setChapterData] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Paramètres de méditation
  const bookId = params.book as string;
  const bookName = (params.bookName as string) || bookId; // Nom en français
  const chapterNum = Number(params.chapter);
  const startVerse = Number(params.verse) || 1;
  const musicId = (params.music as string) || 'silence';
  const durationMinutes = Number(params.duration) || 15;

  // Noms des musiques pour l'affichage
  const MUSIC_NAMES: Record<string, string> = {
    'all-honor': 'All Honor - Instrumental',
    'silence': 'Silence total'
  };
  const musicDisplayName = MUSIC_NAMES[musicId] || musicId;

  // Chronomètre
  const [remainingSeconds, setRemainingSeconds] = useState(durationMinutes * 60);
  const [isPaused, setIsPaused] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Notes
  const [showNote, setShowNote] = useState(false);
  const [noteText, setNoteText] = useState('');

  // Système d'incitation basé sur les versets lus sans note
  const [versesSinceLastNote, setVersesSinceLastNote] = useState(0);
  const [noteIncitationCount, setNoteIncitationCount] = useState(0);
  const MAX_INCITATIONS = 3; // Maximum 3 rappels
  const VERSES_BEFORE_REMINDER = 4; // Rappeler après 4 versets sans note

  // Modals
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [showExtendTimeModal, setShowExtendTimeModal] = useState(false);
  const [showCongratulationsModal, setShowCongratulationsModal] = useState(false);
  const [showNextChapterModal, setShowNextChapterModal] = useState(false);
  const [finalReflection, setFinalReflection] = useState('');
  const [nextChapterInfo, setNextChapterInfo] = useState<{
    nextChapter?: number;
    isBookCompleted: boolean;
    nextBook?: string;
  } | null>(null);

  // Options de prolongation de temps (en minutes)
  const EXTEND_TIME_OPTIONS = [2, 5, 15, 30];

  // Animation pour les incitations
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Charger le chapitre
  useEffect(() => {
    const load = async () => {
      try {
        const data = await getChapter({ book: bookId, chapter: chapterNum });
        if (data) {
          setChapterData(data);
          const idx = data.verses.findIndex(v => v.verse === startVerse);
          if (idx >= 0) setCurrentIndex(idx);

          // Démarrer session
          if (userProfile?.uid) {
            const userId: string = userProfile.uid;
            const book: string = bookId;
            const chapter: number = chapterNum;
            const verse: number = startVerse;
            const totalVerses: number = data.verses.length;
            const version: string | undefined = data.version;
            const ambience: string = musicId;

            await meditationProgressService.startMeditationSession(
              userId,
              book,
              chapter,
              verse,
              totalVerses,
              version,
              ambience
            );
          }
        }
      } catch (e) {
        console.error(e);
        Alert.alert("Erreur", "Impossible de charger ce chapitre.");
        router.dismissTo('/bible/meditation');
      } finally {
        setLoading(false);
      }
    };
    load();

    return () => {
      // Cleanup
      if (timerRef.current) clearInterval(timerRef.current);
      meditationAudioService.stop();
      if (userProfile?.uid) {
        meditationProgressService.pauseSession(userProfile.uid);
      }
    };
  }, []);

  // Démarrer la méditation (chronomètre + audio)
  const handleStartMeditation = async () => {
    setIsStarted(true);
    setIsPaused(false);

    // Démarrer l'audio
    await meditationAudioService.loadAndPlay(musicId);

    // Démarrer le chronomètre
    timerRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          handleTimerEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Fin du timer - vérifie si tous les versets sont lus
  const handleTimerEnd = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    const totalVerses = chapterData?.verses?.length || 0;
    const versesRead = currentIndex + 1;

    if (versesRead < totalVerses) {
      // Versets incomplets - proposer d'ajouter du temps
      // NE PAS arrêter la musique, juste mettre en pause le timer
      setShowExtendTimeModal(true);
    } else {
      // Tous les versets lus - terminer normalement
      meditationAudioService.stop();
      handleCompleteMeditation();
    }
  };

  // Ajouter du temps supplémentaire
  const handleExtendTime = (minutes: number) => {
    setShowExtendTimeModal(false);
    // Ajouter le temps (la musique continue déjà)
    setRemainingSeconds(minutes * 60);

    // Reprendre le timer
    timerRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          handleTimerEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Terminer sans avoir fini tous les versets (depuis le modal extend time)
  const handleEndWithoutExtending = () => {
    setShowExtendTimeModal(false);
    meditationAudioService.stop();

    // Sauvegarder session sans marquer comme complété
    if (userProfile?.uid) {
      meditationProgressService.pauseSession(userProfile.uid);
    }

    router.dismissTo('/bible/meditation');
  };

  // Pause intelligente
  const handlePause = () => {
    if (isPaused) {
      // Reprendre
      setIsPaused(false);
      meditationAudioService.resume();

      timerRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            handleTimerEnd();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      setShowPauseModal(false);
    } else {
      // Mettre en pause
      setIsPaused(true);
      if (timerRef.current) clearInterval(timerRef.current);
      meditationAudioService.pause();
      setShowPauseModal(true);
    }
  };

  // Terminer avec vérification de progression
  const handleFinish = () => {
    const totalVerses = chapterData?.verses?.length || 0;
    const versesRead = currentIndex + 1;
    const percentRead = (versesRead / totalVerses) * 100;

    if (percentRead < 100) {
      Alert.alert(
        'Chapitre incomplet',
        `Vous n'avez lu que ${versesRead} sur ${totalVerses} versets (${Math.round(percentRead)}%).\n\nVotre progression ne sera pas comptabilisée pour ce chapitre.`,
        [
          { text: 'Continuer la lecture', style: 'cancel' },
          {
            text: 'Terminer quand même',
            style: 'destructive',
            onPress: () => confirmEndIncomplete()
          }
        ]
      );
    } else {
      // Tous les versets lus, terminer normalement
      handleCompleteMeditation();
    }
  };

  const confirmEndIncomplete = async () => {
    // Arrêter tout
    if (timerRef.current) clearInterval(timerRef.current);
    meditationAudioService.stop();

    // Sauvegarder session sans marquer comme complété
    if (userProfile?.uid) {
      await meditationProgressService.pauseSession(userProfile.uid);
    }

    // Retourner à meditation en fermant les écrans intermédiaires
    router.dismissTo('/bible/meditation');
  };

  // Terminer prématurément
  const handleEndEarly = () => {
    const percentCompleted = ((durationMinutes * 60 - remainingSeconds) / (durationMinutes * 60)) * 100;

    if (percentCompleted < 80) {
      setShowEndModal(true);
    } else {
      handleCompleteMeditation();
    }
  };

  // Confirmer fin prématurée
  const confirmEndEarly = () => {
    setShowEndModal(false);
    // Retourner à meditation en fermant les écrans intermédiaires
    router.dismissTo('/bible/meditation');
  };

  // Terminer complètement
  const handleCompleteMeditation = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    meditationAudioService.stop();

    // Afficher le modal de félicitations
    setShowCongratulationsModal(true);
  };

  // Sauvegarder la réflexion finale
  const saveFinalReflection = async () => {
    try {
      if (!userProfile?.uid) return;

      // Terminer la session
      const result = await meditationProgressService.completeChapter(userProfile.uid);

      // Sauvegarder la réflexion finale comme note spéciale
      if (finalReflection.trim()) {
        await meditationJournalService.addEntry(userProfile.uid, {
          date: new Date().toISOString(),
          durationSeconds: durationMinutes * 60 - remainingSeconds,
          verse: {
            text: `Méditation complète de ${bookName} ${chapterNum}`,
            reference: `${bookId} ${chapterNum}`
          },
          note: `Réflexion finale: ${finalReflection}`
        });
      }

      setShowCongratulationsModal(false);

      // Sauvegarder les infos et afficher le modal personnalisé
      setNextChapterInfo(result);
      setShowNextChapterModal(true);
    } catch (e) {
      console.error('Failed to save final reflection:', e);
      goToHome();
    }
  };

  // Aller à l'écran principal de méditation (nettoyer jusqu'à meditation)
  const goToHome = () => {
    // Fermer tous les écrans jusqu'à meditation (music, duration, player)
    router.dismissTo('/bible/meditation');
  };

  // Continuer au chapitre suivant - rediriger vers sélection de musique/durée
  const handleContinueNextChapter = () => {
    setShowNextChapterModal(false);
    if (nextChapterInfo?.nextChapter) {
      // Aller à la sélection de musique pour le nouveau chapitre
      router.replace({
        pathname: '/bible/meditation-music-selection',
        params: {
          book: bookId,
          bookName: bookName,
          chapter: nextChapterInfo.nextChapter,
          verse: 1
        }
      });
    } else if (nextChapterInfo?.nextBook) {
      // Retourner à meditation puis aller à la sélection
      router.dismissTo('/bible/meditation');
    }
  };

  // Mettre à jour la position et gérer les incitations
  useEffect(() => {
    if (chapterData && userProfile?.uid && isStarted) {
      const currentVerse = chapterData.verses[currentIndex];
      if (currentVerse) {
        meditationProgressService.updateCurrentVerse(userProfile.uid, currentVerse.verse);
      }

      // Incrémenter le compteur de versets sans note
      setVersesSinceLastNote(prev => prev + 1);
    }
  }, [currentIndex, isStarted]);

  // Vérifier si on doit afficher une incitation (après N versets sans note)
  useEffect(() => {
    if (
      isStarted &&
      !isPaused &&
      versesSinceLastNote >= VERSES_BEFORE_REMINDER &&
      noteIncitationCount < MAX_INCITATIONS
    ) {
      // Afficher un toast aléatoire avec le type "reminder"
      const randomIndex = Math.floor(Math.random() * INCITATION_MESSAGES.length);
      const message = INCITATION_MESSAGES[randomIndex];
      reminder(message);

      // Le toast disparaît après 5 secondes
      setTimeout(() => hideToast(), 5000);

      // Incrémenter le compteur d'incitations et reset le compteur de versets
      setNoteIncitationCount(prev => prev + 1);
      setVersesSinceLastNote(0);
    }
  }, [versesSinceLastNote, isStarted, isPaused]);

  // Navigation versets
  const handleNext = () => {
    if (currentIndex < (chapterData?.verses.length || 0) - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  // Sauvegarder une note
  const saveNote = async () => {
    if (!noteText.trim() || !userProfile?.uid) return;

    try {
      const currentVerse = chapterData.verses[currentIndex];

      await meditationProgressService.addNote(
        userProfile.uid,
        currentVerse.verse,
        noteText
      );

      await meditationJournalService.addEntry(userProfile.uid, {
        date: new Date().toISOString(),
        durationSeconds: 0,
        verse: {
          text: currentVerse.text,
          reference: `${bookId} ${chapterNum}:${currentVerse.verse}`
        },
        note: noteText
      });

      // Réinitialiser le compteur de versets (l'utilisateur a pris une note)
      setVersesSinceLastNote(0);

      info('Note enregistrée !');
      setTimeout(() => hideToast(), 3000);
      setNoteText('');
      setShowNote(false);
    } catch (e) {
      console.error('Failed to save note:', e);
      Alert.alert("Erreur", "Impossible de sauvegarder la note.");
    }
  };

  // Format du temps restant
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFD700" />
        <Text style={styles.loadingText}>Préparation de votre moment...</Text>
      </View>
    );
  }

  if (!chapterData) {
    return (
      <View style={styles.loadingContainer}>
        <Feather name="alert-circle" size={48} color="#E91E63" />
        <Text style={styles.loadingText}>Impossible de charger ce passage.</Text>
        <TouchableOpacity onPress={() => router.dismissTo('/bible/meditation')} style={styles.backButton}>
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentVerse = chapterData.verses[currentIndex];

  // ÉCRAN DE DÉMARRAGE "Prêt à méditer?" (avant de commencer)
  if (!isStarted) {
    return (
      <View style={styles.container}>
        <StatusBar hidden />
        <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={StyleSheet.absoluteFill} />

        <View style={styles.startScreen}>
          {/* Icône mains en prière */}
          <View style={styles.startIconContainer}>
            <Text style={styles.prayEmoji}>🙏</Text>
          </View>

          <Text style={styles.startTitle}>Prêt à méditer ?</Text>

          {/* Message personnalisé */}
          <Text style={styles.startMessage}>
            Vous vous apprêtez à méditer sur le livre de{' '}
            <Text style={styles.highlight}>{bookName}</Text>
            {' '}chapitre{' '}
            <Text style={styles.highlight}>{chapterNum}</Text>
          </Text>

          {/* Carte résumé */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryIcon}>
                <Feather name="clock" size={20} color="#FFD700" />
              </View>
              <View style={styles.summaryInfo}>
                <Text style={styles.summaryLabel}>Durée</Text>
                <Text style={styles.summaryValue}>
                  {durationMinutes} minute{durationMinutes > 1 ? 's' : ''}
                </Text>
              </View>
            </View>

            <View style={styles.summaryRow}>
              <View style={styles.summaryIcon}>
                <Feather name="music" size={20} color="#FFD700" />
              </View>
              <View style={styles.summaryInfo}>
                <Text style={styles.summaryLabel}>Ambiance</Text>
                <Text style={styles.summaryValue}>{musicDisplayName}</Text>
              </View>
            </View>

            <View style={[styles.summaryRow, { marginBottom: 0 }]}>
              <View style={styles.summaryIcon}>
                <Feather name="book-open" size={20} color="#FFD700" />
              </View>
              <View style={styles.summaryInfo}>
                <Text style={styles.summaryLabel}>Passage</Text>
                <Text style={styles.summaryValue}>
                  {bookName} {chapterNum}:{startVerse} ({chapterData.verses.length} versets)
                </Text>
              </View>
            </View>
          </View>

          {/* Citation inspirante */}
          <Text style={styles.quoteText}>
            "Sois tranquille, et sache que je suis Dieu"
          </Text>
          <Text style={styles.quoteRef}>Psaume 46:11</Text>

          {/* Bouton Commencer */}
          <TouchableOpacity style={styles.bigStartButton} onPress={handleStartMeditation}>
            <Text style={styles.bigStartButtonText}>Commencer la méditation</Text>
            <Feather name="arrow-right" size={22} color="#1a1a2e" />
          </TouchableOpacity>

          {/* Note de préparation */}
          <Text style={styles.footNote}>
            Prenez un moment pour vous recentrer{'\n'}et ouvrir votre cœur à la Parole
          </Text>

          <TouchableOpacity onPress={() => router.dismissTo('/bible/meditation')} style={styles.cancelBtn}>
            <Text style={styles.cancelBtnText}>Annuler</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ÉCRAN PRINCIPAL (pendant la méditation)
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <StatusBar hidden />
      <LinearGradient colors={['#0f2027', '#203a43', '#2c5364']} style={StyleSheet.absoluteFill} />

      {/* Toast pour les incitations */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
        duration={5000}
      />

      {/* HEADER avec chronomètre */}
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <TouchableOpacity onPress={handlePause} style={styles.iconBtn}>
          <Feather name={isPaused ? "play" : "pause"} size={24} color="#FFD700" />
        </TouchableOpacity>

        {/* CHRONOMÈTRE */}
        <View style={styles.timerContainer}>
          <Feather name="clock" size={20} color={remainingSeconds < 60 ? '#E91E63' : '#FFD700'} />
          <Text style={[styles.timerText, remainingSeconds < 60 && styles.timerTextUrgent]}>
            {formatTime(remainingSeconds)}
          </Text>
        </View>

        <TouchableOpacity onPress={handleFinish} style={[styles.iconBtn, styles.finishBtn]}>
          <Feather name="check-circle" size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      {/* RÉFÉRENCE */}
      <View style={styles.referenceBar}>
        <Text style={styles.referenceText}>
          {bookId} {chapterNum}:{currentVerse?.verse}
        </Text>
      </View>

      {/* CONTENU */}
      <View style={styles.content}>
        <ScrollView contentContainerStyle={styles.scrollText}>
          <Text style={styles.verseText}>&quot;{currentVerse?.text}&quot;</Text>
        </ScrollView>

        {/* ZONE NOTE */}
        {showNote && (
          <View style={styles.noteBox}>
            <TextInput
              style={styles.input}
              placeholder="Votre réflexion, ou dites simplement Amen à cette parole..."
              placeholderTextColor="rgba(255,255,255,0.5)"
              multiline
              value={noteText}
              onChangeText={setNoteText}
              autoFocus
            />
            <TouchableOpacity onPress={saveNote} style={styles.saveBtn}>
              <Text style={styles.saveText}>Enregistrer</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* CONTROLS */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.controlsRow}>
          <TouchableOpacity
            onPress={handlePrev}
            disabled={currentIndex === 0}
            style={[styles.navBtn, { opacity: currentIndex === 0 ? 0.3 : 1 }]}
          >
            <Feather name="chevron-left" size={32} color="#FFF" />
          </TouchableOpacity>

          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity
              style={[styles.mainActionBtn, { backgroundColor: showNote ? '#E91E63' : 'rgba(255,255,255,0.2)' }]}
              onPress={() => setShowNote(!showNote)}
            >
              <Feather name="edit-3" size={28} color="#FFF" />
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity onPress={handleNext} style={styles.navBtn}>
            <Feather name="chevron-right" size={32} color="#FFF" />
          </TouchableOpacity>
        </View>

        <Text style={styles.hint}>
          {currentIndex + 1} / {chapterData?.verses?.length || 0}
        </Text>
      </View>

      {/* MODAL PAUSE - Un seul bouton Reprendre */}
      <Modal visible={showPauseModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.pauseModalContent}>
            <View style={styles.pauseIconContainer}>
              <Feather name="pause" size={32} color="#FFF" />
            </View>
            <Text style={styles.pauseTitle}>Méditation en pause</Text>
            <Text style={styles.pauseText}>
              Prendre une pause peut briser votre concentration et votre communion avec Dieu.
            </Text>
            <TouchableOpacity style={styles.resumeBtn} onPress={handlePause}>
              <Feather name="play" size={20} color="#FFF" />
              <Text style={styles.resumeBtnText}>Reprendre</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL FIN PRÉMATURÉE */}
      <Modal visible={showEndModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <MaterialCommunityIcons name="alert-circle" size={60} color="#E91E63" />
            <Text style={styles.modalTitle}>Terminer maintenant ?</Text>
            <Text style={styles.modalText}>
              Vous n&apos;avez pas atteint 80% du temps de méditation. Votre progression risque de ne pas être prise en compte.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalBtnSecondary} onPress={() => setShowEndModal(false)}>
                <Text style={styles.modalBtnSecondaryText}>Continuer</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnPrimary} onPress={confirmEndEarly}>
                <Text style={styles.modalBtnPrimaryText}>Quitter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL PROLONGER LE TEMPS - Quand le timer est fini mais versets incomplets */}
      <Modal visible={showExtendTimeModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.extendTimeModal}>
            {/* Icône horloge */}
            <View style={styles.extendTimeIconContainer}>
              <Feather name="clock" size={32} color="#FFF" />
            </View>

            {/* Message */}
            <Text style={styles.extendTimeTitle}>Temps écoulé</Text>
            <Text style={styles.extendTimeText}>
              Il vous reste {(chapterData?.verses?.length || 0) - (currentIndex + 1)} verset(s) à lire.{'\n'}
              Souhaitez-vous prolonger votre méditation ?
            </Text>

            {/* Options de temps */}
            <View style={styles.extendTimeOptions}>
              {EXTEND_TIME_OPTIONS.map((minutes) => (
                <TouchableOpacity
                  key={minutes}
                  style={styles.extendTimeBtn}
                  onPress={() => handleExtendTime(minutes)}
                >
                  <Text style={styles.extendTimeBtnText}>+{minutes} min</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Bouton Terminer sans prolonger */}
            <TouchableOpacity style={styles.extendTimeEndBtn} onPress={handleEndWithoutExtending}>
              <Text style={styles.extendTimeEndBtnText}>Terminer sans prolonger</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL FÉLICITATIONS - Design sobre et professionnel */}
      <Modal visible={showCongratulationsModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView contentContainerStyle={styles.congratsScrollView}>
              <View style={styles.congratsContent}>
                {/* Icône simple */}
                <View style={styles.completedIconContainer}>
                  <Feather name="check" size={40} color="#FFF" />
                </View>

                {/* Titre sobre */}
                <Text style={styles.congratsTitle}>Méditation terminée</Text>
                <Text style={styles.congratsSubtitle}>
                  {bookName} {chapterNum}
                </Text>

                {/* Zone de réflexion optionnelle */}
                <View style={styles.reflectionCard}>
                  <Text style={styles.reflectionLabel}>Réflexion finale (optionnel)</Text>
                  <TextInput
                    style={styles.reflectionInput}
                    placeholder="Ce que je retiens de cette méditation..."
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    multiline
                    numberOfLines={3}
                    value={finalReflection}
                    onChangeText={setFinalReflection}
                  />
                </View>

                {/* Bouton unique */}
                <TouchableOpacity style={styles.finishModalBtn} onPress={saveFinalReflection}>
                  <Text style={styles.finishModalBtnText}>Terminer</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* MODAL CHAPITRE SUIVANT - Personnalisé (pas Alert native) */}
      <Modal visible={showNextChapterModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.nextChapterModal}>
            {/* Icône de succès */}
            <View style={styles.successIconContainer}>
              <Feather name="check" size={36} color="#FFF" />
            </View>

            {/* Message */}
            <Text style={styles.nextChapterTitle}>
              {nextChapterInfo?.isBookCompleted ? 'Livre terminé' : 'Chapitre terminé'}
            </Text>
            <Text style={styles.nextChapterSubtitle}>
              {bookName} {chapterNum}
            </Text>

            {/* Proposition du chapitre suivant */}
            {nextChapterInfo?.nextChapter && (
              <TouchableOpacity style={styles.continueBtn} onPress={handleContinueNextChapter}>
                <Text style={styles.continueBtnText}>
                  Continuer au chapitre {nextChapterInfo.nextChapter}
                </Text>
                <Feather name="arrow-right" size={18} color="#FFF" />
              </TouchableOpacity>
            )}

            {nextChapterInfo?.isBookCompleted && nextChapterInfo?.nextBook && (
              <TouchableOpacity style={styles.continueBtn} onPress={handleContinueNextChapter}>
                <Text style={styles.continueBtnText}>
                  Commencer {nextChapterInfo.nextBook}
                </Text>
                <Feather name="arrow-right" size={18} color="#FFF" />
              </TouchableOpacity>
            )}

            {/* Bouton Terminer */}
            <TouchableOpacity style={styles.goHomeBtn} onPress={goToHome}>
              <Text style={styles.goHomeBtnText}>Terminer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  loadingContainer: { flex: 1, backgroundColor: '#0f2027', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: 'rgba(255,255,255,0.7)', marginTop: 20, fontFamily: 'Nunito_600SemiBold' },
  backButton: { marginTop: 20, backgroundColor: '#FFD700', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 20 },
  backButtonText: { color: '#1a1a2e', fontFamily: 'Nunito_700Bold' },

  // ÉCRAN DE DÉMARRAGE "Prêt à méditer?"
  startScreen: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  startIconContainer: {
    marginBottom: 24
  },
  prayEmoji: {
    fontSize: 80
  },
  startTitle: {
    color: '#FFF',
    fontSize: 32,
    fontFamily: 'Nunito_800ExtraBold',
    marginBottom: 16,
    textAlign: 'center'
  },
  startMessage: {
    fontSize: 18,
    fontFamily: 'Nunito_600SemiBold',
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 32
  },
  highlight: {
    color: '#FFD700',
    fontFamily: 'Nunito_800ExtraBold'
  },
  summaryCard: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.3)'
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20
  },
  summaryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,215,0,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16
  },
  summaryInfo: {
    flex: 1
  },
  summaryLabel: {
    fontSize: 12,
    fontFamily: 'Nunito_600SemiBold',
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  summaryValue: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    color: '#FFF'
  },
  quoteText: {
    fontSize: 16,
    fontFamily: 'Nunito_600SemiBold',
    color: 'rgba(255,255,255,0.7)',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 8
  },
  quoteRef: {
    fontSize: 13,
    fontFamily: 'Nunito_700Bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 32
  },
  bigStartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFD700',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 30,
    gap: 12,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 16
  },
  bigStartButtonText: {
    color: '#1a1a2e',
    fontSize: 18,
    fontFamily: 'Nunito_800ExtraBold'
  },
  footNote: {
    fontSize: 14,
    fontFamily: 'Nunito_500Medium',
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8
  },
  cancelBtn: { marginTop: 8 },
  cancelBtnText: { color: 'rgba(255,255,255,0.4)', fontSize: 15, fontFamily: 'Nunito_600SemiBold' },

  // HEADER
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20
  },
  iconBtn: { padding: 10 },
  finishBtn: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderRadius: 12
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8
  },
  timerText: { color: '#FFD700', fontSize: 20, fontFamily: 'Nunito_800ExtraBold' },
  timerTextUrgent: { color: '#E91E63' },

  referenceBar: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: 10
  },
  referenceText: { color: 'rgba(255,255,255,0.8)', fontFamily: 'Nunito_700Bold', fontSize: 14 },

  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 30 },
  scrollText: { flexGrow: 1, justifyContent: 'center' },
  verseText: {
    color: '#FFF',
    fontSize: 24,
    fontFamily: 'Nunito_600SemiBold',
    textAlign: 'center',
    lineHeight: 36,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4
  },

  noteBox: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.9)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)'
  },
  input: {
    color: '#FFF',
    fontFamily: 'Nunito_500Medium',
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 10
  },
  saveBtn: {
    alignSelf: 'flex-end',
    backgroundColor: '#E91E63',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8
  },
  saveText: { color: '#FFF', fontFamily: 'Nunito_700Bold', fontSize: 12 },

  footer: { paddingHorizontal: 40 },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  navBtn: { padding: 20 },
  mainActionBtn: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)'
  },
  hint: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.3)',
    fontFamily: 'Nunito_700Bold',
    fontSize: 12
  },

  // MODALS
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: 'Nunito_800ExtraBold',
    color: '#1a1a2e',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center'
  },
  modalText: {
    fontSize: 16,
    fontFamily: 'Nunito_500Medium',
    color: 'rgba(0,0,0,0.7)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%'
  },
  modalBtnPrimary: {
    flex: 1,
    backgroundColor: '#E91E63',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center'
  },
  modalBtnPrimaryText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Nunito_700Bold'
  },
  modalBtnSecondary: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)'
  },
  modalBtnSecondaryText: {
    color: 'rgba(0,0,0,0.7)',
    fontSize: 16,
    fontFamily: 'Nunito_700Bold'
  },

  // MODAL FÉLICITATIONS - Design sobre
  congratsScrollView: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20
  },
  congratsContent: {
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  completedIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  congratsTitle: {
    fontSize: 22,
    fontFamily: 'Nunito_700Bold',
    color: '#FFF',
    marginBottom: 6
  },
  congratsSubtitle: {
    fontSize: 15,
    fontFamily: 'Nunito_600SemiBold',
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 24
  },
  reflectionCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    padding: 16,
    width: '100%',
    marginBottom: 24
  },
  reflectionLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    fontFamily: 'Nunito_600SemiBold',
    marginBottom: 10
  },
  reflectionInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    fontFamily: 'Nunito_500Medium',
    color: '#FFF',
    minHeight: 80,
    textAlignVertical: 'top'
  },
  finishModalBtn: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    paddingHorizontal: 50,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center'
  },
  finishModalBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Nunito_700Bold'
  },

  // MODAL PAUSE - Styles
  pauseModalContent: {
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  pauseIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FF9800',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  pauseTitle: {
    fontSize: 20,
    fontFamily: 'Nunito_700Bold',
    color: '#FFF',
    marginBottom: 10
  },
  pauseText: {
    fontSize: 14,
    fontFamily: 'Nunito_500Medium',
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24
  },
  resumeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 25,
    gap: 10,
    width: '100%'
  },
  resumeBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Nunito_700Bold'
  },

  // MODAL PROLONGER LE TEMPS - Styles
  extendTimeModal: {
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  extendTimeIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  extendTimeTitle: {
    fontSize: 20,
    fontFamily: 'Nunito_700Bold',
    color: '#FFF',
    marginBottom: 10
  },
  extendTimeText: {
    fontSize: 14,
    fontFamily: 'Nunito_500Medium',
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24
  },
  extendTimeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
    width: '100%'
  },
  extendTimeBtn: {
    backgroundColor: '#FFD700',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center'
  },
  extendTimeBtnText: {
    color: '#1a1a2e',
    fontSize: 15,
    fontFamily: 'Nunito_700Bold'
  },
  extendTimeEndBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)'
  },
  extendTimeEndBtnText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontFamily: 'Nunito_600SemiBold'
  },

  // MODAL CHAPITRE SUIVANT - Styles
  nextChapterModal: {
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  successIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  nextChapterTitle: {
    fontSize: 20,
    fontFamily: 'Nunito_700Bold',
    color: '#FFF',
    marginBottom: 6
  },
  nextChapterSubtitle: {
    fontSize: 15,
    fontFamily: 'Nunito_600SemiBold',
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 24
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7C4DFF',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 25,
    gap: 10,
    width: '100%',
    marginBottom: 12
  },
  continueBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontFamily: 'Nunito_700Bold'
  },
  goHomeBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)'
  },
  goHomeBtnText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 15,
    fontFamily: 'Nunito_600SemiBold'
  }
});

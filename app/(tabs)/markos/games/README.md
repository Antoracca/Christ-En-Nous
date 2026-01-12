# Système de Quiz Markos

## 📁 Structure des fichiers

```
app/
├── (tabs)/markos/games/
│   ├── _layout.tsx          # Layout pour la navigation des quiz
│   ├── games.tsx             # Écran principal - Liste des quiz
│   ├── quiz/
│   │   └── [id].tsx         # Écran de quiz individuel avec toutes les fonctionnalités
│   └── README.md            # Ce fichier
├── components/markos/quiz/
│   ├── QuestionCard.tsx     # Carte de question avec timer et options
│   ├── ScorePanel.tsx       # Panneau de score (XP, combo, classement)
│   ├── ReactionButtons.tsx  # Boutons de réaction rapide
│   ├── ReactionBubble.tsx   # Bulles de réaction animées (style TikTok)
│   ├── ReactionToast.tsx   # Toasts de réaction (style live TikTok)
│   ├── QuizCard.tsx         # Carte de quiz pour la liste
│   └── index.ts             # Exports centralisés
├── services/quiz/
│   ├── quizService.ts       # Service de gestion des quiz (état, XP, combos, timer)
│   └── index.ts             # Exports
└── data/
    └── quizData.ts          # Types et données des quiz
```

## 🎯 Fonctionnalités implémentées

### ✅ Fonctionnalités principales
- **Rejoindre un quiz** : Les utilisateurs peuvent rejoindre un quiz en cours ou disponible
- **Commencer un quiz** : Démarrer un nouveau quiz depuis la liste
- **Relire un quiz** : Possibilité de revoir les questions et réponses
- **Diversification** : Quiz sur plusieurs domaines (Bible, Culture, Histoire, Géographie, Science, Musique)

### ✅ Fonctionnalités avancées
- **XP en temps réel** : L'XP augmente dynamiquement selon les bonnes réponses
- **Indicateur de performance** : Score, combo, classement en temps réel
- **Système de combos** : Bonus de points pour les réponses consécutives correctes
- **Minuterie** : Timer par question avec barre de progression visuelle
- **Réactions en temps réel** :
  - Bulles de réaction animées (comme TikTok)
  - Toasts avec nom et ID de la personne qui réagit
  - 5 types de réactions : 🔥 Feu, 👏 Applaudir, ❤️ Aimer, 😂 Rire, 😮 Wow
- **Classement en direct** : Leaderboard mis à jour en temps réel

## 🎨 Style et Design

Le système respecte parfaitement le style Markos :
- **Couleurs** : Utilisation des couleurs par thème (Bible: #8B5CF6, Culture: #3B82F6, etc.)
- **Typographie** : Nunito (400, 600, 700, 800)
- **Composants** : Cards avec borderRadius 16-20, elevation, shadows
- **Animations** : React Native Reanimated pour les animations fluides
- **Haptics** : Feedback tactile sur les interactions

## 🔧 Utilisation

### Rejoindre un quiz
```typescript
import { quizService } from '@/services/quiz';
import { AVAILABLE_QUIZZES } from '@/data/quizData';

const quiz = AVAILABLE_QUIZZES.find(q => q.id === 'daniel');
const session = quizService.joinQuiz(quiz, userId, userName, userAvatar);
```

### Répondre à une question
```typescript
quizService.answerQuestion(answerIndex);
```

### Ajouter une réaction
```typescript
quizService.addReaction(userId, userName, userAvatar, 'fire', questionId);
```

### S'abonner aux changements
```typescript
const unsubscribe = quizService.subscribe('my-listener', (state) => {
  console.log('State updated:', state);
});
```

## 📊 Calcul des points et XP

- **Points de base** : Selon la difficulté de la question (10-15 points)
- **Bonus combo** : +2 points par combo (max 10 points)
- **XP** : 
  - Base : points × 2 si correct
  - Combo : combo × 5 XP
  - Vitesse : +10 XP si réponse rapide (>50% du temps restant)

## 🎮 Types de quiz disponibles

1. **Bible** : Le Livre de Daniel, Bible Générale
2. **Culture** : Histoire de la RCA
3. **Géographie** : Géographie de l'Afrique
4. **Musique** : Musique Gospel
5. **Et plus...** : Facilement extensible

## 🚀 Extension future

Le système est conçu pour être scalable :
- Ajout facile de nouveaux quiz dans `quizData.ts`
- Composants réutilisables et modulaires
- Service centralisé pour la logique métier
- Types TypeScript pour la sécurité

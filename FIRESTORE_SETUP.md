# Configuration Firestore - Christ En Nous

## 🔥 Déploiement des règles de sécurité

### Étape 1: Via Firebase Console (Méthode recommandée)

1. Va sur [Firebase Console](https://console.firebase.google.com/)
2. Sélectionne ton projet **app-christ-en-nous**
3. Dans le menu de gauche, clique sur **Firestore Database**
4. Clique sur l'onglet **Règles** (Rules)
5. Copie le contenu de `firestore.rules` et colle-le dans l'éditeur
6. Clique sur **Publier** (Publish)

### Étape 2: Via Firebase CLI (Alternative)

Si tu as Firebase CLI installé:

```bash
# Installer Firebase CLI (si pas déjà fait)
npm install -g firebase-tools

# Se connecter à Firebase
firebase login

# Initialiser le projet (si pas déjà fait)
firebase init firestore

# Déployer les règles
firebase deploy --only firestore:rules
```

## 📊 Structure Firestore

### Collections principales

```
/users/{userId}
  ├── /bibleTracking/{docId}
  │   └── progress (document avec tracking de lecture)
  │
  ├── /bibleBookmarks/{docId}
  │   └── data (document avec array de signets)
  │
  ├── /bibleHighlights/{docId}
  │   └── data (document avec array de surlignages)
  │
  ├── /bibleSettings/{docId}
  │   └── data (document avec paramètres Bible)
  │
  ├── /bibleProgress/{docId}
  │   └── data (document avec array de progression)
  │
  ├── /bibleLastPosition/{docId}
  │   └── data (document avec dernière position)
  │
  ├── /musicFavorites/{docId}
  │   └── data (favoris cantiques)
  │
  ├── /musicPlaylists/{docId}
  │   └── data (playlists utilisateur)
  │
  └── /musicHistory/{docId}
      └── data (historique d'écoute)

/userProfiles/{userId}
  └── (profil public de l'utilisateur)

/cantiques/{cantiqueId}
  └── (données des cantiques - lecture seule)

/sermons/{sermonId}
  └── (données des sermons - lecture seule)

/events/{eventId}
  └── (événements - lecture seule)

/news/{newsId}
  └── (actualités - lecture seule)
```

## 🔒 Règles de sécurité

### Principe de base

- **Authentification requise**: Tous les utilisateurs doivent être authentifiés
- **Isolation des données**: Chaque utilisateur ne peut accéder qu'à ses propres données
- **Données publiques**: Cantiques, sermons, etc. sont en lecture seule

### Exemples de règles

```javascript
// ✅ Autorisé: Lecture de ses propres données
users/{myUserId}/bibleBookmarks/data
  → Si request.auth.uid == myUserId

// ❌ Refusé: Lecture des données d'un autre utilisateur
users/{otherUserId}/bibleBookmarks/data
  → Si request.auth.uid != otherUserId

// ✅ Autorisé: Lecture des cantiques (public)
cantiques/{cantiqueId}
  → Si authentifié

// ❌ Refusé: Écriture dans les cantiques
cantiques/{cantiqueId}
  → Toujours refusé (admin uniquement)
```

## 🧪 Test des règles

### Via Firebase Console

1. Va dans **Firestore Database** → **Règles**
2. Clique sur **Simulateur de règles** (Rules Playground)
3. Teste différents scénarios:

```javascript
// Test 1: Lecture de ses propres bookmarks
Location: /users/USER_ID_HERE/bibleBookmarks/data
Type: get
Auth: Authenticated with UID = USER_ID_HERE
Result: ✅ Allow

// Test 2: Lecture des bookmarks d'un autre utilisateur
Location: /users/OTHER_USER_ID/bibleBookmarks/data
Type: get
Auth: Authenticated with UID = USER_ID_HERE
Result: ❌ Deny
```

## 📝 Création des index (si nécessaire)

Si tu vois des erreurs de type "requires an index", Firebase te donnera un lien direct pour créer l'index. Clique dessus et l'index sera créé automatiquement.

## 🚨 Erreurs communes

### "Missing or insufficient permissions"

**Cause**: Les règles Firestore ne sont pas déployées ou l'utilisateur n'est pas authentifié

**Solution**:
1. Vérifie que les règles sont bien déployées (voir Étape 1)
2. Vérifie que l'utilisateur est connecté (`userProfile.uid` existe)
3. Vérifie les logs: `console.log('User ID:', userProfile?.uid)`

### "Permission denied on get/set"

**Cause**: L'utilisateur essaie d'accéder aux données d'un autre utilisateur

**Solution**:
- Vérifie que le `userId` passé à `firebaseSyncService` correspond bien à `request.auth.uid`
- Vérifie les logs pour voir quel userId est utilisé

## 📊 Monitoring

### Via Firebase Console

1. Va dans **Firestore Database**
2. Explore les collections créées
3. Vérifie que les documents sont bien créés sous `users/{userId}/`

### Via l'app

Utilise le panneau de debug dans l'onglet Profil:
- Clique sur "Lister toutes les clés" pour voir le cache local
- Clique sur "Actualiser statistiques" pour voir combien de données sont stockées

## 🔄 Migration des données existantes

Si tu as déjà des données en AsyncStorage local:

1. Les données locales continueront de fonctionner
2. Au premier changement, elles seront automatiquement synchronisées vers Firebase
3. Pour forcer une migration, utilise le panneau de debug:
   - Clique sur "Vider cache Firebase"
   - Relance l'app
   - Les données locales seront remontées vers Firebase

## 🎯 Prochaines étapes

1. ✅ Déployer les règles Firestore
2. ✅ Tester la synchronisation Bible
3. ⏳ Migrer MusicContext vers Firebase
4. ⏳ Migrer Méditation vers Firebase
5. ⏳ Documentation complète de l'architecture

## 💡 Tips

- **Coût**: Avec le debouncing de 3s, tu économises énormément de requêtes
- **Performance**: Le cache local rend les lectures instantanées
- **Offline**: Les données locales fonctionnent même sans connexion
- **Cross-device**: Change d'appareil et retrouve tes données automatiquement

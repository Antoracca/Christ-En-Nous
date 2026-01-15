# Guide de Gestion du Cache Local

## 🔍 Pourquoi les données restent après suppression Firebase?

L'application utilise un **système de cache local** via AsyncStorage pour:
- ✅ Améliorer les performances (lecture instantanée)
- ✅ Réduire les requêtes Firebase (économie de quota)
- ✅ Permettre l'utilisation offline

**Le problème:** Quand vous supprimez des données dans Firebase, le cache local n'est **pas automatiquement vidé**. L'app continue de lire les anciennes données du téléphone!

## 🛠️ Solutions

### **Solution 1: Bouton de Rafraîchissement** ⭐ (RECOMMANDÉ)

Dans l'écran Historique de Méditation, cliquez sur l'icône 🔄 en haut à droite pour **forcer le rechargement depuis Firebase**.

**Ce que ça fait:**
- Ignore le cache local
- Lit directement depuis Firebase
- Met à jour le cache avec les nouvelles données

---

### **Solution 2: Vider le Cache via le Code**

Si vous avez accès au code (dev mode), vous pouvez vider le cache manuellement:

#### Option A: Vider le cache d'un utilisateur spécifique

```typescript
import { clearUserCache } from '@/services/firebase/cacheUtils';
import { useAuth } from '@/context/AuthContext';

// Dans votre composant
const { userProfile } = useAuth();

// Vider le cache de l'utilisateur actuel
await clearUserCache(userProfile.uid);
```

#### Option B: Vider TOUT le cache (tous les utilisateurs)

```typescript
import { clearAllCache } from '@/services/firebase/cacheUtils';

// ⚠️ Attention: supprime tout le cache local!
await clearAllCache();
```

#### Option C: Inspecter le cache (debug)

```typescript
import { debugCacheInfo } from '@/services/firebase/cacheUtils';

// Afficher les infos du cache dans la console
await debugCacheInfo(userProfile.uid);
```

---

### **Solution 3: Désinstaller/Réinstaller l'App**

La méthode radicale mais efficace:
1. Désinstaller complètement l'application
2. Réinstaller l'application
3. Se reconnecter

**Effet:** Vide TOUT le cache local et AsyncStorage.

---

### **Solution 4: Ajouter un Bouton "Vider le Cache" dans les Paramètres**

Vous pouvez créer un bouton dans les paramètres de l'app:

```tsx
// Dans un écran Settings
import { Alert } from 'react-native';
import { clearUserCache } from '@/services/firebase/cacheUtils';
import { useAuth } from '@/context/AuthContext';

const SettingsScreen = () => {
  const { userProfile } = useAuth();

  const handleClearCache = () => {
    Alert.alert(
      'Vider le cache',
      'Êtes-vous sûr? Les données seront rechargées depuis le cloud.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Vider',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearUserCache(userProfile.uid);
              Alert.alert('Succès', 'Cache vidé avec succès!');
              // Recharger l'app ou la page actuelle
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de vider le cache');
            }
          }
        }
      ]
    );
  };

  return (
    <TouchableOpacity onPress={handleClearCache}>
      <Text>Vider le cache local</Text>
    </TouchableOpacity>
  );
};
```

---

## 📚 Architecture du Cache

### Comment ça fonctionne?

```
┌─────────────────┐
│   Composant     │
│   React         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────┐
│ Meditation      │─────▶│ Firebase     │
│ Service         │      │ Sync Service │
└─────────────────┘      └──────┬───────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                    ▼                         ▼
            ┌───────────────┐        ┌──────────────┐
            │ AsyncStorage  │        │   Firestore  │
            │ (Cache Local) │        │   (Cloud)    │
            └───────────────┘        └──────────────┘
```

### Flux de Lecture

1. **Lecture cache-first** (par défaut)
   - Service vérifie AsyncStorage
   - Si trouvé → retourne immédiatement
   - Mise à jour silencieuse en arrière-plan depuis Firebase

2. **Lecture force-remote** (avec forceRemote: true)
   - Service IGNORE AsyncStorage
   - Lit directement depuis Firebase
   - Met à jour le cache avec les nouvelles données

### Flux d'Écriture

1. **Écriture immédiate** (immediate: true)
   - Écrit d'abord dans AsyncStorage
   - Puis écrit immédiatement dans Firebase

2. **Écriture avec debounce** (par défaut)
   - Écrit d'abord dans AsyncStorage
   - Attend 3 secondes avant de sync vers Firebase
   - Si plusieurs écritures → une seule requête Firebase

---

## 🔧 Fichiers Modifiés

- `app/services/firebase/firebaseSyncService.ts` - Ajout des méthodes `clearUserCache()` et `clearAllCache()`
- `app/services/firebase/cacheUtils.ts` - Utilitaires pour vider le cache (NOUVEAU)
- `app/services/bible/meditationProgressService.ts` - Ajout du paramètre `forceRemote`
- `app/(tabs)/bible/meditation-history.tsx` - Bouton de rafraîchissement

---

## 💡 Recommandations

1. **Pour les utilisateurs finaux:** Utilisez le bouton 🔄 de rafraîchissement
2. **Pour le développement:** Utilisez `clearUserCache()` ou `debugCacheInfo()`
3. **Pour la production:** Ajoutez un bouton "Vider le cache" dans les paramètres
4. **En cas de gros problème:** Désinstallez/réinstallez l'app

---

## 🐛 Debug

Si vous voulez voir ce qui est dans le cache:

```typescript
import { debugCacheInfo } from '@/services/firebase/cacheUtils';

// Dans la console
await debugCacheInfo('USER_ID_ICI');

// Output:
// === CACHE INFO ===
// Utilisateur: abc123
// Nombre d'entrées en cache: 5
// Clés: [
//   '@firebase_cache_abc123_meditationProgress/state',
//   '@firebase_cache_abc123_userProgress/data',
//   ...
// ]
// ==================
```

---

## ❓ Questions Fréquentes

### Q: Le cache est-il automatiquement mis à jour?
**R:** Oui, mais en arrière-plan. La première lecture vient du cache (instantané), puis Firebase est interrogé silencieusement pour vérifier si les données ont changé.

### Q: Combien de temps le cache reste valide?
**R:** Indéfiniment, jusqu'à ce qu'il soit explicitement vidé ou que l'app soit désinstallée.

### Q: Le cache fonctionne offline?
**R:** Oui! C'est l'un des avantages. Les données en cache sont disponibles même sans connexion.

### Q: Vider le cache supprime les données Firebase?
**R:** Non! Vider le cache supprime uniquement les données locales. Les données Firebase restent intactes.

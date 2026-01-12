# Bibliothèque et Archives

## 📁 Structure des fichiers

```
app/
├── (tabs)/library/
│   ├── _layout.tsx          # Layout pour la navigation
│   ├── index.tsx            # Écran principal - Liste des médias
│   ├── media/
│   │   └── [id].tsx        # Écran de détail d'un média
│   └── README.md           # Ce fichier
├── components/library/
│   ├── SubscriptionModal.tsx # Modal d'abonnement avec bouquets
│   └── index.ts             # Exports
└── data/
    └── libraryData.ts       # Types et données des médias
```

## 🎯 Fonctionnalités implémentées

### ✅ Types de médias
- **Podcasts** : Enseignements audio/vidéo avec transcriptions
- **Livres** : Ouvrages complets avec pages, chapitres, éditeurs
- **Vidéos** : Enseignements vidéo
- **Audios** : Enregistrements audio
- **Textes** : Documents écrits
- **Références** : Commentaires bibliques et références croisées

### ✅ Système d'accès
- **Gratuit** : Accès libre à certains contenus
- **Premium** : Nécessite un abonnement
- **Achat** : Achat unique (à partir de 1500 FCFA)
- **Abonnement** : Accès via bouquets d'abonnement

### ✅ Bouquets d'abonnement
1. **Bouquet Essentiel** : 1500 FCFA/mois
   - Accès à 50+ livres premium
   - Podcasts exclusifs
   - Vidéos d'enseignement
   - Sans publicité

2. **Bouquet Premium** : 3000 FCFA/mois (Populaire)
   - Accès illimité à tous les contenus
   - Téléchargements hors ligne
   - Nouveautés en avant-première
   - Support prioritaire
   - Sans publicité

3. **Abonnement Annuel** : 30000 FCFA/an
   - Tous les avantages Premium
   - Économie de 20%
   - Accès à vie aux archives
   - Contenus exclusifs

### ✅ Fonctionnalités
- **Recherche** : Recherche par titre, auteur, description
- **Filtres** : Par catégorie et type de média
- **Recommandations** : Section "Pour Vous" avec contenus recommandés
- **Détails complets** : Pages de détail avec toutes les informations
- **Système de likes** : Interaction avec les contenus
- **Statistiques** : Vues, likes, durée, notation

## 🎨 Catégories disponibles

- Enseignements
- Doctrine
- Histoire
- Prière
- Évangélisation
- Leadership
- Famille
- Jeunesse

## 🔧 Utilisation

### Navigation depuis le menu
```typescript
// Dans HomeMenuModal
handleNavigation('/(tabs)/library')
```

### Accéder à un média
```typescript
router.push(`/(tabs)/library/media/${mediaId}`)
```

### Gérer les abonnements
```typescript
// Le modal d'abonnement s'ouvre automatiquement
// quand l'utilisateur essaie d'accéder à un contenu premium
setShowSubscriptionModal(true)
```

## 📊 Structure des données

### MediaItem
- Informations de base (titre, auteur, description)
- Métadonnées (thumbnail, type, catégorie)
- Statistiques (views, likes, rating)
- Accès (accessType, price, subscriptionRequired)
- Tags et langue

### Types spécialisés
- `PodcastEpisode` : Épisodes avec numéros, saisons, transcriptions
- `Book` : Livres avec ISBN, éditeur, pages, chapitres
- `Reference` : Références avec source et citation

## 🚀 Extension future

Le système est prêt pour l'intégration Firebase :
- Remplacement des données mockées par Firestore
- Gestion des abonnements avec Stripe/PayPal
- Téléchargements hors ligne
- Synchronisation des favoris
- Historique de lecture
- Recommandations basées sur l'IA

## 💳 Paiement

Le système de paiement est prêt à être intégré avec :
- Stripe
- PayPal
- Mobile Money (Orange Money, Moov Money)
- Cartes bancaires

Les prix sont en FCFA (Franc CFA).

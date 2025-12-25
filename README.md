# Christ en Nous

Christ en Nous est une application mobile Expo/React Native pensée pour centraliser la vie de l’église : parcours spirituels, Bible interactive, notifications communautaires et gestion des profils membres.

## Sommaire

1. [Fonctionnalités](#fonctionnalités)
2. [Architecture](#architecture)
3. [Prérequis et installation](#prérequis-et-installation)
4. [Configuration](#configuration)
5. [Scripts NPM](#scripts-npm)
6. [Tests et qualité](#tests-et-qualité)
7. [Roadmap / TODO](#roadmap--todo)
8. [Sous-projet email-api](#sous-projet-email-api)
9. [Ressources additionnelles](#ressources-additionnelles)

## Fonctionnalités

### Déjà implémenté
- Authentification Firebase + profils enrichis (photo, rôles, historique) avec synchronisation locale (`app/context/AuthContext.tsx`).
- Tableau de bord animé : entête dynamique, centre de notifications, actions rapides (`app/screens/home/HomeScreen.tsx`, `app/components/home`).
- Module Bible complet : API Scripture, stockage hors ligne, signets, surlignages, recherche avancée, suivi de progression (`app/services/bible`, `app/context/EnhancedBibleContext.tsx`).
- Paramétrage lecture (taille police, mode nuit, défilement auto) mémorisé (`app/context/ReadingSettingsContext.tsx`).
- Thème clair/sombre persistant, design responsive et bottom tab bar personnalisée (`app/context/ThemeContext.tsx`, `app/hooks/useResponsiveDesign.ts`).
- Flux d’inscription multi-étapes avec validations et ressources localisées (`app/components/register/steps`).
- Notifications modales riches, menu latéral animé, splash screen universel (`app/components/NotificationModal.tsx`, `app/context/HomeMenuContext.tsx`, `app/components/UniversalSplashScreen.tsx`).

### En chantier / placeholders
- Écrans Cours, Prières, Calendrier, Live à compléter (`app/screens/courses`, `app/screens/prayer`, etc.).
- Intégration chat, dons, diffusion live et analytics à finaliser.
- Tests automatisés (unitaire, e2e) inexistants.

## Architecture

```
app/
  components/         # UI partagée (forms, home, profile, register, ui…)
  constants/          # Thèmes, couleurs, fontes
  context/            # Providers globaux (Auth, Bible, Thème, Lecture…)
  hooks/              # Hooks personnalisés (responsive, migrations…)
  screens/            # Écrans organisés par domaines (auth, bible, home…)
  services/           # Bible (API, storage, tracking), services métier
  utils/              # Validations, helpers divers
navigation/           # Stack & Tab navigators
assets/               # Images, Lottie, données statiques
services/             # firebaseConfig, email service côté app
email-api/            # Micro-service Node pour l’envoi d’e-mails
public/               # Pages web (Expo, vérification email)
patches/              # patch-package pour dépendances tierces
```

Points clés :
- Aliases TypeScript/Babel (`@/*`) définis dans `tsconfig.json` et `babel.config.js`.
- Fournisseurs globaux instanciés dans `app/index.tsx`.
- Navigation principale dans `navigation/AppNavigator.tsx` (stack) + `navigation/MainNavigator.tsx` (tabs personnalisés).
- Moteur Bible modulaire : `app/services/bible/index.ts` agrège API, cache et suivi.
- Ressources d’inscription (pays, ministères) dans `assets/data/`.

## Prérequis et installation

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`) facultatif
- Gestionnaire de paquets : pnpm recommandé (`pnpm install`) ou npm (`npm install`)

```bash
pnpm install          # installe les dépendances
pnpm start            # équivaut à npx expo start
pnpm run android      # build/dev Android
pnpm run ios          # build/dev iOS
pnpm run web          # démarrage Expo Web
```

## Configuration

1. **Variables d’environnement**

   Créez un `.env` à la racine :

   ```
   EXPO_PUBLIC_BIBLE_API_KEY=<VOTRE_CLE_API_SCRIPTURE>
   ```

   Ne commitez jamais la clé réelle (celle présente actuellement doit être régénérée).

2. **Firebase**

   - Les identifiants sont dans `services/firebase/firebaseConfig.ts`.
   - En production, externalisez ces secrets via Firebase Remote Config ou environnement sécurisé.

3. **Service email**

   - `services/email/emailService.ts` cible l’API déployée (voir section [Sous-projet email-api](#sous-projet-email-api)).
   - Vérifiez les endpoints et les clés d’API côté backend.

## Scripts NPM

| Script            | Description                               |
|-------------------|-------------------------------------------|
| `pnpm start`      | Expo Dev Server                           |
| `pnpm run android`| Build/Run Android                         |
| `pnpm run ios`    | Build/Run iOS                             |
| `pnpm run web`    | Expo Web                                  |
| `pnpm run lint`   | Vérifie la qualité ESLint                 |
| `pnpm run prepare`| Applique `patch-package`                  |
| `pnpm run reset-project` | Script Expo pour réinitialiser l’app (inutile ici) |

## Tests et qualité

- Jest + Testing Library sont installés (`package.json`) mais aucune suite de tests n’est fournie. Ajoutez des tests unitaires sur les contextes (`AuthContext`, `EnhancedBibleContext`) et les hooks (`useResponsiveDesign`).
- Activez ESLint (`pnpm run lint`) pour contrôler la qualité.
- Nettoyez les `console.log` de debug ou encapsulez-les derrière un logger conditionnel.

## Roadmap / TODO

- Finaliser les écrans métiers (Prières, Cours, Live, Calendrier).
- Industrialiser les appels API (gestion d’erreurs, retries mutualisés, monitoring).
- Sécuriser les secrets (retirer `.env` et `service-account.json` du dépôt, ajouter `.env.example`).
- Mettre en place CI/CD (lint + tests) et monitoring de crash (Sentry).
- Dédupliquer les composants hérités (`components/` vs `app/components/`).

## Sous-projet email-api

Le dossier `email-api/` contient un micro-service Node/Express (gCloud Run) chargé d’envoyer les emails personnalisés.

- Le compte de service Firebase (`service-account.json`) et la clé admin sont commités : **urgent** à révoquer et retirer.
- Pour développer :

```bash
cd email-api
pnpm install
pnpm run dev
```

Déployez via Cloud Build (`cloudbuild.yaml`).

## Ressources additionnelles

- Documentation Expo : https://docs.expo.dev/
- API Scripture : https://scripture.api.bible/
- React Native Firebase : https://rnfirebase.io/

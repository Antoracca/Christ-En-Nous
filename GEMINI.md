# Project Context: Christ-En-Nous

## Overview
**Christ-En-Nous** is a mobile application built with **React Native** and **Expo**, designed for a religious community. It features authentication, user profiles, biometric security, and likely content delivery (courses, prayers, bible).

## Tech Stack
- **Framework:** React Native (0.81.5) with Expo (SDK 54).
- **Language:** TypeScript.
- **Routing:** `expo-router` (v6) using file-based routing in the `app/` directory.
- **Backend:** Firebase (v11) for Authentication and Firestore.
- **UI Library:** `react-native-paper` (v5) for material design components.
- **Styling:** `StyleSheet.create` is the primary styling method observed, often used alongside `react-native-paper` theming. `twrnc` (Tailwind) is installed but check context before using.
- **Icons:** `@expo/vector-icons` (FontAwesome5, MaterialCommunityIcons).
- **Animations:** `react-native-reanimated` and `Animated` API.
- **Forms:** `react-hook-form` and manual validation patterns.

## Architecture & Directory Structure
- **`app/`**: Contains the application screens and routes (Expo Router).
  - `(auth)/`: Authentication screens (login, register, etc.).
  - `(tabs)/`: Main application tabs (home, bible, profile, etc.).
  - `(modals)/`: Modal screens.
  - `_layout.tsx`: Root layout configuration.
- **`components/`**: Reusable UI components.
- **`services/`**: API interactions.
  - `firebase/`: Firebase configuration and service functions.
- **`hooks/`**: Custom React hooks (e.g., `useBiometricAuth`, `useAppTheme`).
- **`context/`**: React Context providers (`AuthContext`, `ThemeContext`).
- **`constants/`**: Global constants (colors, fonts, theme).
- **`utils/`**: Helper functions and validation logic.
- **`assets/`**: Images, fonts, and animations.

## Coding Conventions
1.  **Component Style**: Functional components with Hooks.
2.  **Logic Separation**: Extract complex business logic into custom hooks (e.g., `useLogin` is defined separately from the UI component).
3.  **Imports**: Group imports by category (React/RN -> Libraries -> Internal).
4.  **Styling**: 
    -   Use `StyleSheet.create` for complex layouts.
    -   Utilize `react-native-paper`'s `theme` for colors and consistency.
    -   Support safe areas using `react-native-safe-area-context`.
5.  **Navigation**: Use `useRouter` and `useLocalSearchParams` from `expo-router`.
6.  **Comments**: Use banner-style comments to separate sections in large files (e.g., `// ===== COMPONENT =====`).

## Firebase Practices
- Use modular SDK (`getDocs`, `query`, `collection`).
- Auth state is likely managed via a Context provider (`AuthContext`).
- Config location: `services/firebase/firebaseConfig.ts`.

## Development Rules for Gemini
- **Strict Typing**: Always use TypeScript interfaces/types for props and state.
- **Expo Compatibility**: Prefer Expo libraries (e.g., `expo-blur`, `expo-image-picker`) over raw React Native native modules requiring linking.
- **Routing**: Respect the directory-based routing of `expo-router`. Do not create `React Navigation` stacks unless wrapping them inside an Expo Router layout.

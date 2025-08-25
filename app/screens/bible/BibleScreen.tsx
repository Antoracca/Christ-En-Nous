// app/screens/bible/BibleScreen.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// BibleProvider is now global, imported from the main app

// Écrans principaux
import BibleHomeScreen from './BibleHomeScreen';
import BibleReaderScreen from './BibleReaderScreen';
import BibleSettingsScreen from './BibleSettingsScreen';
import BibleReaderSettingsScreen from './BibleReaderSettingsScreen';

// Méditation et Apprentissage
import BibleMeditationScreen from './BibleMeditationScreen';
import BibleMeditationSettingsScreen from './BibleMeditationSettingsScreen';
import BibleLearningScreen from './BibleLearningScreen';

// Plans et progression
import BiblePlanScreen from './BiblePlanScreen';

// Recherche
import BibleRechercheScreen from './BibleRechercheScreen';

// Sélection de versions
import BibleVersionSelectorScreen from './BibleVersionSelectorScreen';

const Stack = createNativeStackNavigator();

function BibleNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      {/* Accueil Bible - ÉCRAN PRINCIPAL */}
      <Stack.Screen 
        name="BibleHome" 
        component={BibleHomeScreen}
        options={{ title: 'Accueil Bible' }}
      />

      {/* Lecture simple */}
      <Stack.Screen 
        name="BibleReader" 
        component={BibleReaderScreen}
        options={{ title: 'Lecture de la Bible' }}
      />

      {/* Recherche */}
      <Stack.Screen 
        name="BibleRecherche" 
        component={BibleRechercheScreen}
        options={{ title: 'Recherche Biblique' }}
      />
      
      {/* Sélection de versions */}
      <Stack.Screen 
        name="BibleVersionSelector" 
        component={BibleVersionSelectorScreen}
        options={{ 
          title: 'Choisir votre version',
          headerShown: true,
          headerBackTitle: 'Retour',
          headerTintColor: undefined, // Utilise la couleur du thème
          headerStyle: {
            backgroundColor: undefined, // Utilise la couleur du thème
          },
          headerTitleStyle: {
            fontFamily: 'Nunito_700Bold',
          },
        }}
      />
      
      <Stack.Screen 
        name="BibleReaderSettings" 
        component={BibleReaderSettingsScreen}
        options={{ title: 'Paramètres Lecture' }}
      />

      {/* Méditation & apprentissage */}
      <Stack.Screen 
        name="BibleMeditation" 
        component={BibleMeditationScreen}
        options={{ title: 'Méditation' }}
      />
      <Stack.Screen 
        name="BibleMeditationSettings" 
        component={BibleMeditationSettingsScreen}
        options={{ title: 'Paramètres Méditation' }}
      />
      <Stack.Screen 
        name="BibleLearning" 
        component={BibleLearningScreen}
        options={{ title: 'Apprentissage' }}
      />

      {/* Plan & progression */}
      <Stack.Screen 
        name="BiblePlan" 
        component={BiblePlanScreen}
        options={{ title: 'Plan de lecture' }}
      />

      {/* Paramètres globaux */}
      <Stack.Screen 
        name="BibleSettings" 
        component={BibleSettingsScreen}
        options={{ title: 'Paramètres' }}
      />
    </Stack.Navigator>
  );
}

// Point d'entrée - BibleProvider is now global
export default function BibleScreen() {
  return <BibleNavigator />;
}

// app/screens/bible/BibleScreen.tsx
import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppTheme } from '@/hooks/useAppTheme';
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
  const theme = useAppTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        animation: 'slide_from_right',
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTitleStyle: {
          color: theme.custom.colors.text,
          fontFamily: 'Nunito_700Bold',
        },
        headerTintColor: theme.colors.primary,
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
        options={{ 
          title: 'Lecture de la Bible',
          headerBackTitle: 'Retour'
        }}
      />

      {/* Recherche */}
      <Stack.Screen 
        name="BibleRecherche" 
        component={BibleRechercheScreen}
        options={{ 
          title: 'Recherche Biblique',
          headerBackTitle: 'Retour'
        }}
      />
      
      {/* Sélection de versions */}
      <Stack.Screen 
        name="BibleVersionSelector" 
        component={BibleVersionSelectorScreen}
        options={{ 
          title: 'Choisir votre version',
          headerBackTitle: 'Retour'
        }}
      />
      
      <Stack.Screen 
        name="BibleReaderSettings" 
        component={BibleReaderSettingsScreen}
        options={{ 
          title: 'Paramètres Lecture',
          headerBackTitle: 'Retour'
        }}
      />

      {/* Méditation & apprentissage */}
      <Stack.Screen 
        name="BibleMeditation" 
        component={BibleMeditationScreen}
        options={{ 
          title: 'Méditation',
          headerBackTitle: 'Retour'
        }}
      />
      <Stack.Screen 
        name="BibleMeditationSettings" 
        component={BibleMeditationSettingsScreen}
        options={{ 
          title: 'Paramètres Méditation',
          headerBackTitle: 'Retour'
        }}
      />
      <Stack.Screen 
        name="BibleLearning" 
        component={BibleLearningScreen}
        options={{ 
          title: 'Apprentissage',
          headerBackTitle: 'Retour'
        }}
      />

      {/* Plan & progression */}
      <Stack.Screen 
        name="BiblePlan" 
        component={BiblePlanScreen}
        options={{ 
          title: 'Plan de lecture',
          headerBackTitle: 'Retour'
        }}
      />

      {/* Paramètres globaux */}
      <Stack.Screen 
        name="BibleSettings" 
        component={BibleSettingsScreen}
        options={{ 
          title: 'Paramètres',
          headerBackTitle: 'Retour'
        }}
      />
    </Stack.Navigator>
  );
}

// Point d'entrée - BibleProvider is now global
export default function BibleScreen() {
  return <BibleNavigator />;
}

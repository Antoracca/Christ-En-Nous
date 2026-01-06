// app/index.tsx - Page d'index vide, la redirection se fait dans _layout.tsx
// Ce fichier existe juste pour satisfaire Expo Router qui requiert un index
import { View } from 'react-native';

export default function Index() {
  // La logique de redirection est entièrement gérée par RootLayoutNav dans _layout.tsx
  // Ce composant ne sera affiché que très brièvement avant la redirection
  return <View style={{ flex: 1, backgroundColor: '#ffffff' }} />;
}

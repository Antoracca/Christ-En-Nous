import { useFonts, Nunito_400Regular, Nunito_700Bold } from '@expo-google-fonts/nunito';
import AppNavigator from '../navigation/AppNavigator';
import { Text } from 'react-native';

export default function App() {
  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_700Bold,
  });

  if (!fontsLoaded) {
    return <Text>Chargement des polices...</Text>;
  }

  return <AppNavigator />;
}

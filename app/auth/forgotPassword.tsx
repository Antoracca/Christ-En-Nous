import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { TextInput, Button, HelperText } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

export default function ForgotPassword() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.wrapper}>
        <Text style={styles.title}>Mot de passe oublié</Text>
        <Text style={styles.subtitle}>
          Entrez votre email pour recevoir un lien de réinitialisation
        </Text>

        <TextInput
          label="Email"
          keyboardType="email-address"
          mode="outlined"
          autoCapitalize="none"
          style={styles.input}
        />
        <HelperText type="info" visible>
          Vous recevrez un lien de réinitialisation si cet email existe
        </HelperText>

        <Button mode="contained" onPress={() => {}} style={styles.button}>
          Envoyer
        </Button>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backLink}>← Revenir à la connexion</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  wrapper: { flex: 1, padding: 20, justifyContent: 'center' },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0A72BB',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#444',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#FFF',
    marginBottom: 5,
  },
  button: {
    marginTop: 10,
    marginBottom: 20,
    backgroundColor: '#FBBF24',
  },
  backLink: {
    textAlign: 'center',
    color: '#0A72BB',
    textDecorationLine: 'underline',
    fontSize: 14,
  },
});

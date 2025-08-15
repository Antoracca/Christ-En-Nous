// app/components/profile/Avatar.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image'; // Importation de expo-image

interface AvatarProps {
  photoURL: string | null | undefined;
  prenom: string | null | undefined;
  nom: string | null | undefined;
  size?: number;
}

// Fonction pour générer une couleur de fond stable basée sur le nom
const generateColor = (name: string) => {
  let hash = 0;
  if (!name) return '#CCCCCC'; // Couleur par défaut si pas de nom
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }
  const color = `hsl(${hash % 360}, 75%, 60%)`;
  return color;
};

const Avatar = ({ photoURL, prenom, nom, size = 120 }: AvatarProps) => {
  // Si une URL de photo est fournie, on l'affiche avec expo-image
  if (photoURL) {
    return (
      // On enveloppe l'image dans une vue pour garantir le style circulaire
      <View style={[styles.avatarContainer, { width: size, height: size, borderRadius: size / 2 }]}>
        <Image 
            source={{ uri: photoURL }} 
            style={styles.avatarImage} // L'image remplit le conteneur
            cachePolicy="disk"
            transition={300}
        />
      </View>
    );
  }

  // Sinon, on affiche les initiales
  const initials = `${prenom ? prenom[0] : ''}${nom ? nom[0] : ''}`.toUpperCase();
  const backgroundColor = generateColor(prenom || 'User');

  return (
    <View style={[styles.initialsContainer, { width: size, height: size, borderRadius: size / 2, backgroundColor }]}>
      <Text style={[styles.initialsText, { fontSize: size / 2.5 }]}>{initials}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  // Conteneur qui force la forme circulaire et cache les coins
  avatarContainer: {
    borderWidth: 4,
    borderColor: 'white',
    backgroundColor: '#E0E0E0',
    overflow: 'hidden', // La clé pour masquer les coins de l'image
    justifyContent: 'center',
    alignItems: 'center',
  },
  // L'image remplit maintenant le conteneur circulaire
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  initialsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'white',
  },
  initialsText: {
    color: 'white',
    fontWeight: 'bold',
    fontFamily: 'Nunito_700Bold',
  },
});

export default Avatar;

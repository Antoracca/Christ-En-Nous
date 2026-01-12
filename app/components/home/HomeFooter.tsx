import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function HomeFooter() {
  const theme = useAppTheme();
  
  // Couleurs forcées pour contraste maximum
  const textColor = theme.dark ? 'rgba(255,255,255,0.9)' : '#1F2937'; // Quasi blanc ou Gris très sombre
  const subTextColor = theme.dark ? 'rgba(255,255,255,0.6)' : '#4B5563'; // Gris moyen

  const handleSocial = (url: string) => {
    Linking.openURL(url).catch(err => console.error("Error", err));
  };

  return (
    <View style={styles.container}>
      <View style={[styles.divider, { backgroundColor: theme.colors.outline + '20' }]} />

      <View style={styles.content}>
        
        {/* VISION COMPLÈTE */}
        <View style={styles.quoteContainer}>
          <MaterialCommunityIcons name="format-quote-open" size={24} color={theme.colors.primary} />
          <Text style={[styles.quoteText, { color: textColor }]}>
            Bâtir une génération de disciples passionnés, ancrés dans la saine doctrine de la Parole de Dieu et remplis de la puissance du Saint-Esprit.
          </Text>
          <Text style={[styles.pastorName, { color: theme.colors.primary }]}>- VISION CHRIST EN NOUS</Text>
        </View>

        {/* RÉSEAUX SOCIAUX */}
        <View style={styles.socialRow}>
          <TouchableOpacity style={[styles.socialBtn, { backgroundColor: '#1877F2' }]} onPress={() => handleSocial('https://facebook.com')}>
            <FontAwesome5 name="facebook-f" size={18} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.socialBtn, { backgroundColor: '#E1306C' }]} onPress={() => handleSocial('https://instagram.com')}>
            <FontAwesome5 name="instagram" size={18} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.socialBtn, { backgroundColor: '#FF0000' }]} onPress={() => handleSocial('https://youtube.com')}>
            <FontAwesome5 name="youtube" size={16} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.socialBtn, { backgroundColor: '#000000' }]} onPress={() => handleSocial('https://tiktok.com')}>
            <FontAwesome5 name="tiktok" size={16} color="white" />
          </TouchableOpacity>
        </View>

        {/* LIENS UTILES - PARFAITEMENT CENTRÉS */}
        <View style={styles.linksRow}>
          <TouchableOpacity style={styles.linkButton}>
            <Text style={[styles.linkText, { color: textColor }]}>Contact</Text>
          </TouchableOpacity>
          
          <View style={[styles.dot, { backgroundColor: textColor, opacity: 0.4 }]} />
          
          <TouchableOpacity style={styles.linkButton}>
            <Text style={[styles.linkText, { color: textColor }]}>Faire un don</Text>
          </TouchableOpacity>
          
          <View style={[styles.dot, { backgroundColor: textColor, opacity: 0.4 }]} />
          
          <TouchableOpacity style={styles.linkButton}>
            <Text style={[styles.linkText, { color: textColor }]}>Mentions Légales</Text>
          </TouchableOpacity>
        </View>

        {/* SIGNATURE */}
        <Text style={[styles.copyright, { color: subTextColor }]}>
          © 2026 Christ En Nous. Tous droits réservés.
        </Text>
        <Text style={[styles.madeWith, { color: subTextColor }]}>
          Développé par le Pôle Média
        </Text>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 25,
    paddingBottom: 80, // Marge bas augmentée pour éviter les conflits avec la nav bar
    marginTop: 30,
    backgroundColor: 'transparent', // S'assure qu'il n'y a pas de fond parasite
  },
  divider: {
    height: 1,
    width: '100%',
    marginBottom: 30,
  },
  content: {
    alignItems: 'center',
  },
  quoteContainer: {
    alignItems: 'center',
    marginBottom: 35,
    width: '100%',
  },
  quoteText: {
    fontFamily: 'Nunito_600SemiBold',
    fontStyle: 'italic',
    fontSize: 15, // Un peu plus grand
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 10,
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  pastorName: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 12,
    letterSpacing: 1.5,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 24, // Plus espacé
    marginBottom: 40,
  },
  socialBtn: {
    width: 44, // Plus grand
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  linksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Centre horizontalement
    gap: 12,
    marginBottom: 24,
    width: '100%',
  },
  linkButton: {
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  linkText: {
    fontSize: 14, // Plus lisible
    fontFamily: 'Nunito_700Bold', // Plus gras
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  copyright: {
    fontSize: 11,
    fontFamily: 'Nunito_600SemiBold', // Plus gras
    textAlign: 'center',
    marginBottom: 4,
  },
  madeWith: {
    fontSize: 10,
    fontFamily: 'Nunito_600SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

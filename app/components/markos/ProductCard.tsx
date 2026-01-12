import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Feather, Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { BusinessProduct } from '@/data/markosBusinessData';
import { useAppTheme } from '@/hooks/useAppTheme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

export default function ProductCard({ product, onPress }: { product: BusinessProduct; onPress: () => void }) {
  const theme = useAppTheme();

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: product.images[0] }} style={styles.image} contentFit="cover" />
        
        {/* Prix Flottant (Glassmorphism) */}
        <BlurView intensity={30} tint="dark" style={styles.priceTag}>
          <Text style={styles.priceText}>
            {product.isPromo ? product.promoPrice : product.price} <Text style={styles.currency}>{product.currency}</Text>
          </Text>
        </BlurView>

        {product.isPromo && (
          <View style={styles.promoBadge}>
            <Text style={styles.promoText}>-30%</Text>
          </View>
        )}

        <TouchableOpacity style={styles.heartButton}>
          <Ionicons name="heart-outline" size={18} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.details}>
        <Text style={[styles.title, { color: theme.colors.onSurface }]} numberOfLines={2}>
          {product.title}
        </Text>
        <View style={styles.sellerRow}>
          <Image source={{ uri: product.seller.avatar }} style={styles.sellerAvatar} />
          <Text style={[styles.sellerName, { color: theme.colors.onSurfaceVariant }]} numberOfLines={1}>
            {product.seller.name}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  imageContainer: {
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 10,
    backgroundColor: '#E5E7EB',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  priceTag: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    overflow: 'hidden',
  },
  priceText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Nunito_800ExtraBold',
  },
  currency: {
    fontSize: 10,
    fontFamily: 'Nunito_600SemiBold',
  },
  promoBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  promoText: {
    color: 'white',
    fontSize: 10,
    fontFamily: 'Nunito_800ExtraBold',
  },
  heartButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  details: {
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
    marginBottom: 4,
    lineHeight: 18,
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sellerAvatar: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  sellerName: {
    fontSize: 11,
    fontFamily: 'Nunito_600SemiBold',
  },
});

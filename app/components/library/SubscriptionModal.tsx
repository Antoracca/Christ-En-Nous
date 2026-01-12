// Modal d'abonnement avec les bouquets
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';
import { SUBSCRIPTION_BUNDLES, SubscriptionBundle } from '@/data/libraryData';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

interface SubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  onSubscribe: (bundle: SubscriptionBundle) => void;
}

export default function SubscriptionModal({ visible, onClose, onSubscribe }: SubscriptionModalProps) {
  const theme = useAppTheme();
  const [selectedBundle, setSelectedBundle] = useState<string | null>(null);

  const handleSubscribe = (bundle: SubscriptionBundle) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedBundle(bundle.id);
    
    // Simulation du paiement
    Alert.alert(
      'Confirmer l\'abonnement',
      `Voulez-vous vous abonner à "${bundle.name}" pour ${bundle.price} FCFA/mois ?`,
      [
        { text: 'Annuler', style: 'cancel', onPress: () => setSelectedBundle(null) },
        {
          text: 'Confirmer',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            onSubscribe(bundle);
            onClose();
            setSelectedBundle(null);
          },
        },
      ]
    );
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <BlurView intensity={20} style={styles.blurContainer}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: theme.colors.onSurface }]}>Abonnements</Text>
              <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
                Accédez à tous les contenus premium
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={24} color={theme.colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {SUBSCRIPTION_BUNDLES.map((bundle) => (
              <BundleCard
                key={bundle.id}
                bundle={bundle}
                isSelected={selectedBundle === bundle.id}
                onPress={() => handleSubscribe(bundle)}
              />
            ))}

            <View style={styles.infoSection}>
              <MaterialCommunityIcons name="information" size={20} color={theme.colors.primary} />
              <Text style={[styles.infoText, { color: theme.colors.onSurfaceVariant }]}>
                Les abonnements sont renouvelés automatiquement. Vous pouvez annuler à tout moment.
              </Text>
            </View>
          </ScrollView>
        </View>
      </BlurView>
    </Modal>
  );
}

const BundleCard = ({
  bundle,
  isSelected,
  onPress,
}: {
  bundle: SubscriptionBundle;
  isSelected: boolean;
  onPress: () => void;
}) => {
  const theme = useAppTheme();

  return (
    <TouchableOpacity
      style={[
        styles.bundleCard,
        isSelected && { borderColor: bundle.color, borderWidth: 2 },
        { borderColor: theme.colors.outline + '40' },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {bundle.isPopular && (
        <View style={[styles.popularBadge, { backgroundColor: bundle.color }]}>
          <Text style={styles.popularText}>POPULAIRE</Text>
        </View>
      )}

      <LinearGradient
        colors={[bundle.color, bundle.color + '80']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.bundleHeader}
      >
        <MaterialCommunityIcons name="crown" size={32} color="white" />
        <Text style={styles.bundleName}>{bundle.name}</Text>
        {bundle.discount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{bundle.discount}%</Text>
          </View>
        )}
      </LinearGradient>

      <View style={styles.bundleContent}>
        <View style={styles.priceContainer}>
          <Text style={[styles.price, { color: theme.colors.onSurface }]}>
            {bundle.price.toLocaleString()} FCFA
          </Text>
          <Text style={[styles.pricePeriod, { color: theme.colors.onSurfaceVariant }]}>
            / {bundle.plan === 'monthly' ? 'mois' : bundle.plan === 'yearly' ? 'an' : 'à vie'}
          </Text>
        </View>

        <Text style={[styles.bundleDescription, { color: theme.colors.onSurfaceVariant }]}>
          {bundle.description}
        </Text>

        <View style={styles.featuresList}>
          {bundle.features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <MaterialCommunityIcons name="check-circle" size={16} color={bundle.color} />
              <Text style={[styles.featureText, { color: theme.colors.onSurface }]}>{feature}</Text>
            </View>
          ))}
        </View>

        <View style={styles.mediaCount}>
          <MaterialCommunityIcons name="library" size={14} color={theme.colors.onSurfaceVariant} />
          <Text style={[styles.mediaCountText, { color: theme.colors.onSurfaceVariant }]}>
            {bundle.mediaCount}+ contenus disponibles
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.subscribeButton, { backgroundColor: bundle.color }]}
          onPress={onPress}
        >
          <Text style={styles.subscribeButtonText}>S'abonner</Text>
          <Feather name="arrow-right" size={18} color="white" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  blurContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Nunito_800ExtraBold',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    marginTop: 4,
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  bundleCard: {
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  popularBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 10,
  },
  popularText: {
    color: 'white',
    fontSize: 10,
    fontFamily: 'Nunito_800ExtraBold',
  },
  bundleHeader: {
    padding: 20,
    alignItems: 'center',
    position: 'relative',
  },
  bundleName: {
    color: 'white',
    fontSize: 20,
    fontFamily: 'Nunito_800ExtraBold',
    marginTop: 8,
  },
  discountBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'white',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  discountText: {
    color: '#EF4444',
    fontSize: 11,
    fontFamily: 'Nunito_800ExtraBold',
  },
  bundleContent: {
    padding: 20,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  price: {
    fontSize: 28,
    fontFamily: 'Nunito_800ExtraBold',
  },
  pricePeriod: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    marginLeft: 4,
  },
  bundleDescription: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    marginBottom: 16,
    lineHeight: 20,
  },
  featuresList: {
    marginBottom: 16,
    gap: 10,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  featureText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Nunito_600SemiBold',
    lineHeight: 18,
  },
  mediaCount: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 6,
  },
  mediaCountText: {
    fontSize: 12,
    fontFamily: 'Nunito_400Regular',
  },
  subscribeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
  },
  subscribeButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Nunito_800ExtraBold',
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    gap: 12,
    marginTop: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Nunito_400Regular',
    lineHeight: 18,
  },
});

// app/screens/profile/ModifierProfilScreen.tsx

import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Alert, ActivityIndicator, SafeAreaView, Linking, Platform,
  StatusBar, Modal, FlatList, Dimensions, Image, Keyboard
} from 'react-native';
import { TextInput, Button, HelperText } from 'react-native-paper';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useFocusEffect } from '@react-navigation/native';
import debounce from 'lodash.debounce';
import isEqual from 'lodash.isequal';
import { Asset } from 'expo-asset';


// Hooks, contexte et composants
import { useAuth } from '@/context/AuthContext';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { UserProfile, ChurchRole } from '@/context/AuthContext';
import Avatar from '@/components/profile/Avatar';
import rolesData from 'assets/data/churchRoles.json';
import churches from 'assets/data/churches';


// Firebase et fonctions de validation
import { db } from 'services/firebase/firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';
import {
  isUsernameTaken, isPhoneTaken, isNameAndSurnameTaken,
  isValidUsernameFormat, isValidPhoneNumber
} from '@/utils/profileValidation';

// --- Sous-composants UI ---

const ReadOnlyField = ({ label, value, isMultiLine = false, emptyValue = 'Non renseigné' }: { label: string, value: string | undefined | null, isMultiLine?: boolean, emptyValue?: string }) => {
  const theme = useAppTheme();
  return (
    <View style={styles.readOnlyFieldContainer}>
      <Text style={[styles.readOnlyLabel, { color: theme.custom.colors.placeholder }]}>{label}</Text>
      <Text style={[styles.readOnlyValue, { color: theme.custom.colors.text, ...(isMultiLine && { lineHeight: 22 }) }]}>
        {value || emptyValue}
      </Text>
    </View>
  );
};

const ValidationInput = ({ label, value, validationStatus, onChangeText, ...props }: any) => {
  const getIcon = () => {
    switch (validationStatus.status) {
      case 'checking': return <ActivityIndicator size="small" />;
      case 'valid': return <MaterialCommunityIcons name="check-circle" size={24} color="#10B981" />;
      case 'invalid': return <MaterialCommunityIcons name="alert-circle" size={24} color="#EF4444" />;
      case 'info': return <MaterialCommunityIcons name="information" size={24} color="#3B82F6" />;
      default: return null;
    }
  };
  return (
    <View>
      <TextInput
        label={label}
        value={value}
        onChangeText={onChangeText}
        style={styles.input}
        mode="outlined"
        right={getIcon() ? <TextInput.Icon icon={() => getIcon()} /> : null}
        {...props}
      />
      <HelperText
        type={validationStatus.status === 'invalid' ? 'error' : 'info'}
        visible={!!validationStatus.message}
        style={validationStatus.status === 'invalid' ? styles.errorTextHelper : styles.infoTextHelper}
      >
        {validationStatus.message}
      </HelperText>
    </View>
  );
};

// --- COMPOSANT POUR LA GESTION DES RÔLES OFFICIELS ---
const RoleEditor = ({ roles, setRoles }: { roles: ChurchRole[], setRoles: (roles: ChurchRole[]) => void }) => {
  const theme = useAppTheme();
  const [isFunctionModalVisible, setFunctionModalVisible] = useState(false);
  const [isSubFunctionModalVisible, setSubFunctionModalVisible] = useState(false);
  const [selectedFonction, setSelectedFonction] = useState('');

  const MAX_ROLES = 5;
  const rolesRestants = MAX_ROLES - roles.length;

  const fonctions = useMemo(() => Object.keys(rolesData), []);
  const sousFonctions = useMemo(() => {
    return selectedFonction ? rolesData[selectedFonction as keyof typeof rolesData] || [] : [];
  }, [selectedFonction]);

  const handleSelectFonction = (fonction: string) => {
    setFunctionModalVisible(false);
    setSelectedFonction(fonction);
    const sousFonctionsDisponibles = rolesData[fonction as keyof typeof rolesData] || [];
    if (sousFonctionsDisponibles.length === 0) {
      handleAddRole(fonction, '');
    } else {
      setTimeout(() => setSubFunctionModalVisible(true), 250);
    }
  };

  const handleSelectSousFonction = (sousFonction: string) => {
    setSubFunctionModalVisible(false);
    handleAddRole(selectedFonction, sousFonction);
  };

  const handleAddRole = (fonction: string, sousFonction: string) => {
    const newRole = { fonction, sousFonction };
    if (!roles.some(r => r.fonction === newRole.fonction && r.sousFonction === newRole.sousFonction)) {
      setRoles([...roles, newRole]);
    } else {
      Alert.alert("Doublon", "Ce rôle a déjà été ajouté.");
    }
    setSelectedFonction('');
  };

  const handleRemoveRole = (index: number) => {
    setRoles(roles.filter((_, i) => i !== index));
  };

  return (
    <View>
     <Text style={[styles.subSectionTitle, { color: theme.custom.colors.text }]}>Rôles Officiels</Text>
<Text style={[styles.fieldDescription, { color: theme.custom.colors.placeholder }]}>
        Sélectionnez vos responsabilités structurées au sein de l&apos;église. Vous pouvez en ajouter jusqu&apos;à {MAX_ROLES}.
      </Text>
      {roles.length > 0 && roles.map((role, index) => (
        <View key={index} style={[styles.roleChip, { 
  backgroundColor: theme.colors.surfaceVariant 
}]}>
  <Text style={[styles.roleText, { color: theme.custom.colors.text }]} numberOfLines={1}>
    {role.fonction}{role.sousFonction ? ` - ${role.sousFonction}` : ''}
  </Text>
  <TouchableOpacity onPress={() => handleRemoveRole(index)}>
    <Feather name="x-circle" size={20} color={theme.custom.colors.placeholder} />
  </TouchableOpacity>
</View>
      ))}
      
      {rolesRestants > 0 ? (
       <TouchableOpacity style={[styles.addButton, { 
  backgroundColor: theme.colors.primaryContainer 
}]} onPress={() => setFunctionModalVisible(true)}>
  <Feather name="plus-circle" size={20} color={theme.colors.primary} />
  <Text style={[styles.addButtonLabel, { color: theme.colors.primary }]}>
    Ajouter un rôle officiel ({rolesRestants} restants)
  </Text>
</TouchableOpacity>
      ) : (
        <Text style={[styles.limitReachedText, { color: theme.custom.colors.placeholder }]}>Limite de 5 rôles officiels atteinte.</Text>
      )}

      {/* MODAL POUR LA FONCTION */}
      <Modal transparent visible={isFunctionModalVisible} onRequestClose={() => setFunctionModalVisible(false)}>
  <View style={styles.modalOverlay}>
    <View style={[styles.modalCard, { backgroundColor: theme.colors.surface }]}>
      <View style={[styles.modalHeader, { borderBottomColor: theme.colors.outline }]}>
        <Text style={[styles.modalTitle, { color: theme.custom.colors.text }]}>Étape 1: Choisir une fonction</Text>
        <Button onPress={() => setFunctionModalVisible(false)}>Fermer</Button>
      </View>
            <FlatList data={fonctions} keyExtractor={(item) => item} renderItem={({ item }) => (
              <TouchableOpacity style={styles.modalItem} onPress={() => handleSelectFonction(item)}>
  <Text style={[styles.modalItemText, { color: theme.custom.colors.text }]}>{item}</Text>
</TouchableOpacity>
            )}/>
          </View>
        </View>
      </Modal>

      {/* MODAL POUR LA SOUS-FONCTION */}
      <Modal transparent visible={isSubFunctionModalVisible} onRequestClose={() => setSubFunctionModalVisible(false)}>
  <View style={styles.modalOverlay}>
    <View style={[styles.modalCard, { backgroundColor: theme.colors.surface }]}>
      <View style={[styles.modalHeader, { borderBottomColor: theme.colors.outline }]}>
        <Text style={[styles.modalTitle, { color: theme.custom.colors.text }]}>Étape 2: Préciser le rôle</Text>
        <Button onPress={() => setSubFunctionModalVisible(false)}>Fermer</Button>
      </View>
                <FlatList data={sousFonctions} keyExtractor={(item) => item} renderItem={({ item }) => (
                    <TouchableOpacity style={styles.modalItem} onPress={() => handleSelectSousFonction(item)}>
  <Text style={[styles.modalItemText, { color: theme.custom.colors.text }]}>{item}</Text>
</TouchableOpacity>
                )}/>
            </View>
        </View>
      </Modal>
    </View>
  );
};

// --- COMPOSANT POUR LA GESTION DES AUTRES FONCTIONS ---
const CustomRoleEditor = ({ otherRoles, setOtherRoles }: { otherRoles: string[], setOtherRoles: (roles: string[]) => void }) => {
  const theme = useAppTheme(); 
    const [inputValue, setInputValue] = useState('');
    const [confirmingValue, setConfirmingValue] = useState<string | null>(null);

    const handleNext = () => {
        if (inputValue.trim()) {
            setConfirmingValue(inputValue.trim());
            Keyboard.dismiss();
        } else {
            Alert.alert("Champ vide", "Veuillez saisir une fonction avant de continuer.");
        }
    };

    const handleAdd = () => {
        if (confirmingValue && !otherRoles.includes(confirmingValue)) {
            setOtherRoles([...otherRoles, confirmingValue]);
        }
        setInputValue('');
        setConfirmingValue(null);
    };

    const handleRemove = (index: number) => {
        setOtherRoles(otherRoles.filter((_, i) => i !== index));
    };

    return (
        <View style={styles.addRoleContainer}>
           <Text style={[styles.subSectionTitle, { color: theme.custom.colors.text }]}>Autres fonctions occupées</Text>
<Text style={[styles.fieldDescription, { color: theme.custom.colors.placeholder }]}>
                Ajoutez ici des rôles qui ne figurent pas dans la liste officielle (ex: &quot;Moniteur d&apos;école du dimanche&quot;).
            </Text>
           {otherRoles.map((role, index) => (
  <View key={index} style={[styles.roleChip, { 
    backgroundColor: theme.colors.surfaceVariant 
  }]}>
    <Text style={[styles.roleText, { color: theme.custom.colors.text }]}>{role}</Text>
    <TouchableOpacity onPress={() => handleRemove(index)}>
      <Feather name="x-circle" size={20} color={theme.custom.colors.placeholder} />
    </TouchableOpacity>
  </View>
))}

            {confirmingValue ? (
               <View style={[styles.confirmationContainer, { 
  backgroundColor: theme.colors.primaryContainer 
}]}>
  <Text style={[styles.confirmationText, { color: theme.colors.primary }]}>
    Ajouter &quot;{confirmingValue}&quot; ?
  </Text>
                    <View style={{flexDirection: 'row'}}>
                        <Button onPress={() => setConfirmingValue(null)}>Annuler</Button>
                        <Button onPress={handleAdd} mode="contained">Confirmer</Button>
                    </View>
                </View>
            ) : (
                <View style={styles.customRoleInputContainer}>
                    <TextInput
                        style={{ flex: 1 }}
                        mode="outlined"
                        label="Saisir une fonction"
                        value={inputValue}
                        onChangeText={setInputValue}
                    />
                    <Button onPress={handleNext} style={styles.customRoleAddButton}>Suivant</Button>
                </View>
            )}
        </View>
    );
};

// --- COMPOSANT : MODAL DE SÉLECTION D'IMAGE ---
const ImagePickerModal = ({ isVisible, onClose, onImagePicked, onLaunchCamera, onRemoveImage }: {
    isVisible: boolean;
    onClose: () => void;
    onImagePicked: (uri: string) => void;
    onLaunchCamera: () => void;
    onRemoveImage: () => void;
}) => {
    const theme = useAppTheme();
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <TouchableOpacity style={styles.modalOverlay} onPress={onClose} />
            <View style={styles.imagePickerContainer}>
                <Text style={styles.imagePickerTitle}>Photo de profil</Text>
                <TouchableOpacity style={styles.imagePickerButton} onPress={onLaunchCamera}>
                    <Feather name="camera" size={22} color={theme.colors.primary} />
                    <Text style={styles.imagePickerButtonText}>Prendre une photo</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.imagePickerButton} onPress={async () => {
                    const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: ['images'], // Utiliser un tableau de strings
  allowsEditing: true,
  aspect: [1, 1],
  quality: 0.7,
  ...(Platform.OS === 'ios' && { cropperCircleOverlay: true }),
});
                    if (!result.canceled) {
                        onImagePicked(result.assets[0].uri);
                    }
                }}>
                    <Feather name="image" size={22} color={theme.colors.primary} />
                    <Text style={styles.imagePickerButtonText}>Choisir depuis la galerie</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.imagePickerButton} onPress={onRemoveImage}>
                    <Feather name="trash-2" size={22} color={theme.colors.error} />
                    <Text style={[styles.imagePickerButtonText, { color: theme.colors.error }]}>Supprimer la photo</Text>
                </TouchableOpacity>
                <Button onPress={onClose} style={{marginTop: 10}}>Annuler</Button>
            </View>
        </Modal>
    );
};

// --- COMPOSANT MÉMOÏSÉ POUR LA FLATLIST DES ÉGLISES (OPTIMISATION) ---
const ChurchItem = React.memo(({ item, onSelect, textColor }: { item: any, onSelect: (i: any) => void, textColor: string }) => {
  const [loading, setLoading] = useState(true);

  return (
    <TouchableOpacity style={styles.modalItem} onPress={() => onSelect(item)}>
      {/* L'image doit avoir une taille fixe pour éviter le "layout thrashing" */}
      <View style={{ width: 40, height: 40, justifyContent: 'center', alignItems: 'center' }}>
        <Image
          source={item.icon}
          style={{ width: 40, height: 40 }}
          resizeMode="contain"
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
        />
        {loading && <ActivityIndicator style={{ position: 'absolute' }} size="small" />}
      </View>
     <Text style={[styles.modalItemText, { color: textColor }]}>{item.name}</Text>
    </TouchableOpacity>
  );
});
ChurchItem.displayName = 'ChurchItem'; // Ajout du displayName pour le débogage et le linting


export default function ModifierProfilScreen() {
  const theme = useAppTheme();
  const { user, userProfile, refreshUserProfile } = useAuth();
  const scrollViewRef = useRef<KeyboardAwareScrollView>(null);

  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [newImageUri, setNewImageUri] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isChurchModalVisible, setChurchModalVisible] = useState(false);
  const [isImagePickerVisible, setImagePickerVisible] = useState(false);

  const [validation, setValidation] = useState({
    username: { status: 'idle', message: '' },
    phone: { status: 'idle', message: '' },
  });

  // CORRECTION: Utiliser useFocusEffect pour s'assurer que les données sont à jour
  useFocusEffect(
    useCallback(() => {
      if (!isEditMode && userProfile) {
        // Met à jour l'affichage en mode lecture si le profil a changé dans le contexte
        setNewImageUri(userProfile.photoURL || null);
      }
    }, [isEditMode, userProfile])
  );

  const enterEditMode = () => {
    if (userProfile) {
      setFormData({ 
          ...userProfile, 
          roles: Array.isArray(userProfile.roles) ? userProfile.roles : [],
          otherRoles: Array.isArray(userProfile.otherRoles) ? userProfile.otherRoles : [],
      });
      setNewImageUri(userProfile.photoURL || null);
      setValidation({ username: { status: 'idle', message: '' }, phone: { status: 'idle', message: '' } });
    }
    setIsEditMode(true);
  };

  const cancelEditMode = () => {
    setFormData({});
    setNewImageUri(null);
    setIsEditMode(false);
  };

  const debouncedCheckUsername = useCallback(debounce(async (username: string) => {
    if (!user || !userProfile) return;
    if (!username) return setValidation(p => ({ ...p, username: { status: 'idle', message: '' } }));
    if (username.toLowerCase() === userProfile.username?.toLowerCase()) return setValidation(p => ({ ...p, username: { status: 'info', message: 'C\'est votre pseudo actuel.' } }));
    if (!isValidUsernameFormat(username)) return setValidation(p => ({ ...p, username: { status: 'invalid', message: 'Format : 3-20 caractères (lettres, chiffres, ._-)' } }));

    setValidation(p => ({ ...p, username: { status: 'checking', message: '' } }));
    const taken = await isUsernameTaken(username, user.uid);
    setValidation(p => ({ ...p, username: taken ? { status: 'invalid', message: 'Ce pseudo est déjà pris.' } : { status: 'valid', message: 'Ce pseudo est disponible !' } }));
  }, 500), [user, userProfile]);

  const debouncedCheckPhone = useCallback(debounce(async (phone: string) => {
    if (!user || !userProfile) return;
    if (!phone) return setValidation(p => ({ ...p, phone: { status: 'idle', message: '' } }));
    if (phone === userProfile.phone) return setValidation(p => ({ ...p, phone: { status: 'info', message: 'C\'est votre numéro actuel.' } }));
    if (!isValidPhoneNumber(phone)) return setValidation(p => ({ ...p, phone: { status: 'invalid', message: 'Format de numéro invalide.' } }));

    setValidation(p => ({ ...p, phone: { status: 'checking', message: '' } }));
    const taken = await isPhoneTaken(phone, user.uid);
    setValidation(p => ({ ...p, phone: taken ? { status: 'invalid', message: 'Ce numéro est déjà utilisé.' } : { status: 'valid', message: 'Numéro disponible.' } }));
  }, 500), [user, userProfile]);

  const handleChange = (field: keyof UserProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'username' && typeof value === 'string') debouncedCheckUsername(value);
    if (field === 'phone' && typeof value === 'string') debouncedCheckPhone(value);
  };

  const handleLaunchCamera = async () => {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert("Permission refusée", "L'accès à l'appareil photo est nécessaire pour prendre une photo.");
    return;
  }
  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.7,
    ...(Platform.OS === 'ios' && { cropperCircleOverlay: true }),
  });
  if (!result.canceled) {
    setNewImageUri(result.assets[0].uri);
    setImagePickerVisible(false);
  }
};
  
  const handleRemoveImage = () => {
      setNewImageUri(null);
      handleChange('photoURL', null);
      setImagePickerVisible(false);
  };

  const handleSave = async () => {
    if (!user || !formData || !userProfile) return;
    if (!formData.prenom || !formData.nom) return Alert.alert("Champs requis", "Le prénom et le nom sont obligatoires.");
    if (['invalid', 'checking'].includes(validation.username.status)) return Alert.alert("Pseudo invalide", "Veuillez choisir un pseudo disponible.");
    if (['invalid', 'checking'].includes(validation.phone.status)) return Alert.alert("Téléphone invalide", "Veuillez utiliser un numéro valide et disponible.");

    setIsSaving(true);

    if (formData.nom !== userProfile.nom || formData.prenom !== userProfile.prenom) {
      const nameTaken = await isNameAndSurnameTaken(formData.nom!, formData.prenom!, user.uid);
      if (nameTaken) {
        setIsSaving(false);
        return Alert.alert("Nom déjà existant", "Un utilisateur avec ce nom et ce prénom existe déjà.");
      }
    }

    let finalPhotoURL = userProfile.photoURL;
    
    const hasNewImage = newImageUri && newImageUri !== userProfile.photoURL;
    const hasRemovedImage = newImageUri === null && userProfile.photoURL !== null;

    try {
      if (hasNewImage) {
        const data = new FormData();
        data.append('file', { uri: newImageUri, type: 'image/jpeg', name: 'profile.jpg' } as any);
        data.append('upload_preset', "app_profile_pictures");
        const response = await fetch("https://api.cloudinary.com/v1_1/doxoh3807/image/upload", { method: 'POST', body: data });
        const result = await response.json();
        if (result.secure_url) {
            finalPhotoURL = result.secure_url;
        } else {
            throw new Error("L'envoi de l'image a échoué.");
        }
      } else if (hasRemovedImage) {
          finalPhotoURL = null;
      }
      
      const dataToUpdate: Partial<UserProfile> = {};
      Object.keys(formData).forEach(keyStr => {
          const key = keyStr as keyof UserProfile;
          const formValue = formData[key];
          const profileValue = userProfile[key];
          
          if (!isEqual(formValue, profileValue)) {
              (dataToUpdate as any)[key] = formValue;
          }
      });
      
      if (finalPhotoURL !== userProfile.photoURL) {
          dataToUpdate.photoURL = finalPhotoURL;
      }

      if (Object.keys(dataToUpdate).length > 0) {
        await updateDoc(doc(db, 'users', user.uid), dataToUpdate);
      }

      await refreshUserProfile();
      Alert.alert("Profil mis à jour", "Vos informations ont été sauvegardées.");
      cancelEditMode();
    } catch (err) {
      console.error("Erreur de sauvegarde:", err);
      Alert.alert("Erreur", "Une erreur est survenue lors de la sauvegarde.");
    } finally {
      setIsSaving(false);
    }
  };
  
  const displayRoles = (profile: UserProfile | null) => {
    if (!profile) return 'Aucun';
    if (profile.roles && profile.roles.length > 0) {
        return profile.roles.map(role => 
            role.sousFonction ? `${role.fonction} - ${role.sousFonction}` : role.fonction
        ).join('\n');
    }
    if (profile.fonction) { // Fallback
        return profile.sousFonction ? `${profile.fonction} - ${profile.sousFonction}` : profile.fonction;
    }
    return 'Aucun';
  };

  const displayOtherRoles = (profile: UserProfile | null) => {
      if (profile?.otherRoles && profile.otherRoles.length > 0) {
          return profile.otherRoles.join('\n');
      }
      return null;
  };

  const preloadChurchIcons = async () => {
    try {
      // si item.icon est require('../...') -> Asset.loadAsync marche
      const modules = churches.map(c => c.icon);
      await Asset.loadAsync(modules);
    } catch (e) {
      console.log('Preload church icons error', e);
    }
  };

  if (!userProfile) return <View style={styles.loaderContainer}><ActivityIndicator size="large" /></View>;

  const displayProfile = isEditMode ? formData : userProfile;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <KeyboardAwareScrollView
        ref={scrollViewRef}
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        enableOnAndroid={true}
        extraScrollHeight={Platform.OS === 'ios' ? 50 : 150}
        keyboardShouldPersistTaps="handled"
        enableAutomaticScroll={false} // CORRECTION: Empêche le scroll automatique
      >
        <TouchableOpacity onPress={() => isEditMode && setImagePickerVisible(true)} disabled={!isEditMode} style={styles.avatarContainer}>
          <Avatar
            photoURL={isEditMode ? newImageUri : userProfile.photoURL}
            prenom={displayProfile.prenom}
            nom={displayProfile.nom}
          />
          {isEditMode && (
            <View style={[styles.editIconContainer, { backgroundColor: theme.colors.primary }]}>
              <Feather name="camera" size={18} color="white" />
            </View>
          )}
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, { color: theme.custom.colors.text }]}>Informations Personnelles</Text>
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          {isEditMode ? <>
            <TextInput label="Prénom" value={formData.prenom || ''} onChangeText={(text: string) => handleChange('prenom', text)} style={styles.input} mode="outlined" />
            <TextInput label="Nom" value={formData.nom || ''} onChangeText={(text: string) => handleChange('nom', text)} style={styles.input} mode="outlined" />
            <ValidationInput label="Nom d'utilisateur" value={formData.username || ''} validationStatus={validation.username} onChangeText={(text: string) => handleChange('username', text)} autoCapitalize="none" />
            <ValidationInput label="Téléphone" value={formData.phone || ''} validationStatus={validation.phone} onChangeText={(text: string) => handleChange('phone', text)} keyboardType="phone-pad" />
            <TextInput label="Date de naissance (JJ/MM/AAAA)" value={formData.birthdate || ''} onChangeText={(text: string) => handleChange('birthdate', text)} style={styles.input} mode="outlined" />
          </> : <>
            <ReadOnlyField label="Prénom" value={userProfile.prenom} />
            <ReadOnlyField label="Nom" value={userProfile.nom} />
            <ReadOnlyField label="Nom d'utilisateur" value={userProfile.username} />
            <ReadOnlyField label="Téléphone" value={userProfile.phone} />
            <ReadOnlyField label="Date de naissance" value={userProfile.birthdate} />
          </>}
        </View>

        <Text style={[styles.sectionTitle, { color: theme.custom.colors.text }]}>Parcours Spirituel</Text>
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          {isEditMode ? (
            <>
                <Text style={styles.readOnlyLabel}>Église d&apos;origine</Text>
               <TouchableOpacity style={[styles.selector, { 
  backgroundColor: theme.colors.surfaceVariant,
  borderColor: theme.colors.outline 
}]} onPress={() => {
  preloadChurchIcons();
  setChurchModalVisible(true);
}}>
  <Text style={[styles.selectorText, { 
    color: formData.egliseOrigine ? theme.custom.colors.text : theme.custom.colors.placeholder 
  }]}>
    {formData.egliseOrigine || "Sélectionner une église"}
  </Text>
</TouchableOpacity>
                <RoleEditor
                    roles={formData.roles || []}
                    setRoles={(newRoles) => handleChange('roles', newRoles)}
                />
                <CustomRoleEditor
                    otherRoles={formData.otherRoles || []}
                    setOtherRoles={(newRoles) => handleChange('otherRoles', newRoles)}
                />
            </>
          ) : (
            <>
              <ReadOnlyField label="Rôles officiels" value={displayRoles(userProfile)} isMultiLine emptyValue="Aucun"/>
              <ReadOnlyField label="Autres fonctions" value={displayOtherRoles(userProfile)} isMultiLine emptyValue="Aucunes" />
              <ReadOnlyField label="Église d'origine" value={userProfile.egliseOrigine} emptyValue="Aucune" />
            </>
          )}
        </View>

        <Text style={[styles.sectionTitle, { color: theme.custom.colors.text }]}>Compte</Text>
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <ReadOnlyField label="Email (non modifiable)" value={userProfile.email} />
          {isEditMode && (
             <View style={styles.supportSection}>
                <Feather name="help-circle" size={20} color={theme.custom.colors.placeholder} />
                <Text style={[styles.supportText, { color: theme.custom.colors.placeholder }]}>
                    Pour modifier votre email, veuillez{' '}
                    <Text style={styles.supportLink} onPress={() => Linking.openURL('mailto:support@votreapp.com')}>
                    contacter le support
                    </Text>.
                </Text>
            </View>
          )}
        </View>

      </KeyboardAwareScrollView>

      <View style={[styles.footer, { 
  backgroundColor: theme.colors.surface, 
  borderTopColor: theme.colors.outline 
}]}>
        {!isEditMode ? (
          <Button onPress={enterEditMode} mode="contained" style={[styles.fab, { backgroundColor: '#2563EB' }]} labelStyle={styles.fabLabel} icon="pencil-outline">
            Modifier mon profil
          </Button>
        ) : (
          <View style={styles.editActionsContainer}>
            <Button onPress={cancelEditMode} mode="outlined" style={styles.secondaryButton}>Annuler</Button>
            <Button onPress={handleSave} mode="contained" style={[styles.primaryButton, { backgroundColor: '#2563EB' }]} loading={isSaving} disabled={isSaving}>
              Enregistrer
            </Button>
          </View>
        )}
      </View>

      <ImagePickerModal
          isVisible={isImagePickerVisible}
          onClose={() => setImagePickerVisible(false)}
          onImagePicked={(uri) => {
              setNewImageUri(uri);
              setImagePickerVisible(false);
          }}
          onLaunchCamera={handleLaunchCamera}
          onRemoveImage={handleRemoveImage}
      />

      <Modal transparent visible={isChurchModalVisible} onRequestClose={() => setChurchModalVisible(false)}>
  <View style={styles.modalOverlay}>
    <View style={[styles.modalCard, { backgroundColor: theme.colors.surface }]}>
      <View style={[styles.modalHeader, { borderBottomColor: theme.colors.outline }]}>
        <Text style={[styles.modalTitle, { color: theme.custom.colors.text }]}>Choisir une église</Text>
        <Button onPress={() => setChurchModalVisible(false)}>Fermer</Button>
      </View>
            <FlatList
              data={churches}
              keyExtractor={(item) => item.name}
             renderItem={({ item }) => (
  <ChurchItem
    item={item}
    onSelect={(selected) => {
      handleChange('egliseOrigine', selected.name);
      setChurchModalVisible(false);
    }}
    textColor={theme.custom.colors.text}
  />
)}
              initialNumToRender={8}
              maxToRenderPerBatch={8}
              windowSize={5}
              removeClippedSubviews={true}
            />
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
  scrollContent: { paddingBottom: 120 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  avatarContainer: { alignSelf: 'center', marginVertical: 20 },
  editIconContainer: {
    position: 'absolute', bottom: 5, right: 5, width: 34, height: 34,
    borderRadius: 17, justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: 'white',
  },
  sectionTitle: {
  fontSize: 20,
  fontFamily: 'Nunito_700Bold',
  marginHorizontal: 20,
  marginBottom: 10,
  marginTop: 10,
},
  card: {
    marginHorizontal: 16, borderRadius: 12, padding: 16,
    marginBottom: 16, elevation: 2, shadowColor: '#000',
    shadowOpacity: 0.05, shadowRadius: 10,
  },
  input: { marginBottom: 4, backgroundColor: 'transparent' },
  readOnlyFieldContainer: { marginBottom: 20, paddingHorizontal: 4 },
  readOnlyLabel: { fontSize: 13, fontFamily: 'Nunito_400Regular', marginBottom: 4, color: '#6B7280' },
  readOnlyValue: { fontSize: 16, fontFamily: 'Nunito_700Bold' },
  errorTextHelper: { color: '#EF4444', fontSize: 12 },
  infoTextHelper: { color: '#6B7280', fontSize: 12 },
  supportSection: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, marginTop: 4,
  },
  supportText: { flex: 1, marginLeft: 12, fontSize: 13, lineHeight: 18 },
  supportLink: { color: '#0A72BB', textDecorationLine: 'underline', fontWeight: 'bold' },
  footer: {
  position: 'absolute', bottom: 0, left: 0, right: 0,
  padding: 16, paddingBottom: Platform.OS === 'ios' ? 30 : 16,
  borderTopWidth: 1,
},
  fab: {
    borderRadius: 50, paddingVertical: 8,
  },
  fabLabel: { fontSize: 16, fontWeight: 'bold' },
  editActionsContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  primaryButton: {
    flex: 1, marginLeft: 8, borderRadius: 50, paddingVertical: 6,
  },
  secondaryButton: {
    flex: 1, marginRight: 8, borderRadius: 50, paddingVertical: 6,
  },
  subSectionTitle: {
  fontSize: 16,
  fontFamily: 'Nunito_700Bold',
  marginBottom: 12,
  marginTop: 8,
},
  roleChip: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderRadius: 8,
  paddingVertical: 8,
  paddingHorizontal: 12,
  marginBottom: 8,
},
roleText: {
  fontSize: 14,
  flex: 1,
  },
  addRoleContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    marginTop: 16,
    paddingTop: 16,
  },
  addButton: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: 10,
  marginTop: 8,
  borderRadius: 8,
},
addButtonLabel: {
  fontSize: 16,
  fontFamily: 'Nunito_700Bold',
  marginLeft: 8,
},
  fieldDescription: {
  fontSize: 14,
  marginBottom: 16,
  lineHeight: 20,
},
  customRoleInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  customRoleAddButton: {
    justifyContent: 'center',
  },
  confirmationContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: 12,
  borderRadius: 8,
},
confirmationText: {
  fontSize: 16,
  fontFamily: 'Nunito_400Regular',
  flex: 1,
},
  limitReachedText: {
  textAlign: 'center',
  fontStyle: 'italic',
  marginVertical: 16,
},
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalCard: {
  borderTopLeftRadius: 24,
  borderTopRightRadius: 24,
  maxHeight: Dimensions.get('window').height * 0.6,
  paddingBottom: Platform.OS === 'ios' ? 20 : 0,
},
modalHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingHorizontal: 16,
  paddingVertical: 8,
  borderBottomWidth: 1,
},
modalTitle: {
  fontSize: 18,
  fontFamily: 'Nunito_700Bold',
},
modalItem: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: 16,
  paddingHorizontal: 24,
},
modalItemText: {
  fontSize: 16,
  marginLeft: 16,
},
  selector: {
  borderRadius: 8,
  borderWidth: 1,
  paddingVertical: 16,
  paddingHorizontal: 12,
  marginBottom: 12,
},
selectorText: {
  fontSize: 16,
},
  imagePickerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  imagePickerTitle: {
    fontSize: 18,
    fontFamily: 'Nunito_700Bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  imagePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  imagePickerButtonText: {
    fontSize: 16,
    fontFamily: 'Nunito_400Regular',
    marginLeft: 15,
  },
});

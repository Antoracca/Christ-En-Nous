import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
} from 'react-native';
import { Image } from 'expo-image';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { CHAT_USERS, ChatMessage } from '@/data/markosChatData';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

const CHAT_BACKGROUND = "https://i.pinimg.com/originals/97/c0/07/97c00726d1d98905fa8131d255743b17.png";

export default function DMScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  
  // Trouver l'utilisateur cible
  const targetUser = CHAT_USERS.find(u => u.id === id) || CHAT_USERS[1];

  useEffect(() => {
    // Messages simulés initiaux
    setMessages([
      { id: '1', text: "Salut ! Comment vas-tu ?", senderId: targetUser.id, timestamp: '10:00', type: 'text', isRead: true },
      { id: '2', text: "Je vais bien merci, et toi ?", senderId: 'me', timestamp: '10:05', type: 'text', isRead: true },
    ].reverse());
  }, [id]);

  const handleSend = () => {
    if (inputText.trim().length === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText,
      senderId: 'me',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text',
      isRead: false,
    };

    setMessages((prev) => [newMessage, ...prev]);
    setInputText('');
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isMe = item.senderId === 'me';
    return (
      <View style={[styles.messageRow, isMe ? styles.messageRowMe : styles.messageRowOther]}>
        {!isMe && (
          <Image source={{ uri: targetUser.avatar }} style={styles.messageAvatar} contentFit="cover" />
        )}
        <LinearGradient
            colors={isMe ? [theme.colors.primary, '#8B5CF6'] : [theme.colors.surface, theme.colors.surface]}
            style={[styles.messageBubble, isMe ? styles.bubbleMe : styles.bubbleOther]}
        >
            <Text style={[styles.messageText, { color: isMe ? 'white' : theme.colors.onSurface }]}>{item.text}</Text>
            <Text style={[styles.timestamp, { color: isMe ? 'rgba(255,255,255,0.7)' : theme.colors.outline }]}>{item.timestamp}</Text>
        </LinearGradient>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Feather name="arrow-left" size={24} color={theme.colors.onSurface} />
            </TouchableOpacity>
            <View style={styles.avatarContainer}>
               <Image source={{ uri: targetUser.avatar }} style={styles.headerAvatar} />
               {targetUser.isOnline && <View style={styles.onlineDot} />}
            </View>
            <View>
              <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>{targetUser.name}</Text>
              <Text style={[styles.headerStatus, { color: theme.colors.onSurfaceVariant }]}>
                {targetUser.isOnline ? 'En ligne' : `Vu à ${targetUser.lastSeen}`}
              </Text>
            </View>
          </View>
          <View style={styles.headerRight}>
              <TouchableOpacity style={styles.actionBtn}>
                  <Ionicons name="call-outline" size={22} color={theme.colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}>
                  <Ionicons name="videocam-outline" size={22} color={theme.colors.primary} />
              </TouchableOpacity>
          </View>
        </View>

        <ImageBackground source={{ uri: CHAT_BACKGROUND }} style={styles.backgroundImage} imageStyle={{ opacity: theme.dark ? 0.05 : 0.4 }}>
            <FlatList
                data={messages}
                renderItem={renderMessage}
                keyExtractor={item => item.id}
                inverted
                contentContainerStyle={styles.messagesList}
            />
            
            {/* Input Moderne */}
            <View style={styles.inputWrapper}>
               <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface }]}>
                  <TouchableOpacity style={styles.attachButton} disabled={true}>
                    <Feather name="plus" size={24} color={theme.colors.primary} />
                  </TouchableOpacity>
                  
                  <TextInput
                    style={[styles.textInput, { color: theme.colors.onSurface }]}
                    placeholder="Message..."
                    placeholderTextColor={theme.colors.onSurfaceVariant}
                    value={inputText}
                    onChangeText={setInputText}
                    multiline
                  />
                  
                  {inputText.length > 0 ? (
                    <TouchableOpacity 
                      style={styles.sendButton} 
                      onPress={handleSend}
                    >
                      <Ionicons name="send" size={20} color={theme.colors.primary} />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity style={styles.micButton} disabled={true}>
                      <Ionicons name="mic-outline" size={24} color={theme.colors.onSurfaceVariant} />
                    </TouchableOpacity>
                  )}
               </View>
            </View>
        </ImageBackground>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backgroundImage: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  backButton: { padding: 4 },
  avatarContainer: { position: 'relative' },
  headerAvatar: { width: 40, height: 40, borderRadius: 20 },
  onlineDot: { position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, borderRadius: 5, backgroundColor: '#10B981', borderWidth: 1.5, borderColor: 'white' },
  headerTitle: { fontSize: 16, fontFamily: 'Nunito_700Bold' },
  headerStatus: { fontSize: 11, fontFamily: 'Nunito_400Regular' },
  headerRight: { flexDirection: 'row', gap: 15 },
  actionBtn: { padding: 4 },
  
  messagesList: { 
    paddingHorizontal: 16,
    paddingBottom: 20, 
    paddingTop: 20 
  },
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12, gap: 8 },
  messageRowMe: { justifyContent: 'flex-end' },
  messageRowOther: { justifyContent: 'flex-start' },
  messageAvatar: { width: 30, height: 30, borderRadius: 15, marginBottom: 2 },
  messageBubble: { 
    maxWidth: '78%', 
    paddingHorizontal: 14, 
    paddingVertical: 10, 
    borderRadius: 20,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  bubbleMe: { borderBottomRightRadius: 4 },
  bubbleOther: { borderBottomLeftRadius: 4 },
  messageText: { fontSize: 15, fontFamily: 'Nunito_400Regular', lineHeight: 22 },
  timestamp: { fontSize: 10, marginTop: 2, alignSelf: 'flex-end' },
  
  // Input Moderne Styles
  inputWrapper: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: 'transparent',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 26,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  attachButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.6,
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 10,
    fontSize: 15,
    fontFamily: 'Nunito_400Regular',
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  micButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.6,
  },
});

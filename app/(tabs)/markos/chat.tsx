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
  Dimensions,
  ImageBackground,
} from 'react-native';
import { Image } from 'expo-image';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useRouter } from 'expo-router';
import { Feather, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { CHAT_USERS, MOCK_MESSAGES, ChatMessage, ChatUser } from '@/data/markosChatData';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

// Image de fond subtile (pattern)
const CHAT_BACKGROUND = "https://i.pinimg.com/originals/97/c0/07/97c00726d1d98905fa8131d255743b17.png";

export default function MarkosChatScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    setMessages([...MOCK_MESSAGES].reverse());
  }, []);

  useEffect(() => {
    const typingInterval = setInterval(() => {
      const shouldType = Math.random() > 0.7;
      setIsTyping(shouldType);
      
      if (shouldType && Math.random() > 0.8) {
        setTimeout(() => {
           const randomUser = CHAT_USERS[Math.floor(Math.random() * (CHAT_USERS.length - 1)) + 1];
           const newMsg: ChatMessage = {
             id: Date.now().toString(),
             text: "Amen ! 🙏",
             senderId: randomUser.id,
             timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
             type: 'text',
             isRead: true
           };
           setMessages(prev => [newMsg, ...prev]);
           setIsTyping(false);
           Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }, 2000);
      }
    }, 5000);

    return () => clearInterval(typingInterval);
  }, []);

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

  const renderOnlineUser = ({ item }: { item: ChatUser }) => {
    if (item.id === 'me') return null;
    return (
      <View style={styles.onlineUserContainer}>
        <View style={styles.avatarContainer}>
          <Image source={{ uri: item.avatar }} style={styles.onlineAvatar} contentFit="cover" />
          {item.isOnline && <View style={[styles.onlineIndicator, { borderColor: theme.colors.surface }]} />}
        </View>
        <Text style={[styles.onlineName, { color: theme.colors.onSurfaceVariant }]} numberOfLines={1}>
          {item.name.split(' ')[0]}
        </Text>
      </View>
    );
  };

  const renderMessage = ({ item, index }: { item: ChatMessage; index: number }) => {
    const isMe = item.senderId === 'me';
    const sender = CHAT_USERS.find(u => u.id === item.senderId);
    const nextMessage = messages[index + 1];
    const isSameSender = nextMessage?.senderId === item.senderId;

    return (
      <View style={[
        styles.messageRow, 
        isMe ? styles.messageRowMe : styles.messageRowOther,
        { marginBottom: isSameSender ? 2 : 12 }
      ]}>
        {!isMe && !isSameSender && (
          <Image source={{ uri: sender?.avatar }} style={styles.messageAvatar} contentFit="cover" />
        )}
        {!isMe && isSameSender && <View style={styles.messageAvatarPlaceholder} />}

        {isMe ? (
          <LinearGradient
            colors={[theme.colors.primary, '#8B5CF6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.messageBubble, styles.bubbleMe]}
          >
            <Text style={[styles.messageText, { color: 'white' }]}>
              {item.text}
            </Text>
            <View style={styles.metaContainer}>
              <Text style={[styles.timestamp, { color: 'rgba(255,255,255,0.7)' }]}>
                {item.timestamp}
              </Text>
              <Ionicons name="checkmark-done" size={14} color="rgba(255,255,255,0.9)" />
            </View>
          </LinearGradient>
        ) : (
          <View style={[styles.messageBubble, styles.bubbleOther, { backgroundColor: theme.colors.surface }]}>
            {!isSameSender && (
              <Text style={[styles.senderName, { color: theme.colors.primary }]}>{sender?.name}</Text>
            )}
            <Text style={[styles.messageText, { color: theme.colors.onSurface }]}>
              {item.text}
            </Text>
            <Text style={[styles.timestamp, { color: theme.colors.outline }]}>
              {item.timestamp}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20} // Ajustement fin pour Android
      >
        {/* HEADER */}
        <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.outline + '10' }]}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Feather name="arrow-left" size={24} color={theme.colors.onSurface} />
            </TouchableOpacity>
            <View>
              <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>Markos Community</Text>
              <Text style={[styles.headerSubtitle, { color: '#10B981' }]}>
                ● {CHAT_USERS.filter(u => u.isOnline).length} en ligne
              </Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={[styles.headerActionBtn, { backgroundColor: theme.colors.surfaceVariant }]}>
               <Ionicons name="videocam" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.headerActionBtn, { backgroundColor: theme.colors.surfaceVariant }]}>
               <Ionicons name="call" size={18} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ONLINE BAR */}
        <View style={[styles.onlineBar, { backgroundColor: theme.colors.surface }]}>
          <FlatList
            data={CHAT_USERS}
            renderItem={renderOnlineUser}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.onlineListContent}
          />
        </View>

        {/* CHAT AREA */}
        <ImageBackground 
          source={{ uri: CHAT_BACKGROUND }} 
          style={styles.backgroundImage}
          imageStyle={{ opacity: theme.dark ? 0.05 : 0.4 }}
        >
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={item => item.id}
              inverted
              contentContainerStyle={styles.messagesList}
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={
                isTyping ? (
                  <View style={[styles.typingBubble, { backgroundColor: theme.colors.surface }]}>
                     <View style={styles.typingDot} />
                     <View style={[styles.typingDot, { animationDelay: '0.2s' }]} />
                     <View style={[styles.typingDot, { animationDelay: '0.4s' }]} />
                     <Text style={[styles.typingText, { color: theme.colors.onSurfaceVariant }]}>écrit...</Text>
                  </View>
                ) : null
              }
            />

            {/* INPUT MODERNE */}
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
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    zIndex: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: { padding: 4 },
  headerTitle: {
    fontSize: 17,
    fontFamily: 'Nunito_700Bold',
  },
  headerSubtitle: {
    fontSize: 12,
    fontFamily: 'Nunito_600SemiBold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Online Bar
  onlineBar: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    zIndex: 5,
  },
  onlineListContent: {
    paddingHorizontal: 16,
    gap: 16,
  },
  onlineUserContainer: {
    alignItems: 'center',
    width: 56,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 6,
  },
  onlineAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: '#EC4899', // Cercle rose autour
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 2,
  },
  onlineName: {
    fontSize: 11,
    fontFamily: 'Nunito_600SemiBold',
    textAlign: 'center',
  },
  // Messages
  keyboardAvoidingView: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 20,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  messageRowMe: {
    justifyContent: 'flex-end',
  },
  messageRowOther: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginBottom: 2,
  },
  messageAvatarPlaceholder: {
    width: 30,
  },
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
  bubbleMe: {
    borderBottomRightRadius: 4, // Queue de bulle
  },
  bubbleOther: {
    borderBottomLeftRadius: 4, // Queue de bulle
  },
  senderName: {
    fontSize: 11,
    fontFamily: 'Nunito_700Bold',
    marginBottom: 4,
    opacity: 0.8,
  },
  messageText: {
    fontSize: 15,
    fontFamily: 'Nunito_400Regular',
    lineHeight: 22,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 2,
  },
  timestamp: {
    fontSize: 10,
    fontFamily: 'Nunito_400Regular',
    alignSelf: 'flex-end',
    marginTop: 2,
  },
  typingBubble: {
    alignSelf: 'flex-start',
    marginLeft: 38,
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  typingDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#9CA3AF',
  },
  typingText: {
    fontSize: 11,
    marginLeft: 4,
  },
  // Input Moderne
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

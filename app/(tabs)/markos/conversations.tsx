import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useRouter } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { ACTIVE_GROUP_CALL, CHAT_USERS, PRIVATE_CONVERSATIONS, ChatUser, PrivateConversation } from '@/data/markosChatData';
import ActiveCallBanner from '@/components/markos/ActiveCallBanner';
import CallModal from '@/components/markos/CallModal';

export default function ConversationsScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const [callVisible, setCallVisible] = useState(false);

  // Section "En ligne" (Stories)
  const renderOnlineUser = ({ item }: { item: ChatUser }) => {
    if (item.id === 'me') return null;
    return (
      <TouchableOpacity 
        style={styles.storyContainer} 
        onPress={() => router.push({ pathname: '/(tabs)/markos/dm', params: { id: item.id } })}
      >
        <View style={styles.storyAvatarContainer}>
          <Image source={{ uri: item.avatar }} style={styles.storyAvatar} contentFit="cover" />
          {item.isOnline && <View style={[styles.onlineDot, { borderColor: theme.colors.background }]} />}
        </View>
        <Text style={[styles.storyName, { color: theme.colors.onSurface }]} numberOfLines={1}>
          {item.name.split(' ')[0]}
        </Text>
      </TouchableOpacity>
    );
  };

  // Item de liste de conversation
  const ConversationItem = ({ 
    title, 
    message, 
    time, 
    avatar, 
    unread, 
    isGroup,
    onPress 
  }: any) => (
    <TouchableOpacity style={styles.chatItem} onPress={onPress}>
      <View style={styles.chatAvatarContainer}>
        <Image source={{ uri: avatar }} style={styles.chatAvatar} contentFit="cover" />
        {isGroup && (
           <View style={styles.groupIconBadge}>
             <Ionicons name="people" size={10} color="white" />
           </View>
        )}
      </View>
      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <Text style={[styles.chatTitle, { color: theme.colors.onSurface }]}>{title}</Text>
          <Text style={[styles.chatTime, { color: theme.colors.outline }]}>{time}</Text>
        </View>
        <View style={styles.chatFooter}>
          <Text style={[styles.chatMessage, { color: unread > 0 ? theme.colors.onSurface : theme.colors.outline }]} numberOfLines={1}>
            {message}
          </Text>
          {unread > 0 && (
            <View style={[styles.unreadBadge, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.unreadText}>{unread}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={theme.colors.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>Discussions</Text>
        <TouchableOpacity style={styles.newChatBtn}>
          <Feather name="edit" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* Stories Online */}
        <View style={styles.storiesSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant }]}>En ligne</Text>
          <FlatList
            data={CHAT_USERS}
            renderItem={renderOnlineUser}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.storiesList}
          />
        </View>

        {/* Active Call Banner */}
        <View style={styles.callSection}>
           <ActiveCallBanner call={ACTIVE_GROUP_CALL} onPress={() => setCallVisible(true)} />
        </View>

        {/* Conversations List */}
        <View style={[styles.chatsList, { backgroundColor: theme.colors.surface }]}>
          
          {/* Main Group Chat (Pinned) */}
          <ConversationItem
            title="Markos Community"
            message="Amen ! Soyez bénis."
            time="12:45"
            avatar="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=150"
            unread={5}
            isGroup={true}
            onPress={() => router.push('/(tabs)/markos/chat')}
          />

          {/* Private Chats */}
          {PRIVATE_CONVERSATIONS.map(conv => {
            const user = CHAT_USERS.find(u => u.id === conv.userId);
            if (!user) return null;
            return (
              <ConversationItem
                key={conv.id}
                title={user.name}
                message={conv.lastMessage}
                time={conv.lastMessageTime}
                avatar={user.avatar}
                unread={conv.unreadCount}
                isGroup={false}
                onPress={() => router.push({ pathname: '/(tabs)/markos/dm', params: { id: user.id } })}
              />
            );
          })}
        </View>
      </ScrollView>

      <CallModal visible={callVisible} onClose={() => setCallVisible(false)} call={ACTIVE_GROUP_CALL} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 20, fontFamily: 'Nunito_800ExtraBold' },
  newChatBtn: { padding: 4 },
  
  storiesSection: {
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Nunito_700Bold',
    marginLeft: 20,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  storiesList: {
    paddingHorizontal: 16,
    gap: 16,
  },
  storyContainer: {
    alignItems: 'center',
    width: 60,
  },
  storyAvatarContainer: {
    marginBottom: 6,
    position: 'relative',
  },
  storyAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#EC4899',
    padding: 2,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 2,
  },
  storyName: {
    fontSize: 11,
    fontFamily: 'Nunito_600SemiBold',
    textAlign: 'center',
  },

  callSection: {
    marginTop: 5,
  },

  chatsList: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 20,
    minHeight: 500,
    paddingHorizontal: 20,
  },
  chatItem: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center',
  },
  chatAvatarContainer: {
    position: 'relative',
  },
  chatAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E5E7EB',
  },
  groupIconBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#3B82F6',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'white',
  },
  chatContent: {
    flex: 1,
    marginLeft: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    paddingBottom: 15,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  chatTitle: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
  },
  chatTime: {
    fontSize: 11,
    fontFamily: 'Nunito_600SemiBold',
  },
  chatFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatMessage: {
    fontSize: 13,
    fontFamily: 'Nunito_400Regular',
    flex: 1,
    marginRight: 10,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: 'white',
    fontSize: 10,
    fontFamily: 'Nunito_700Bold',
  },
});

// Données simulées pour le Chat Markos

export interface ChatUser {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  lastSeen: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  timestamp: string; // ISO string ou heure formatée
  type: 'text' | 'image' | 'audio';
  isRead: boolean;
}

export interface PrivateConversation {
  id: string;
  userId: string; // Avec qui
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface ActiveCall {
  id: string;
  title: string;
  participants: ChatUser[];
  type: 'audio' | 'video';
  duration: string;
  isJoined: boolean;
}

// Utilisateurs fictifs
export const CHAT_USERS: ChatUser[] = [
  { id: 'me', name: 'Moi', avatar: 'https://i.pravatar.cc/150?u=me', isOnline: true, lastSeen: 'Maintenant' },
  { id: '1', name: 'Sarah K.', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', isOnline: true, lastSeen: 'Maintenant' },
  { id: '2', name: 'Pasteur Jean', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', isOnline: true, lastSeen: 'Maintenant' },
  { id: '3', name: 'David M.', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', isOnline: false, lastSeen: '12 min' },
  { id: '4', name: 'Marie Grace', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', isOnline: true, lastSeen: 'Maintenant' },
  { id: '5', name: 'Frère Luc', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', isOnline: false, lastSeen: '1h' },
  { id: '6', name: 'Chorale Lead', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', isOnline: true, lastSeen: 'Maintenant' },
];

// Conversations privées
export const PRIVATE_CONVERSATIONS: PrivateConversation[] = [
  { id: 'c1', userId: '2', lastMessage: 'Dieu te bénisse mon frère.', lastMessageTime: '10:30', unreadCount: 0 },
  { id: 'c2', userId: '1', lastMessage: 'Tu as les notes de la répète ?', lastMessageTime: 'Hier', unreadCount: 2 },
];

// Appel en cours simulé
export const ACTIVE_GROUP_CALL: ActiveCall = {
  id: 'call1',
  title: 'Répétition Louange (After)',
  participants: [CHAT_USERS[1], CHAT_USERS[2], CHAT_USERS[6]],
  type: 'audio',
  duration: '12:45',
  isJoined: false,
};

// Générateur de messages aléatoires
const MESSAGES_CONTENT = [
  "Amen ! Gloire à Dieu !",
  "Quelqu'un a les notes de la prédication de dimanche ?",
  "Je serai là pour la répétition de 17h.",
  "N'oubliez pas le jeûne de demain les amis.",
  "C'était vraiment puissant hier soir.",
  "Bonjour la famille Markos !",
  "Qui peut m'aider pour les maths ?",
  "Le Seigneur est ma force.",
  "On se retrouve où pour le départ ?",
  "J'ai apporté les T-shirts.",
  "Prions pour la sœur Alice.",
  "Alléluia !",
  "C'est noté, merci.",
  "À quelle heure commence le live ?",
  "Soyez bénis.",
];

export const generateMockMessages = (count = 55): ChatMessage[] => {
  const messages: ChatMessage[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const randomUserIndex = Math.floor(Math.random() * (CHAT_USERS.length - 1)) + 1;
    const sender = Math.random() > 0.3 ? CHAT_USERS[randomUserIndex] : CHAT_USERS[0];
    const timeOffset = (count - i) * 1000 * 60 * 5;
    const msgDate = new Date(now.getTime() - timeOffset);
    
    messages.push({
      id: i.toString(),
      text: MESSAGES_CONTENT[Math.floor(Math.random() * MESSAGES_CONTENT.length)],
      senderId: sender.id,
      timestamp: msgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text',
      isRead: true,
    });
  }
  return messages;
};

export const MOCK_MESSAGES = generateMockMessages();
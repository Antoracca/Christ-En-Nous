export interface BusinessProduct {
  id: string;
  title: string;
  price: number;
  currency: string;
  category: 'Mode' | 'Food' | 'Service' | 'Tech' | 'Art';
  images: string[];
  seller: {
    name: string;
    avatar: string;
    verified: boolean;
    rating: number;
  };
  description: string;
  isPromo?: boolean;
  promoPrice?: number;
}

export interface BusinessStory {
  id: string;
  sellerName: string;
  sellerAvatar: string;
  image: string;
  isLive: boolean;
}

export const BUSINESS_STORIES: BusinessStory[] = [
  { id: '1', sellerName: 'Délices de Sarah', sellerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500', isLive: true },
  { id: '2', sellerName: 'Tech Zone', sellerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=500', isLive: false },
  { id: '3', sellerName: 'Mode Chrétienne', sellerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500', isLive: false },
];

export const BUSINESS_PRODUCTS: BusinessProduct[] = [
  {
    id: '1',
    title: 'T-shirt "Lion de Juda" - Édition Limitée',
    price: 5000,
    currency: 'FCFA',
    category: 'Mode',
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500'],
    seller: { name: 'Markos Shop', avatar: 'https://i.pravatar.cc/150?u=markos', verified: true, rating: 4.9 },
    description: 'Coton 100% bio, impression haute qualité. Disponible en S, M, L, XL.',
    isPromo: true,
    promoPrice: 3500,
  },
  {
    id: '2',
    title: 'Plateau Traiteur (50 pièces)',
    price: 15000,
    currency: 'FCFA',
    category: 'Food',
    images: ['https://images.unsplash.com/photo-1555244162-803834f70033?w=500'],
    seller: { name: 'Délices de Sarah', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', verified: true, rating: 5.0 },
    description: 'Idéal pour vos événements. Mini-pizzas, samoussas, nems.',
  },
  {
    id: '3',
    title: 'Cours de Piano (Débutant)',
    price: 2000,
    currency: 'FCFA/h',
    category: 'Service',
    images: ['https://images.unsplash.com/photo-1552422535-c45813c61732?w=500'],
    seller: { name: 'Frère David', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', verified: false, rating: 4.5 },
    description: 'Apprenez à jouer vos cantiques préférés en 1 mois.',
  },
  {
    id: '4',
    title: 'AirPods Pro (Occasion)',
    price: 45000,
    currency: 'FCFA',
    category: 'Tech',
    images: ['https://images.unsplash.com/photo-1603351154351-5cf2330927f1?w=500'],
    seller: { name: 'Junior Tech', avatar: 'https://i.pravatar.cc/150?u=junior', verified: true, rating: 4.2 },
    description: 'Très bon état, avec boitier de charge.',
  },
  {
    id: '5',
    title: 'Portrait Dessiné (A4)',
    price: 7000,
    currency: 'FCFA',
    category: 'Art',
    images: ['https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=500'],
    seller: { name: 'Art by Grace', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', verified: true, rating: 4.8 },
    description: 'Offrez un portrait unique à vos proches. Crayon ou fusain.',
  },
  {
    id: '6',
    title: 'Jus de Gingembre Bio (1L)',
    price: 1000,
    currency: 'FCFA',
    category: 'Food',
    images: ['https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500'],
    seller: { name: 'Sœur Marie', avatar: 'https://i.pravatar.cc/150?u=marie', verified: false, rating: 4.6 },
    description: 'Fait maison, sans sucre ajouté. Excellent pour la santé.',
  },
];

export const CATEGORIES = [
  { id: 'all', label: 'Tout', icon: 'grid' },
  { id: 'Mode', label: 'Mode', icon: 'shopping-bag' },
  { id: 'Food', label: 'Miam', icon: 'coffee' },
  { id: 'Service', label: 'Services', icon: 'tool' },
  { id: 'Tech', label: 'Tech', icon: 'smartphone' },
];

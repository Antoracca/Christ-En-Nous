export interface HomeBanner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  actionLabel: string;
  route: string;
  color: string;
}

export interface Sermon {
  id: string;
  title: string;
  preacher: string;
  date: string;
  thumbnail: string;
  duration: string;
  category: string;
  views: number;
}

export interface ChurchEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  image: string;
  category: string;
}

export interface Ministry {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
}

export const HOME_DATA = {
  banners: [
    {
      id: 'b1',
      title: 'Conférence Réveil 2026',
      subtitle: 'Rejoignez-nous pour 3 jours de gloire intense.',
      image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80',
      actionLabel: 'Réserver ma place',
      route: '/(tabs)/prayer',
      color: '#1E3A8A'
    },
    {
      id: 'b2',
      title: 'Nouvelle Session Académie',
      subtitle: 'Inscriptions ouvertes pour l\'École des Prophètes.',
      image: 'https://images.unsplash.com/photo-1523050335456-c9af469e00eb?w=800&q=80',
      actionLabel: 'S\'inscrire',
      route: '/(tabs)/courses',
      color: '#7C3AED'
    }
  ] as HomeBanner[],

  sermons: [
    {
      id: 's1',
      title: 'La Puissance de la Résurrection',
      preacher: 'Apôtre Visionnaire',
      date: '05 Janv. 2026',
      thumbnail: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=500&q=80',
      duration: '54:20',
      category: 'Fondement',
      views: 1250
    },
    {
      id: 's2',
      title: 'Marcher par l\'Esprit',
      preacher: 'Pasteur de Gloire',
      date: '01 Janv. 2026',
      thumbnail: 'https://images.unsplash.com/photo-1490127252417-7c393f993ee4?w=500&q=80',
      duration: '42:15',
      category: 'Vie Spirituelle',
      views: 850
    }
  ] as Sermon[],

  events: [
    {
      id: 'e1',
      title: 'Culte de Célébration',
      date: 'Dimanche 11 Janvier',
      time: '09:00',
      location: 'Temple Central',
      image: 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?w=500&q=80',
      category: 'Culte'
    }
  ] as ChurchEvent[],

  ministries: [
    { id: 'm1', name: 'Marcos (Jeunesse)', icon: 'account-group', description: 'Une jeunesse enflammée pour Christ.', color: '#F59E0B' },
    { id: 'm2', name: 'Louange & Adoration', icon: 'music', description: 'Entrer dans la présence par le chant.', color: '#EC4899' },
    { id: 'm3', name: 'Média & Tech', icon: 'video', description: 'Propager l\'évangile par l\'image.', color: '#0EA5E9' },
    { id: 'm4', name: 'Protocoles', icon: 'shield-check', description: 'Servir avec excellence et ordre.', color: '#10B981' }
  ] as Ministry[]
};

// app/hooks/useToast.tsx
// Hook pour gérer les toasts facilement

import { useState, useCallback } from 'react';

interface ToastState {
  visible: boolean;
  message: string;
  type: 'success' | 'error' | 'info' | 'loading' | 'reminder';
}

export function useToast() {
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    message: '',
    type: 'success'
  });

  const showToast = useCallback((message: string, type: ToastState['type'] = 'success') => {
    setToast({ visible: true, message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, visible: false }));
  }, []);

  // Messages humains prédéfinis
  const success = useCallback((customMessage?: string) => {
    const messages = [
      'Parfait ! Tout est à jour',
      'Super ! C\'est fait',
      'Excellent ! Modification enregistrée',
      'Nickel ! Tout s\'est bien passé'
    ];
    const message = customMessage || messages[Math.floor(Math.random() * messages.length)];
    showToast(message, 'success');
  }, [showToast]);

  const error = useCallback((customMessage?: string) => {
    const message = customMessage || 'Oups... Une erreur s\'est produite';
    showToast(message, 'error');
  }, [showToast]);

  const loading = useCallback((customMessage?: string) => {
    const message = customMessage || 'Chargement en cours...';
    showToast(message, 'loading');
  }, [showToast]);

  const info = useCallback((message: string) => {
    showToast(message, 'info');
  }, [showToast]);

  const reminder = useCallback((message: string) => {
    showToast(message, 'reminder');
  }, [showToast]);

  return {
    toast,
    showToast,
    hideToast,
    success,
    error,
    loading,
    info,
    reminder
  };
}

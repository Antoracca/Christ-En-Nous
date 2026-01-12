import { Stack } from 'expo-router';

export default function MarkosLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // Cache le header par défaut "markos/index"
        animation: 'slide_from_right', // Animation fluide entre les pages
      }}
    />
  );
}

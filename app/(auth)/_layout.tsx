// app/(auth)/_layout.tsx - AUTH STACK LAYOUT
import { Stack } from 'expo-router';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function AuthLayout() {
  const theme = useAppTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen
        name="register-success"
        options={{
          presentation: 'transparentModal',
          gestureEnabled: false,
        }}
      />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="resend-email" />
      <Stack.Screen name="change-email" />
      <Stack.Screen name="change-password" />
      <Stack.Screen name="post-email-change" />
    </Stack>
  );
}

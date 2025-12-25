import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, ActivityIndicator } from "react-native";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import { Provider as PaperProvider } from "react-native-paper";

import { useAuth } from "@/context/AuthContext";
import { useAppTheme } from "@/hooks/useAppTheme";
import { HomeMenuProvider } from "@/context/HomeMenuContext";

import LoginScreen from "@/screens/auth/login";
import RegisterScreen from "@/screens/auth/RegisterScreen";
import RegisterSuccessScreen from "@/screens/auth/RegisterSuccessScreen";
import ForgotPasswordScreen from "@/screens/auth/forgotPassword";
import MainNavigator from "./MainNavigator";
import ModifierProfilScreen from "@/screens/profile/ModifierProfilScreen";
import SecurityScreen from "@/screens/profile/SecurityScreen";
import ResendEmailScreen from "@/screens/auth/ResendEmailScreen";
import ChangeEmailScreen from "@/screens/auth/ChangeEmailScreen";
import ChangePasswordScreen from "@/screens/auth/ChangePasswordScreen";
import PostEmailChangeScreen from "@/screens/auth/PostEmailChangeScreen";
type RootStackParamList = {
  Main: undefined;
  ModifierProfil: undefined;
  Security: undefined;
  ResendEmail: undefined;
  ChangeEmail: undefined;
  ChangePassword: undefined;
  PostEmailChange: { message?: string } | undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  RegisterSuccess: { userName?: string; userEmail?: string } | undefined;
};
import { navigationRef } from "./navigationRef";

const Stack = createNativeStackNavigator<RootStackParamList>();

const InitialLoadingScreen = () => {
  const theme = useAppTheme();
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.colors.background }}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );
};

export default function AppNavigator() {
  const { isAuthenticated, loading: authLoading, shouldShowRegisterSuccess, isRegistering } = useAuth();
  const theme = useAppTheme();

  if (authLoading) {
    return <InitialLoadingScreen />;
  }

  return (
    <PaperProvider theme={theme}>
      <HomeMenuProvider>
        <NavigationContainer ref={navigationRef}>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {shouldShowRegisterSuccess?.show ? (
              <Stack.Screen
                name="RegisterSuccess"
                component={RegisterSuccessScreen}
                initialParams={{
                  userName: shouldShowRegisterSuccess.userName,
                  userEmail: shouldShowRegisterSuccess.userEmail,
                }}
                options={{
                  animation: "slide_from_right",
                  presentation: "transparentModal",
                  gestureEnabled: false,
                }}
              />
            ) : isAuthenticated && !isRegistering ? (
              <>
                <Stack.Screen
                  name="Main"
                  component={MainNavigator}
                  options={({ route }) => {
                    const routeName = getFocusedRouteNameFromRoute(route) ?? "HomeTab";
                    let headerTitle;
                    switch (routeName) {
                      case "BibleTab":
                        headerTitle = "Sainte Bible";
                        break;
                      case "CoursesTab":
                        headerTitle = "Cours";
                        break;
                      case "PrayerTab":
                        headerTitle = "Prieres";
                        break;
                      case "ProfileTab":
                        headerTitle = "Profil";
                        break;
                      default:
                        headerTitle = "Accueil";
                    }
                    return { headerTitle };
                  }}
                />
                <Stack.Screen
                  name="ModifierProfil"
                  component={ModifierProfilScreen}
                  options={{
                    headerShown: true,
                    title: "Modifier le profil",
                    headerStyle: { backgroundColor: theme.colors.surface },
                    headerTitleStyle: { fontFamily: "Nunito_700Bold", color: theme.custom.colors.text },
                    headerTintColor: theme.custom.colors.text,
                  }}
                />
                <Stack.Screen
                  name="Security"
                  component={SecurityScreen}
                  options={{
                    headerShown: true,
                    title: "Securite",
                    headerStyle: { backgroundColor: theme.colors.surface },
                    headerShadowVisible: false,
                    headerTitleStyle: { fontFamily: "Nunito_700Bold", color: theme.custom.colors.text, fontSize: 20 },
                    headerTintColor: theme.custom.colors.text,
                    animation: "slide_from_right",
                    gestureEnabled: true,
                  }}
                />
                <Stack.Screen
                  name="ResendEmail"
                  component={ResendEmailScreen}
                  options={{ headerShown: false, animation: "slide_from_right", gestureEnabled: true }}
                />
                <Stack.Screen
                  name="ChangeEmail"
                  component={ChangeEmailScreen}
                  options={{ headerShown: false, animation: "slide_from_right", gestureEnabled: true }}
                />
                <Stack.Screen
                  name="ChangePassword"
                  component={ChangePasswordScreen}
                  options={{ headerShown: false, animation: "slide_from_right", gestureEnabled: true }}
                />
                <Stack.Screen
                  name="PostEmailChange"
                  component={PostEmailChangeScreen}
                  options={{ headerShown: false, animation: "fade", gestureEnabled: false }}
                />
              </>
            ) : (
              <>
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Register" component={RegisterScreen} />
                <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
                <Stack.Screen
                  name="PostEmailChange"
                  component={PostEmailChangeScreen}
                  options={{ headerShown: false, animation: "fade", gestureEnabled: false }}
                />
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </HomeMenuProvider>
    </PaperProvider>
  );
}

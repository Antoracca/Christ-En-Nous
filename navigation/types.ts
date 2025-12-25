export type RootStackParamList = {
  Main: { screen?: string } | undefined;
  Login: { email?: string };
  Register: undefined;
  RegisterSuccess: { userName: string; userEmail: string };
  ForgotPassword: undefined;
  ModifierProfil: undefined;
  Security: undefined;
  ResendEmail: undefined;
  ChangeEmail: undefined;
  ChangePassword: undefined;
  PostEmailChange: { newEmail: string };
  InitialLoading: undefined;
  ProfileTab: undefined;
};

import { createNavigationContainerRef } from "@react-navigation/native";
import type { RootStackParamList } from './types';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function navigate<Name extends keyof RootStackParamList>(
  ...args: undefined extends RootStackParamList[Name]
    ? [screen: Name, params?: RootStackParamList[Name]]
    : [screen: Name, params: RootStackParamList[Name]]
) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(args[0] as any, args[1] as any);
  }
}

export function push<Name extends keyof RootStackParamList>(
  ...args: undefined extends RootStackParamList[Name]
    ? [screen: Name, params?: RootStackParamList[Name]]
    : [screen: Name, params: RootStackParamList[Name]]
) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(args[0] as any, args[1] as any);
  }
}

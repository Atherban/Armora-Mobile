import { Stack, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import SafeScreen from "../src/components/SafeScreen";
import { StatusBar } from "expo-status-bar";
import { useAuthStore } from "../src/store/auth.store";
import { useEffect, useState } from "react";
import COLORS from "@/src/constants/colors";
import { ActivityIndicator } from "react-native";

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { checkAuth, user, token } = useAuthStore();
  const [authChecked, setAuthChecked] = useState(false); // wait until auth is checked

  // Run auth check once
  useEffect(() => {
    const fetchAuth = async () => {
      await checkAuth();
      setAuthChecked(true);
    };
    fetchAuth();
  }, []);

  // handle navigation only after auth check and after mount
  useEffect(() => {
    if (!authChecked) return; // wait until auth state is ready

    const inAuthScreen = segments[0] === "(auth)";
    const isSignedIn = !!user && !!token;

    if (!isSignedIn && !inAuthScreen) router.replace("/(auth)/signup");
    else if (isSignedIn && inAuthScreen) router.replace("/(tabs)");
  }, [authChecked, user, token, segments]);

  // show splash screen while checking auth
  if (!authChecked) return <ActivityIndicator />;

  return (
    <SafeAreaProvider style={{ backgroundColor: COLORS.black }}>
      <SafeScreen>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: COLORS.black },
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" />
        </Stack>
      </SafeScreen>
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}

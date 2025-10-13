import * as SecureStore from "expo-secure-store";

export async function isLoggedIn(): Promise<boolean> {
  // Example: check if a token exists in secure storage
  const token = await SecureStore.getItemAsync("userToken");
  return !!token;
}

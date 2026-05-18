import * as SecureStore from "expo-secure-store";
import { AuthTokens } from "../types/auth";
import { UserProfile } from "../types/user";

const TOKENS_KEY = "sos_security_tokens";
const USER_KEY = "sos_security_user";

export const secureStorage = {
  async saveTokens(tokens: AuthTokens) {
    await SecureStore.setItemAsync(TOKENS_KEY, JSON.stringify(tokens));
  },
  async getTokens(): Promise<AuthTokens | null> {
    const value = await SecureStore.getItemAsync(TOKENS_KEY);
    return value ? (JSON.parse(value) as AuthTokens) : null;
  },
  async clearTokens() {
    await SecureStore.deleteItemAsync(TOKENS_KEY);
  },
  async saveUser(user: UserProfile) {
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
  },
  async getUser(): Promise<UserProfile | null> {
    const value = await SecureStore.getItemAsync(USER_KEY);
    return value ? (JSON.parse(value) as UserProfile) : null;
  },
  async clearUser() {
    await SecureStore.deleteItemAsync(USER_KEY);
  },
};

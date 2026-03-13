import { create } from "zustand";
import { isAxiosError } from "axios";
import { AuthTokens } from "../types/auth";
import { UserProfile } from "../types/user";
import { authApi } from "../api/modules/auth";
import { usersApi } from "../api/modules/users";
import { secureStorage } from "./secureStorage";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: UserProfile | null;
  role: UserProfile["role"] | null;
  isBootstrapped: boolean;
  isAuthenticated: boolean;
  bootstrap: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  refresh: () => Promise<boolean>;
  logout: () => Promise<void>;
  setTokens: (tokens: AuthTokens | null) => void;
}

const toTokenState = (tokens: AuthTokens | null) => ({
  accessToken: tokens?.accessToken ?? null,
  refreshToken: tokens?.refreshToken ?? null,
});

const isInvalidRefreshError = (error: unknown) => {
  if (!isAxiosError(error)) {
    return false;
  }
  const status = error.response?.status;
  return status === 400 || status === 401 || status === 403;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  role: null,
  isBootstrapped: false,
  isAuthenticated: false,
  bootstrap: async () => {
    const tokens = await secureStorage.getTokens();

    // Try the stored access token first — verify it's still valid via /users/me
    if (tokens?.accessToken && tokens.refreshToken) {
      try {
        const me = await usersApi.me(tokens.accessToken);
        await secureStorage.saveUser(me);
        set({
          ...toTokenState(tokens),
          user: me,
          role: me.role,
          isAuthenticated: true,
          isBootstrapped: true,
        });
        return;
      } catch {
        // Access token expired or invalid — fall through to refresh
      }
    }

    // Refresh path: exchange refresh token for a new token pair
    if (tokens?.refreshToken) {
      try {
        const refreshed = await authApi.refresh({ refreshToken: tokens.refreshToken });
        const me = await usersApi.me(refreshed.accessToken);
        await Promise.all([secureStorage.saveTokens(refreshed), secureStorage.saveUser(me)]);
        set({
          ...toTokenState(refreshed),
          user: me,
          role: me.role,
          isAuthenticated: true,
          isBootstrapped: true,
        });
        return;
      } catch {}
    }

    await Promise.all([secureStorage.clearTokens(), secureStorage.clearUser()]);
    set({ isBootstrapped: true });
  },
  login: async (email: string, password: string) => {
    const tokens = await authApi.login({ email, password });
    const me = await usersApi.me(tokens.accessToken);
    await Promise.all([secureStorage.saveTokens(tokens), secureStorage.saveUser(me)]);
    set({
      ...toTokenState(tokens),
      user: me,
      role: me.role,
      isAuthenticated: true,
    });
  },
  register: async (email: string, password: string) => {
    const tokens = await authApi.register({ email, password });
    const me = await usersApi.me(tokens.accessToken);
    await Promise.all([secureStorage.saveTokens(tokens), secureStorage.saveUser(me)]);
    set({
      ...toTokenState(tokens),
      user: me,
      role: me.role,
      isAuthenticated: true,
    });
  },
  refresh: async () => {
    const current = get();
    if (!current.refreshToken) {
      return false;
    }
    try {
      const tokens = await authApi.refresh({ refreshToken: current.refreshToken });
      await secureStorage.saveTokens(tokens);
      set({ ...toTokenState(tokens), isAuthenticated: true });
      return true;
    } catch (error) {
      if (isInvalidRefreshError(error)) {
        await get().logout();
      }
      return false;
    }
  },
  logout: async () => {
    const refreshToken = get().refreshToken;
    if (refreshToken) {
      try {
        await authApi.logout({ refreshToken });
      } catch {}
    }
    await Promise.all([secureStorage.clearTokens(), secureStorage.clearUser()]);

    set({
      accessToken: null,
      refreshToken: null,
      user: null,
      role: null,
      isAuthenticated: false,
    });
  },
  setTokens: (tokens: AuthTokens | null) => {
    set({
      ...toTokenState(tokens),
      isAuthenticated: Boolean(tokens?.accessToken && get().user),
    });
  },
}));

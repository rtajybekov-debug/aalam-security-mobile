import axios, { AxiosError, InternalAxiosRequestConfig, isAxiosError } from "axios";
import { ENV } from "../config/env";
import { secureStorage } from "../stores/secureStorage";
import { AuthTokens } from "../types/auth";

type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

export const publicClient = axios.create({
  baseURL: ENV.apiBaseUrl,
  timeout: 15000,
});

export const apiClient = axios.create({
  baseURL: ENV.apiBaseUrl,
  timeout: 15000,
});

let isRefreshing = false;
let queuedRequests: Array<(token: string | null) => void> = [];

const resolveQueue = (token: string | null) => {
  queuedRequests.forEach((cb) => cb(token));
  queuedRequests = [];
};

const shouldLogoutOnRefreshFailure = (error: unknown) => {
  if (!isAxiosError(error)) {
    return false;
  }
  const status = error.response?.status;
  return status === 400 || status === 401 || status === 403;
};

const authStore = () => require("../stores/authStore").useAuthStore as {
  getState: () => {
    accessToken: string | null;
    refreshToken: string | null;
    setTokens: (tokens: AuthTokens | null) => void;
    logout: () => Promise<void>;
  };
};

const refreshTokens = async (): Promise<AuthTokens | null> => {
  const state = authStore().getState();
  const storedTokens = state.accessToken && state.refreshToken
    ? { accessToken: state.accessToken, refreshToken: state.refreshToken }
    : await secureStorage.getTokens();
  const refreshToken = storedTokens?.refreshToken;
  if (!refreshToken) {
    return null;
  }

  const response = await publicClient.post<AuthTokens>("/auth/refresh", {
    refreshToken,
  });
  return response.data;
};

apiClient.interceptors.request.use((config) => {
  const token = authStore().getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableConfig | undefined;

    if (!originalRequest || error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queuedRequests.push((token) => {
          if (!token) {
            reject(error);
            return;
          }
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(apiClient(originalRequest));
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const tokens = await refreshTokens();
      if (!tokens) {
        throw error;
      }

      authStore().getState().setTokens(tokens);
      await secureStorage.saveTokens(tokens);
      resolveQueue(tokens.accessToken);
      originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      if (shouldLogoutOnRefreshFailure(refreshError)) {
        await authStore().getState().logout();
      }
      resolveQueue(null);
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

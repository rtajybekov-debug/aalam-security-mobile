const fallbackApi = "http://localhost:3000";

export const ENV = {
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? fallbackApi,
  wsUrl: process.env.EXPO_PUBLIC_WS_URL ?? fallbackApi,
  mapsApiKeyIos: process.env.EXPO_PUBLIC_MAPS_API_KEY_IOS ?? "",
  mapsApiKeyAndroid: process.env.EXPO_PUBLIC_MAPS_API_KEY_ANDROID ?? "",
};

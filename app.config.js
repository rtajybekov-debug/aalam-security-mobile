import { ExpoConfig, ConfigContext } from "@expo/config";

/**
 * Google Maps API keys are read from .env and injected at prebuild time.
 * You MUST use a development build (npx expo run:ios / run:android), NOT Expo Go.
 * After changing .env, run: npx expo prebuild --clean && npx expo run:android (or run:ios)
 */
export default ({ config }: ConfigContext): ExpoConfig => {
  const mapsApiKeyIos = process.env.EXPO_PUBLIC_MAPS_API_KEY_IOS?.trim() || "";
  const mapsApiKeyAndroid = process.env.EXPO_PUBLIC_MAPS_API_KEY_ANDROID?.trim() || "";

  return {
    ...config,
    ios: {
      ...config.ios,
      config: {
        ...(config.ios?.config ?? {}),
        googleMapsApiKey: mapsApiKeyIos || undefined,
      },
    },
    android: {
      ...config.android,
      config: {
        ...(config.android?.config ?? {}),
        googleMaps: {
          ...(config.android?.config?.googleMaps ?? {}),
          apiKey: mapsApiKeyAndroid || undefined,
        },
      },
    },
  } as ExpoConfig;
};

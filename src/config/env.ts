import Constants from "expo-constants";

const DEV_FALLBACK_API = "http://localhost:3000";

type Key = "apiBaseUrl" | "wsUrl";
type EnvKey = "EXPO_PUBLIC_API_BASE_URL" | "EXPO_PUBLIC_WS_URL";

const EXTRA = (Constants.expoConfig?.extra ?? {}) as Record<string, unknown>;

const ENV_FALLBACK: Record<Key, EnvKey> = {
  apiBaseUrl: "EXPO_PUBLIC_API_BASE_URL",
  wsUrl: "EXPO_PUBLIC_WS_URL",
};

const readSetting = (key: Key): string => {
  const fromExtra = typeof EXTRA[key] === "string" ? (EXTRA[key] as string).trim() : "";
  if (fromExtra) return fromExtra;

  const envKey = ENV_FALLBACK[key];
  const fromEnv = process.env[envKey]?.trim() ?? "";
  if (fromEnv) return fromEnv;

  if (__DEV__) return DEV_FALLBACK_API;

  throw new Error(
    `[env] ${key} is not configured. Set it in app.json under "expo.extra.${key}" or as ${envKey}.`,
  );
};

const ensureSecureUrl = (
  key: Key,
  url: string,
  allowedHttps: ReadonlyArray<string>,
  allowedHttp: ReadonlyArray<string>,
) => {
  if (__DEV__) return;
  const ok = allowedHttps.some((p) => url.startsWith(p));
  if (!ok) {
    const allowed = [...allowedHttps, ...allowedHttp].join(" / ");
    throw new Error(
      `[env] ${key} must use ${allowed} in production, got "${url}".`,
    );
  }
};

const apiBaseUrl = readSetting("apiBaseUrl");
const wsUrl = readSetting("wsUrl");

ensureSecureUrl("apiBaseUrl", apiBaseUrl, ["https://"], ["http://"]);
ensureSecureUrl("wsUrl", wsUrl, ["wss://", "https://"], ["ws://", "http://"]);

export const ENV = {
  apiBaseUrl,
  wsUrl,
  mapsApiKeyIos:
    (typeof EXTRA.mapsApiKeyIos === "string" ? (EXTRA.mapsApiKeyIos as string) : null) ??
    process.env.EXPO_PUBLIC_MAPS_API_KEY_IOS ??
    "",
  mapsApiKeyAndroid:
    (typeof EXTRA.mapsApiKeyAndroid === "string" ? (EXTRA.mapsApiKeyAndroid as string) : null) ??
    process.env.EXPO_PUBLIC_MAPS_API_KEY_ANDROID ??
    "",
  /** Empty string = telemetry disabled; safe to ship without it. */
  sentryDsn:
    (typeof EXTRA.sentryDsn === "string" ? (EXTRA.sentryDsn as string).trim() : null) ??
    process.env.EXPO_PUBLIC_SENTRY_DSN?.trim() ??
    "",
};

const DEV_FALLBACK_API = "http://localhost:3000";

const readEnv = (key: "EXPO_PUBLIC_API_BASE_URL" | "EXPO_PUBLIC_WS_URL"): string => {
  const raw = process.env[key]?.trim() ?? "";
  if (raw) {
    return raw;
  }
  if (__DEV__) {
    return DEV_FALLBACK_API;
  }
  throw new Error(
    `[env] ${key} is not set. Production builds must define this in EAS environment variables.`,
  );
};

const ensureSecureUrl = (
  key: "EXPO_PUBLIC_API_BASE_URL" | "EXPO_PUBLIC_WS_URL",
  url: string,
  allowedHttps: ReadonlyArray<string>,
  allowedHttp: ReadonlyArray<string>,
) => {
  if (__DEV__) {
    return;
  }
  const ok = allowedHttps.some((p) => url.startsWith(p));
  if (!ok) {
    const allowed = [...allowedHttps, ...allowedHttp].join(" / ");
    throw new Error(
      `[env] ${key} must use ${allowed} in production, got "${url}".`,
    );
  }
};

const apiBaseUrl = readEnv("EXPO_PUBLIC_API_BASE_URL");
const wsUrl = readEnv("EXPO_PUBLIC_WS_URL");

ensureSecureUrl("EXPO_PUBLIC_API_BASE_URL", apiBaseUrl, ["https://"], ["http://"]);
ensureSecureUrl("EXPO_PUBLIC_WS_URL", wsUrl, ["wss://", "https://"], ["ws://", "http://"]);

export const ENV = {
  apiBaseUrl,
  wsUrl,
  mapsApiKeyIos: process.env.EXPO_PUBLIC_MAPS_API_KEY_IOS ?? "",
  mapsApiKeyAndroid: process.env.EXPO_PUBLIC_MAPS_API_KEY_ANDROID ?? "",
  /** Empty string = telemetry disabled; safe to ship without it. */
  sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN?.trim() ?? "",
};

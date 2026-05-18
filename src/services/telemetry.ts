import * as Sentry from "@sentry/react-native";
import { ENV } from "../config/env";

/**
 * Best-effort PII scrubber for events leaving the device.
 *
 * SOS is privacy-sensitive — we strip anything that could carry user identity,
 * authentication material, or geolocation. The fields are removed in-place rather
 * than rewritten so any unknown carriers (custom contexts added later) still go
 * through the same filter without code changes.
 */
const PII_KEY_PATTERN =
  /^(token|access_?token|refresh_?token|authorization|email|phone|latitude|longitude|coords?|location|password)$/i;

function scrub<T>(value: T, depth = 0): T {
  if (depth > 5 || value == null) return value;
  if (Array.isArray(value)) {
    return value.map((item) => scrub(item, depth + 1)) as unknown as T;
  }
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (PII_KEY_PATTERN.test(k)) {
        out[k] = "[redacted]";
        continue;
      }
      out[k] = scrub(v, depth + 1);
    }
    return out as unknown as T;
  }
  return value;
}

let initialized = false;

export const telemetry = {
  init() {
    if (initialized) return;
    if (!ENV.sentryDsn) {
      // No DSN configured: ship the build, just don't report. Keeps dev/preview builds light.
      return;
    }
    Sentry.init({
      dsn: ENV.sentryDsn,
      environment: __DEV__ ? "development" : "production",
      // Sample 100% in dev to verify wiring; reduce in prod to keep volume sane.
      tracesSampleRate: __DEV__ ? 1.0 : 0.2,
      // Drop request bodies wholesale; we never want them server-side for a life-safety app.
      sendDefaultPii: false,
      beforeSend(event) {
        if (event.user) {
          // Keep stable id for grouping if present, drop anything identifying.
          event.user = event.user.id ? { id: event.user.id } : undefined;
        }
        if (event.request) {
          delete event.request.data;
          delete event.request.cookies;
          if (event.request.headers) {
            event.request.headers = scrub(event.request.headers);
          }
        }
        if (event.contexts) {
          event.contexts = scrub(event.contexts);
        }
        if (event.extra) {
          event.extra = scrub(event.extra);
        }
        if (event.tags) {
          event.tags = scrub(event.tags);
        }
        return event;
      },
      beforeBreadcrumb(crumb) {
        if (crumb.data) {
          crumb.data = scrub(crumb.data);
        }
        return crumb;
      },
    });
    initialized = true;
  },
  captureException(error: unknown, context?: Record<string, unknown>) {
    if (!initialized) return;
    Sentry.captureException(error, context ? { extra: scrub(context) } : undefined);
  },
  setUserId(userId: string | null) {
    if (!initialized) return;
    Sentry.setUser(userId ? { id: userId } : null);
  },
  wrap: Sentry.wrap,
};

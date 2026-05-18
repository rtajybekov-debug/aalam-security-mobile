export const palette = {
  white: "#FFFFFF",
  black: "#0B1220",
  slate50: "#F8FAFC",
  slate100: "#F1F5F9",
  slate200: "#E2E8F0",
  slate300: "#CBD5E1",
  slate400: "#94A3B8",
  slate500: "#64748B",
  slate600: "#475569",
  slate700: "#334155",
  slate800: "#1E293B",
  slate900: "#0F172A",
  red500: "#EF4444",
  red600: "#DC2626",
  red700: "#B91C1C",
  amber500: "#F59E0B",
  amber600: "#D97706",
  blue500: "#3B82F6",
  blue600: "#2563EB",
  emerald500: "#10B981",
  emerald600: "#059669",
  violet500: "#8B5CF6",
} as const;

/** Concept style guide palette — neon lime accent on OLED black */
export const conceptPalette = {
  accent: "#C8F53A",
  surface: "#1C1E2A",
  surfaceInput: "#161822",
  muted: "#8B8B8B",
  light: "#F5F5FA",
  white: "#FFFFFF",
  background: "#0A0A0A",
} as const;

/** OLED Dark Mode — neon lime on true black. App is locked to this theme. */
export const semanticOledDarkColors = {
  primary: conceptPalette.accent,
  onPrimary: "#000000",
  secondary: conceptPalette.surface,
  onSecondary: conceptPalette.white,
  danger: "#F87171",
  onDanger: palette.white,
  background: conceptPalette.background,
  surface: conceptPalette.surface,
  surfaceVariant: "#252D3D",
  onSurface: conceptPalette.white,
  onSurfaceMuted: conceptPalette.muted,
  border: "#2A2E3A",
  success: palette.emerald500,
  warning: "#FBBF24",
} as const;

/** For LinearGradient: [startColor, endColor] */
export const oledDangerGradient = ["#F87171", "#EF4444"] as const;
/** Active SOS session: warm amber→orange on black, distinct from danger red */
export const oledActiveGradient = ["#FDE047", "#EA580C"] as const;

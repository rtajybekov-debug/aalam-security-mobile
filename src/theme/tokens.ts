import {
  semanticLightColors,
  semanticOledDarkColors,
  lightDangerGradient,
  oledDangerGradient,
  oledActiveGradient,
} from "./colors";
import { elevation } from "./elevation";
import { radius } from "./radius";
import { spacing } from "./spacing";
import { statusColorsDark, statusColorsLight } from "./statusColors";
import { typography } from "./typography";

/** Emergency category accent colors - theme-aware */
export const categoryColorsLight = {
  medical: "#10B981",
  fire: "#EF4444",
  natural: "#059669",
  accident: "#8B5CF6",
  violence: "#EC4899",
  rescue: "#F59E0B",
} as const;

export const categoryColorsDark = {
  medical: "#34D399",
  fire: "#F87171",
  natural: "#10B981",
  accident: "#A78BFA",
  violence: "#F472B6",
  rescue: "#FBBF24",
} as const;

export interface ThemeTokens {
  colors: {
    primary: string;
    onPrimary: string;
    secondary: string;
    onSecondary: string;
    danger: string;
    onDanger: string;
    background: string;
    surface: string;
    surfaceVariant: string;
    onSurface: string;
    onSurfaceMuted: string;
    border: string;
    success: string;
    warning: string;
    /** Emergency category accent colors (theme-aware) */
    category: Record<keyof typeof categoryColorsLight, string>;
    /** [start, end] for LinearGradient - OLED theme only */
    dangerGradient?: readonly [string, string];
    activeGradient?: readonly [string, string];
  };
  spacing: typeof spacing;
  radius: typeof radius;
  elevation: typeof elevation;
  typography: typeof typography;
  status: typeof statusColorsLight;
}

export const lightTokens: ThemeTokens = {
  colors: {
    ...semanticLightColors,
    category: categoryColorsLight,
    dangerGradient: lightDangerGradient,
    activeGradient: ["#FF9F43", "#34D399"] as const,
  },
  spacing,
  radius,
  elevation,
  typography,
  status: statusColorsLight,
};

/** OLED Dark Mode tokens - true black, premium feel (used when isDark) */
export const oledDarkTokens: ThemeTokens = {
  colors: {
    ...semanticOledDarkColors,
    category: categoryColorsDark,
    dangerGradient: oledDangerGradient,
    activeGradient: oledActiveGradient,
  },
  spacing,
  radius,
  elevation,
  typography,
  status: statusColorsDark,
};

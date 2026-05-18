import {
  semanticOledDarkColors,
  oledDangerGradient,
  oledActiveGradient,
} from "./colors";
import { elevation } from "./elevation";
import { radius } from "./radius";
import { spacing } from "./spacing";
import { statusColorsDark } from "./statusColors";
import { typography } from "./typography";

/** Emergency category accent colors (OLED dark theme) */
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
    /** Emergency category accent colors */
    category: Record<keyof typeof categoryColorsDark, string>;
    /** [start, end] for LinearGradient */
    dangerGradient?: readonly [string, string];
    activeGradient?: readonly [string, string];
  };
  spacing: typeof spacing;
  radius: typeof radius;
  elevation: typeof elevation;
  typography: typeof typography;
  status: typeof statusColorsDark;
}

/** OLED Dark Mode tokens — true black, premium feel. App is locked to this theme. */
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

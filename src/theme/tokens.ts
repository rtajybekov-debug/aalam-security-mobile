import { semanticDarkColors, semanticLightColors } from "./colors";
import { elevation } from "./elevation";
import { radius } from "./radius";
import { spacing } from "./spacing";
import { statusColorsDark, statusColorsLight } from "./statusColors";
import { typography } from "./typography";

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
  };
  spacing: typeof spacing;
  radius: typeof radius;
  elevation: typeof elevation;
  typography: typeof typography;
  status: typeof statusColorsLight;
}

export const lightTokens: ThemeTokens = {
  colors: semanticLightColors,
  spacing,
  radius,
  elevation,
  typography,
  status: statusColorsLight,
};

export const darkTokens: ThemeTokens = {
  colors: semanticDarkColors,
  spacing,
  radius,
  elevation,
  typography,
  status: statusColorsDark,
};

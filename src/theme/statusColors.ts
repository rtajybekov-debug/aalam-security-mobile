import { EmergencyStatus } from "../types/emergency";

type StatusPalette = Record<EmergencyStatus, { bg: string; fg: string; border: string }>;

export const statusColorsLight: StatusPalette = {
  NEW: { bg: "#FEF3C7", fg: "#92400E", border: "#F59E0B" },
  ASSIGNED: { bg: "#DBEAFE", fg: "#1E40AF", border: "#3B82F6" },
  IN_PROGRESS: { bg: "#EDE9FE", fg: "#5B21B6", border: "#8B5CF6" },
  CLOSED: { bg: "#D1FAE5", fg: "#065F46", border: "#10B981" },
};

export const statusColorsDark: StatusPalette = {
  NEW: { bg: "#3B2F12", fg: "#FCD34D", border: "#FBBF24" },
  ASSIGNED: { bg: "#12233F", fg: "#93C5FD", border: "#60A5FA" },
  IN_PROGRESS: { bg: "#2E1E56", fg: "#C4B5FD", border: "#A78BFA" },
  CLOSED: { bg: "#063226", fg: "#6EE7B7", border: "#34D399" },
};

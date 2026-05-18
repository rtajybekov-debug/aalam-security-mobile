import { EmergencyStatus } from "../types/emergency";

type StatusPalette = Record<EmergencyStatus, { bg: string; fg: string; border: string }>;

export const statusColorsDark: StatusPalette = {
  NEW: { bg: "#3B2F12", fg: "#FCD34D", border: "#FBBF24" },
  ASSIGNED: { bg: "#12233F", fg: "#93C5FD", border: "#60A5FA" },
  IN_PROGRESS: { bg: "#2E1E56", fg: "#C4B5FD", border: "#A78BFA" },
  CLOSED: { bg: "#063226", fg: "#6EE7B7", border: "#34D399" },
};

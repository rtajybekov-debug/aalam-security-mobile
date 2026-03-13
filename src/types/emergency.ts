export type EmergencyStatus = "NEW" | "ASSIGNED" | "IN_PROGRESS" | "CLOSED";

export interface EmergencyLocation {
  id?: string;
  sessionId?: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  createdAt?: string;
}

export interface EmergencySession {
  id: string;
  userId: string;
  assignedOperatorId?: string | null;
  status: EmergencyStatus;
  createdAt: string;
  closedAt?: string | null;
  resolution?: string | null;
  locations?: EmergencyLocation[];
  user?: {
    id: string;
    email: string;
    role: "USER" | "OPERATOR" | "ADMIN";
  };
  assignedOperator?: {
    id: string;
    email: string;
  } | null;
}

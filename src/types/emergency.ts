export type EmergencyStatus = "NEW" | "ASSIGNED" | "IN_PROGRESS" | "CLOSED";

export interface EmergencyLocation {
  id?: string;
  sessionId?: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  createdAt?: string;
}

/** Приходит с бэка при старте SOS; координаты филиала для режима «объект» */
export interface EmergencyVenueRef {
  id: string;
  name?: string;
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
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
  venueId?: string | null;
  emergencyType?: "PERSONAL" | "VENUE";
  venue?: EmergencyVenueRef | null;
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

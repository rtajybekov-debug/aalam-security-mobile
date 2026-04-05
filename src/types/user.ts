import { Role } from "./common";

export interface UserProfile {
  id: string;
  email: string;
  role: Role;
  displayName?: string | null;
  phone?: string | null;
  individualSubscriptionActive?: boolean;
  subscriptionExpiresAt?: string | null;
  planId?: string | null;
  createdAt?: string;
}

export interface UpdateUserMePayload {
  displayName?: string;
  phone?: string;
}

export interface UserListItem extends UserProfile {}

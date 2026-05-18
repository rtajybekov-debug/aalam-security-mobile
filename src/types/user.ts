import { Role } from "./common";

export interface UserProfile {
  id: string;
  email: string;
  role: Role;
  displayName?: string | null;
  phone?: string | null;
  phoneVerifiedAt?: string | null;
  telegramId?: string | null;
  telegramUsername?: string | null;
  individualSubscriptionActive?: boolean;
  subscriptionExpiresAt?: string | null;
  planId?: string | null;
  createdAt?: string;
}

export interface UpdateUserMePayload {
  displayName?: string;
  phone: string;
}

export interface UserListItem extends UserProfile {}

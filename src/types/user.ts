import { Role } from "./common";

export interface UserProfile {
  id: string;
  email: string;
  role: Role;
  createdAt?: string;
}

export interface UserListItem extends UserProfile {}

import { apiClient } from "../client";

export interface OrganizationMember {
  id: string;
  organizationId: string;
  role: string;
  organization: {
    id: string;
    name: string;
    type: string;
    slug: string;
    venues: Venue[];
    _count?: { members: number };
  };
}

export interface Venue {
  id: string;
  organizationId: string;
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

export const organizationApi = {
  async getMyOrganizations() {
    const { data } = await apiClient.get<OrganizationMember[]>("/organization/my");
    return data;
  },
  async create(payload: { name: string; type: "PERSONAL" | "BUSINESS" }) {
    const { data } = await apiClient.post<OrganizationMember["organization"]>("/organization", payload);
    return data;
  },
};

export const venueApi = {
  async list(organizationId: string) {
    const { data } = await apiClient.get<Venue[]>(`/venue/organization/${organizationId}`);
    return data;
  },
  async create(organizationId: string, payload: { name: string; address?: string; latitude?: number; longitude?: number }) {
    const { data } = await apiClient.post<Venue>(`/venue/organization/${organizationId}`, payload);
    return data;
  },
};

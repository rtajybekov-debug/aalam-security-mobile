import { apiClient } from "../client";

export interface EmergencyContact {
  id: string;
  userId: string;
  name: string;
  phone?: string;
  email?: string;
  isTrusted: boolean;
  createdAt: string;
}

export const emergencyContactsApi = {
  async list() {
    const { data } = await apiClient.get<EmergencyContact[]>("/emergency-contacts");
    return data;
  },
  async create(payload: { name: string; phone: string; email?: string; isTrusted?: boolean }) {
    const { data } = await apiClient.post<EmergencyContact>("/emergency-contacts", payload);
    return data;
  },
  async delete(id: string) {
    const { data } = await apiClient.delete<{ status: string }>(`/emergency-contacts/${id}`);
    return data;
  },
};

import { apiClient } from "../client";
import { PaginatedResponse } from "../../types/common";
import { EmergencyLocation, EmergencySession } from "../../types/emergency";

export const emergencyApi = {
  async start() {
    const { data } = await apiClient.post<EmergencySession>("/emergency/start");
    return data;
  },
  async sendLocation(sessionId: string, location: EmergencyLocation) {
    const { data } = await apiClient.post<EmergencyLocation>(
      `/emergency/${sessionId}/location`,
      location,
    );
    return data;
  },
  async close(sessionId: string) {
    const { data } = await apiClient.post<EmergencySession>(`/emergency/${sessionId}/close`);
    return data;
  },
  async getActive(page = 1, limit = 20) {
    const { data } = await apiClient.get<PaginatedResponse<EmergencySession>>("/emergency/active", {
      params: { page, limit },
    });
    return data;
  },
  async getHistory(page = 1, limit = 20) {
    const { data } = await apiClient.get<PaginatedResponse<EmergencySession>>(
      "/emergency/history",
      {
        params: { page, limit },
      },
    );
    return data;
  },
};

import { apiClient } from "../client";
import { PaginatedResponse } from "../../types/common";
import { EmergencySession } from "../../types/emergency";

export const dispatchApi = {
  async startProgress(sessionId: string) {
    const { data } = await apiClient.post<EmergencySession>(`/dispatch/${sessionId}/start-progress`);
    return data;
  },
  async resolve(sessionId: string, resolution: string) {
    const { data } = await apiClient.post<EmergencySession>(
      `/dispatch/${sessionId}/resolve`,
      { resolution },
    );
    return data;
  },
  async heartbeat() {
    const { data } = await apiClient.post<{ status: string }>("/dispatch/heartbeat");
    return data;
  },
  async history(page = 1, limit = 20) {
    const { data } = await apiClient.get<PaginatedResponse<EmergencySession>>("/dispatch/history", {
      params: { page, limit },
    });
    return data;
  },
  async active(page = 1, limit = 20) {
    const { data } = await apiClient.get<PaginatedResponse<EmergencySession>>("/emergency/active", {
      params: { page, limit },
    });
    return data;
  },
};

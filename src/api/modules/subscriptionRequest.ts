import { apiClient } from "../client";

export type SubscriptionRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface SubscriptionRequest {
  id: string;
  userId: string;
  comment: string | null;
  status: SubscriptionRequestStatus;
  rejectionReason: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubscriptionRequestPayload {
  comment?: string;
}

export const subscriptionRequestApi = {
  async create(payload: CreateSubscriptionRequestPayload) {
    const { data } = await apiClient.post<SubscriptionRequest>(
      "/subscription-requests",
      payload,
    );
    return data;
  },

  async getCurrent() {
    const { data } = await apiClient.get<SubscriptionRequest | null>(
      "/subscription-requests/me/current",
    );
    return data;
  },
};

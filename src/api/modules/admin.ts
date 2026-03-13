import { apiClient } from "../client";
import { UserListItem } from "../../types/user";

interface OperatorPayload {
  email: string;
  password: string;
}

export const adminApi = {
  async createOperator(payload: OperatorPayload) {
    const { data } = await apiClient.post<UserListItem>(
      "/admin/users/create-operator",
      payload,
    );
    return data;
  },
};

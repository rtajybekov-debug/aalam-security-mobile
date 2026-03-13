import { AxiosRequestConfig } from "axios";
import { apiClient } from "../client";
import { UserProfile } from "../../types/user";

export const usersApi = {
  async me(accessToken?: string) {
    const config: AxiosRequestConfig | undefined = accessToken
      ? { headers: { Authorization: `Bearer ${accessToken}` } }
      : undefined;
    const { data } = await apiClient.get<UserProfile>("/users/me", config);
    return data;
  },
  async registerPushToken(pushToken: string) {
    const { data } = await apiClient.patch<{ status: string }>(
      "/users/me/push-token",
      { pushToken }
    );
    return data;
  },
};

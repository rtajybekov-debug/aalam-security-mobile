import { AxiosRequestConfig } from "axios";
import { apiClient } from "../client";
import { UpdateUserMePayload, UserProfile } from "../../types/user";

export const usersApi = {
  async me(accessToken?: string) {
    const config: AxiosRequestConfig | undefined = accessToken
      ? { headers: { Authorization: `Bearer ${accessToken}` } }
      : undefined;
    const { data } = await apiClient.get<UserProfile>("/users/me", config);
    return data;
  },
  async patchMe(payload: UpdateUserMePayload) {
    const { data } = await apiClient.patch<UserProfile>("/users/me", payload);
    return data;
  },
  async demoActivateIndividualSubscription() {
    const { data } = await apiClient.post<UserProfile>(
      "/users/me/subscription/demo-activate",
    );
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

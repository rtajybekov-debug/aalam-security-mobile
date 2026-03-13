import { AxiosError } from "axios";
import { ApiErrorPayload } from "../types/common";

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const payload = error.response?.data as ApiErrorPayload | undefined;
    if (Array.isArray(payload?.message)) {
      return payload.message.join(", ");
    }
    return payload?.message || payload?.error || error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unexpected error";
};

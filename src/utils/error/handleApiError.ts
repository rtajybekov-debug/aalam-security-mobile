import { AxiosError } from "axios";
import { ru } from "../../locale/ru";

export const handleApiError = (error: unknown): { status?: number; message: string } => {
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    const data = error.response?.data as { message?: string | string[]; error?: string } | undefined;
    const message = Array.isArray(data?.message)
      ? data.message.join(", ")
      : data?.message || data?.error || error.message;
    return { status, message };
  }
  if (error instanceof Error) {
    return { message: error.message };
  }
  return { message: ru.errors.unknownApi };
};


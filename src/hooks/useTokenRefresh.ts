import { useEffect } from "react";
import { useAuthStore } from "../stores/authStore";

const TEN_MINUTES = 10 * 60 * 1000;

export const useTokenRefresh = () => {
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const refresh = useAuthStore((state) => state.refresh);

  useEffect(() => {
    if (!refreshToken) {
      return;
    }

    const id = setInterval(() => void refresh(), TEN_MINUTES);
    return () => clearInterval(id);
  }, [refresh, refreshToken]);
};

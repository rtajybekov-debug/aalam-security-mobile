import { useEffect } from "react";
import { dispatchApi } from "../api/modules/dispatch";
import { useAuthStore } from "../stores/authStore";
import { useOperatorStore } from "../stores/operatorStore";

export const useHeartbeat = (intervalMs = 15000) => {
  const role = useAuthStore((state) => state.role);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const markHeartbeatSent = useOperatorStore((state) => state.markHeartbeatSent);

  useEffect(() => {
    if (!isAuthenticated || role !== "OPERATOR") {
      return;
    }

    const tick = async () => {
      try {
        await dispatchApi.heartbeat();
        markHeartbeatSent();
      } catch {}
    };

    void tick();
    const id = setInterval(() => void tick(), intervalMs);

    return () => clearInterval(id);
  }, [intervalMs, isAuthenticated, markHeartbeatSent, role]);
};

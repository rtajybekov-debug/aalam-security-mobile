import React, { PropsWithChildren } from "react";
import { AppState } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../stores/authStore";

export const AppLifecycleManager = ({ children }: PropsWithChildren) => {
  const queryClient = useQueryClient();

  React.useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        void queryClient.invalidateQueries();
        // Re-validate the session on resume. After a long background the access
        // token is often expired and the socket may be stale; this refreshes
        // proactively instead of relying on the OS to reset networking.
        const auth = useAuthStore.getState();
        if (auth.isAuthenticated) {
          void auth.revalidateSession();
        }
      }
    });
    return () => subscription.remove();
  }, [queryClient]);

  return <>{children}</>;
};

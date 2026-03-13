import React, { PropsWithChildren } from "react";
import { AppState } from "react-native";
import { useQueryClient } from "@tanstack/react-query";

export const AppLifecycleManager = ({ children }: PropsWithChildren) => {
  const queryClient = useQueryClient();

  React.useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        void queryClient.invalidateQueries();
      }
    });
    return () => subscription.remove();
  }, [queryClient]);

  return <>{children}</>;
};

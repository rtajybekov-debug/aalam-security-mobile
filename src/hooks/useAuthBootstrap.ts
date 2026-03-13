import { useEffect } from "react";
import { useAuthStore } from "../stores/authStore";

export const useAuthBootstrap = () => {
  const bootstrap = useAuthStore((state) => state.bootstrap);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);
};

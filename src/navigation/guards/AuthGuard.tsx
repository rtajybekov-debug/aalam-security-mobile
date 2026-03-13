import React from "react";
import { useAuthStore } from "../../stores/authStore";
import { Role } from "../../types/common";
import { ForbiddenScreen } from "../../screens/common/ForbiddenScreen";

interface Props {
  roles: Role[];
  children: React.ReactNode;
}

export const AuthGuard = ({ roles, children }: Props) => {
  const role = useAuthStore((state) => state.user?.role);
  if (!role || !roles.includes(role)) {
    return <ForbiddenScreen />;
  }
  return <>{children}</>;
};

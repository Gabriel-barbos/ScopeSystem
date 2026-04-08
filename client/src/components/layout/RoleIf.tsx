import React from "react";
import { useAuth } from "@/context/Authcontext";

type Props = {
  roles?: string[];
  children: React.ReactNode;
};

const RoleIf: React.FC<Props> = ({ roles, children }) => {
  const { hasRole } = useAuth();
  if (!hasRole(roles)) return null;
  return <>{children}</>;
};

export default RoleIf;

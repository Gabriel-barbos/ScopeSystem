import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/Authcontext";

type Props = {
  children: React.ReactNode;
  roles?: string[]; 
};

const PrivateRoute: React.FC<Props> = ({ children, roles }) => {
  const { isLogged, loading, hasRole } = useAuth();

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!isLogged) {
    return <Navigate to="/login" replace />;
  }

  if (!hasRole(roles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;

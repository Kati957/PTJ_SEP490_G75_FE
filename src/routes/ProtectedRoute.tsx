import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../features/auth/hooks";
import type { Role } from "../constants/roles";
import { Spin } from "antd";

interface ProtectedRouteProps {
  allowedRoles: Role[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, isAuthenticated, status } = useAuth();

  if (status === "idle" || status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (
    user &&
    Array.isArray(user.roles) &&
    user.roles.some((role) =>
      allowedRoles.map((r) => r.toLowerCase()).includes(role.toLowerCase())
    )
  ) {
    return <Outlet />;
  }

  return <Navigate to="/unauthorized" replace />;
};

export default ProtectedRoute;

import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";

import { useAuth } from "../context/AuthContext";
import { PageLoader } from "./ui/Spinner";
import type { Role } from "../types";

export function ProtectedRoute({
  children,
  roles,
}: {
  children: ReactNode;
  roles?: Role[];
}) {
  const { session, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader />;
  if (!session) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  if (roles && profile && !roles.includes(profile.role)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

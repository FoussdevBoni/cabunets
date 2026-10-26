// src/components/wrappers/RequireAuth.tsx

import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/auth/useAuth";

interface RequireAuthProps {
  role?: "admin" | "client" | "vendeur";
}

export function RequireAuth({ role }: RequireAuthProps) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return <div role="status" className="p-6">Chargement…</div>;

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  if (role && user?.role !== role) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
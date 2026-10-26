// src/components/wrappers/RedirectIfAuthenticated.tsx

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../components/ui/Loader";
import { useAuth } from "../hooks/auth/useAuth";

export const RedirectIfAuthenticated: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading || !isAuthenticated || !user) return;

    // Déterminer la route selon le rôle
    const isAdmin = user.role === "admin";

    if (isAdmin) {
      navigate("/admin/overview", { replace: true });
    } else {
      navigate("/affiliate/overview", { replace: true });
    }
  }, [user, loading, isAuthenticated, navigate]);

  if (loading) {
    return <Loader />;
  }

  return <>{children}</>;
};

export default RedirectIfAuthenticated;
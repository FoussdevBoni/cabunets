import { Navigate } from "react-router-dom";
import Loader from "../../components/ui/Loader";
import { useAuth } from "../../hooks/auth/useAuth";
import { authService } from "../../services/authService";

export default function Redirect() {
  const { user, loading, isAuthenticated, error } = useAuth();
  if (loading) return <Loader />;
  if (!isAuthenticated || !user) {
    return <Navigate to="/auth/login" replace state={{
      authError: error ? authService.getAuthError(error) : undefined,
    }} />;
  }
  return <Navigate to={user.role === "admin" ? "/admin/overview" : "/affiliate/overview"} replace />;
}

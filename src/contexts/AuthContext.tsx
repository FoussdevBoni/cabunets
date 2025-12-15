import React, { createContext, useState, useEffect } from "react";
import { authService, CurrentUser } from "../services/authService";
import useToken from "../hooks/auth/useToken";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  user: CurrentUser | null;
  loading: boolean;
  error: Error | null;
  refreshUser: () => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  refreshUser: async () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
   const navigate = useNavigate()
  const {token , saveToken} = useToken();

  
  // Récupérer l’user au montage
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await authService.getUserProfile(token);

      
        setUser(currentUser);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);


 

  // Permet de forcer une mise à jour manuelle de l'user (ex: après login)
  const refreshUser = async () => {
    setLoading(true);
    try {
      const currentUser = await authService.getUserProfile(token);
      setUser(currentUser);
      setError(null);
    } catch (err) {
      setError(err as Error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    saveToken('')
    navigate("/login")
  };

  return (
    <AuthContext.Provider value={{ user, loading, error ,  refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

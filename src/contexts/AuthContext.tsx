import React, { createContext, useCallback, useEffect, useRef, useState } from "react";
import { authService } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { User } from "../types/User";

const TOKEN_KEY = "token";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: Error | null;
  authenticate: (token: string) => Promise<User>;
  refreshUser: () => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => Promise<void>;
  setUser: (user: User | null) => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null, isAuthenticated: false, loading: true, error: null,
  authenticate: async () => { throw new Error("Authentification indisponible."); },
  refreshUser: async () => {}, logout: () => {}, updateUser: async () => {}, setUser: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const requestVersion = useRef(0);
  const navigate = useNavigate();

  const loadSession = useCallback(async (sessionToken: string): Promise<User> => {
    const version = ++requestVersion.current;
    setLoading(true);
    setError(null);
    try {
      const currentUser = await authService.getUserProfile();
      if (!currentUser?.id || !["admin", "client", "vendeur"].includes(currentUser.role)) {
        throw new Error("Le serveur n'a pas renvoyé un profil utilisateur valide.");
      }
      if (version !== requestVersion.current || localStorage.getItem(TOKEN_KEY) !== sessionToken) {
        throw new Error("La session a changé. Veuillez vous reconnecter.");
      }
      setUser(currentUser);
      setToken(sessionToken);
      return currentUser;
    } catch (failure) {
      if (version === requestVersion.current) {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
        setError(failure as Error);
      }
      throw failure;
    } finally {
      if (version === requestVersion.current) setLoading(false);
    }
  }, []);

  const authenticate = useCallback(async (sessionToken: string) => {
    localStorage.setItem(TOKEN_KEY, sessionToken);
    setToken(sessionToken);
    setUser(null);
    return loadSession(sessionToken);
  }, [loadSession]);

  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    if (savedToken) {
      void loadSession(savedToken).catch(() => {});
    } else {
      setLoading(false);
    }
    return () => { requestVersion.current++; };
  }, [loadSession]);

  const refreshUser = useCallback(async () => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    if (savedToken) await loadSession(savedToken);
  }, [loadSession]);

  const logout = useCallback(() => {
    requestVersion.current++;
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setError(null);
    setLoading(false);
    navigate("/auth/login", { replace: true });
  }, [navigate]);

  const updateUser = async (updatedUser: User) => {
    const { profile, avatar, username } = updatedUser;
    await authService.updateUser(updatedUser.id!, { avatar, username }, profile);
    await refreshUser();
  };

  return <AuthContext.Provider value={{
    user, isAuthenticated: Boolean(user && token), loading, error,
    authenticate, refreshUser, logout, updateUser, setUser,
  }}>{children}</AuthContext.Provider>;
};

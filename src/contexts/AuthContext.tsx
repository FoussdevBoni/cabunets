import React, { createContext, useState, useEffect } from "react";
import { authService } from "../services/authService";
import useToken from "../hooks/auth/useToken";
import { useNavigate } from "react-router-dom";
import { User } from "../utils/database";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  refreshUser: () => Promise<void>;
  logout: () => void;
  updateUser: (user: User)=>void
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  refreshUser: async () => {},
  logout: () => {},
  updateUser: ()=>{}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
   const navigate = useNavigate()
  const {token , saveToken , deleteToken} = useToken();

  
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
    deleteToken()
    setUser(null);
    navigate("/login")
  };

  const updateUser = async (user: User)=>{
    const {profile , avatar , username } = user
    try {
       await authService.updateUser(token , user.id! , { avatar , username} , profile)
    } catch (error) {
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, error ,  refreshUser, logout , updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

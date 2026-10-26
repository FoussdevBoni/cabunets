// hooks/auth/useToken.ts
import { useState } from 'react';

const TOKEN_KEY = 'token';

export default function useToken() {
  // Initialisation immédiate, pas dans useEffect
  const [token, setTokenState] = useState<any>(() => {
    return localStorage.getItem(TOKEN_KEY);
  });

  const saveToken = (token: any) => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
    setTokenState(token);
  };

  const clearToken = () => {
    localStorage.removeItem(TOKEN_KEY);
    setTokenState(null);
  };

  return {
    token,
    saveToken,
    clearToken,
    isAuthenticated: !!token,
  };
}
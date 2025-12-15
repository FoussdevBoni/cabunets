import React, {  useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from '../ui/Loader';
import { useAuth } from '../../hooks/auth/useAuth';

const RedirectIfAuthenticated: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate(`/${user.role}/dashboard`);
    }
  }, [user, loading, navigate]);

  if (loading) return (
         <Loader />
  );

  return <>{children}</>;
};

export default RedirectIfAuthenticated;

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from '../ui/Loader';
import { useAuth } from '../../hooks/auth/useAuth';

const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
   console.log(user)
    if (!loading && !user) {
     navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading) return (
      <Loader />
  );

  return <>{children}</>;
};

export default RequireAuth;

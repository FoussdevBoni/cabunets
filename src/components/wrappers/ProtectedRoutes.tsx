// src/components/ProtectedRoute.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { ReactNode } from 'react';
import Loader from '../ui/Loader';
import { useAuth } from '../../hooks/auth/useAuth';
import {  User, Vendeur } from '../../utils/database';

type ProtectedRouteProps = {
  children: ReactNode;
  allowedRoles: User['role'][];
};

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user , loading } = useAuth();
  const userRole = user?.role
  const location = useLocation();


  if (loading) return <Loader />;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
 
  

  if (userRole && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
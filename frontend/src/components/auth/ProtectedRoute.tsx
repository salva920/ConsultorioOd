'use client'

import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Login from './Login';
import LoadingSpinner from '../ui/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Verificando autenticación..." />;
  }

  if (!isAuthenticated) {
    // Redirigir al login si no está autenticado
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return <LoadingSpinner message="Redirigiendo al login..." />;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 
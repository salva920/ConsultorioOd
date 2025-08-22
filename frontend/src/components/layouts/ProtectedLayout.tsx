'use client'

import React from 'react';
import Navbar from '../Navbar';
import ProtectedRoute from '../auth/ProtectedRoute';

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

const ProtectedLayout: React.FC<ProtectedLayoutProps> = ({ children }) => {
  return (
    <ProtectedRoute>
      <Navbar />
      {children}
    </ProtectedRoute>
  );
};

export default ProtectedLayout; 
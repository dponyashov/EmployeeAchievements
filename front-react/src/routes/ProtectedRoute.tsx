import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '../app/store';
import './routes.css';

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isInitializing } = useAppSelector((state) => state.auth);
  const location = useLocation();

  if (isInitializing) {
    return (
      <div className="route-init-screen">
        <div className="route-init-content">
          <span className="route-init-icon">🔄</span>
          <span className="route-init-text">ДС: Запуск системы...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (location.pathname === '/') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

import React, { useEffect } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../app/store';

export const ProtectedRoute: React.FC = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/'); // Если залогинен, на окно входа попасть нельзя
    }
  }, [isAuthenticated, navigate]);

  // Если не авторизован — отправляем на логин, иначе рендерим дочерние маршруты
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

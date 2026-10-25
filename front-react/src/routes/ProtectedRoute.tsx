import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '../app/store';

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isInitializing } = useAppSelector((state) => state.auth);
  const location = useLocation();

  // 1. Пока идет тихий рефреш токенов (F5), показываем индикатор загрузки
  if (isInitializing) {
    return (
      <div
        style={{
          display: 'flex',
          height: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f5f5f5',
          fontFamily: 'Arial',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '24px', marginRight: '10px' }}>🔄</span>
          <span style={{ fontWeight: 'bold', color: '#333' }}>ДС: Запуск системы...</span>
        </div>
      </div>
    );
  }

  // 2. Если пользователь НЕ авторизован — отправляем его на форму логина
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Если пользователь зашел на корень "/" — принудительно перенаправляем на рабочий стол
  if (location.pathname === '/') {
    return <Navigate to="/dashboard" replace />;
  }

  // Если всё в порядке, рендерим дочерние абсолютные роуты MainLayout
  return <Outlet />;
};

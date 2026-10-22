// src/routes/router.tsx
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { MainLayout } from '../layouts/MainLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleGuard } from './RoleGuard';
import { ErpDashboard } from '../features/dashboard/ErpDashboard';
import { DirectoryDispatcher } from '../features/directories/DirectoryDispatcher';
import { DirectoryItemDispatcher } from '../features/directories/DirectoryItemDispatcher';

// src/routes/router.tsx
// ... ваши остальные импорты (AuthLayout, MainLayout, ProtectedRoute, RoleGuard, Диспетчеры)

// Компоненты подсистем (добавлен AdminPanel)
const AdminPanel = () => (
  <div className="sub-view" style={{ padding: '20px', background: '#FFF' }}>
    🛠️ Панель администрирования ERP системы. Настройки информационной базы и прав доступа
    пользователей.
  </div>
);
const Reports = () => (
  <div className="sub-view" style={{ padding: '20px', background: '#FFF' }}>
    📊 Отчеты: Оборотно-сальдовая ведомость, Анализ целевых показателей.
  </div>
);
const Tasks = () => (
  <div className="sub-view" style={{ padding: '20px', background: '#FFF' }}>
    ✅ Задачи и бизнес-процессы: Согласование заявок.
  </div>
);

// src/routes/router.tsx
// ... (ваши импорты и заглушки подсистем)

export const erpRouter = createBrowserRouter([
  {
    path: '/login',
    element: <AuthLayout isLoginInit={true} />,
  },
  {
    path: '/register',
    element: <AuthLayout isLoginInit={false} />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <MainLayout />,
        children: [
          // При заходе на корень "/" — перенаправляем на рабочий стол
          {
            index: true,
            element: <Navigate to="/dashboard" replace />,
          },
          // Все дочерние пути теперь делаем АБСОЛЮТНЫМИ (со слэшем в начале) 🌟
          {
            path: '/dashboard',
            element: <ErpDashboard />,
          },
          {
            path: '/admin',
            element: (
              <RoleGuard allowedRoles={['ROLE_ADMIN']}>
                <AdminPanel />
              </RoleGuard>
            ),
          },
          {
            path: '/directories',
            element: (
              <RoleGuard allowedRoles={['ROLE_USER', 'ROLE_ADMIN']}>
                <DirectoryDispatcher />
              </RoleGuard>
            ),
          },
          {
            path: '/directories/:directoryUrl',
            element: (
              <RoleGuard allowedRoles={['ROLE_USER', 'ROLE_ADMIN']}>
                <DirectoryDispatcher />
              </RoleGuard>
            ),
          },
          {
            path: '/directories/:directoryUrl/:id',
            element: (
              <RoleGuard allowedRoles={['ROLE_USER', 'ROLE_ADMIN']}>
                <DirectoryItemDispatcher />
              </RoleGuard>
            ),
          },
          {
            path: '/reports',
            element: (
              <RoleGuard allowedRoles={['ROLE_REPORT', 'ROLE_ADMIN']}>
                <Reports />
              </RoleGuard>
            ),
          },
          {
            path: '/tasks',
            element: (
              <RoleGuard allowedRoles={['ROLE_USER', 'ROLE_ADMIN']}>
                <Tasks />
              </RoleGuard>
            ),
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);

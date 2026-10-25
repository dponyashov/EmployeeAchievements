import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { MainLayout } from '../layouts/MainLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleGuard } from './RoleGuard';
import { ErpDashboard } from '../features/dashboard/ErpDashboard';
import { DirectoryDispatcher } from '../features/directories/DirectoryDispatcher';
import { DirectoryItemDispatcher } from '../features/directories/DirectoryItemDispatcher';
import { AdminUserManagement } from '../features/admin/components/AdminUserManagement';
import { TasksJournal } from '../features/tasks/components/TasksJournal';
import { ReportViewer } from '../features/reports/components/ReportViewer';

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
          {
            index: true,
            element: <Navigate to="/dashboard" replace />,
          },
          {
            path: '/dashboard',
            element: <ErpDashboard />,
          },
          {
            path: '/admin',
            element: (
              <RoleGuard allowedRoles={['ROLE_ADMIN']}>
                <AdminUserManagement />
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
                <ReportViewer />
              </RoleGuard>
            ),
          },
          {
            path: '/tasks',
            element: (
              <RoleGuard allowedRoles={['ROLE_USER', 'ROLE_ADMIN']}>
                <TasksJournal />
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

import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { MainLayout } from '../layouts/MainLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleGuard } from './RoleGuard';
import { ErpDashboard } from '../features/dashboard/ErpDashboard';
import { AdminUserManagement } from '../features/admin/components/AdminUserManagement';
import { NewsHostPage } from '../features/news/NewsHostPage';
import { BookingsPage } from '../features/bookings/components/BookingsPage';
import { EmployeesPage } from '../features/directories/components/profile/EmployeesPage';
import { TestingPage } from '../features/testing/components/TestingPage';
import { AchievementsPage } from '../features/achievements/AchievementsPage';

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
            path: '/news',
            element: (
              <RoleGuard allowedRoles={['ROLE_USER', 'ROLE_NEWSMAKER', 'ROLE_ADMIN']}>
                <NewsHostPage />
              </RoleGuard>
            ),
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
            path: '/bookings',
            element: (
              <RoleGuard allowedRoles={['ROLE_USER', 'ROLE_ADMIN']}>
                <BookingsPage />
              </RoleGuard>
            ),
          },
          {
            path: '/directories/profile',
            element: (
              <RoleGuard allowedRoles={['ROLE_SUPERVISOR', 'ROLE_ADMIN']}>
                <EmployeesPage />
              </RoleGuard>
            ),
          },
          {
            path: 'achievements',
            element: (
              <RoleGuard
                allowedRoles={[
                  'ROLE_USER',
                  'ROLE_SUPERVISOR',
                  'ROLE_DEPARTMENT_ALL',
                  'ROLE_REPORT',
                  'ROLE_ADMIN',
                ]}
              >
                <AchievementsPage />
              </RoleGuard>
            ),
          },
          {
            path: 'tasks',
            element: <Navigate to="/achievements?section=tasks" replace />,
          },
          {
            path: 'reports',
            element: <Navigate to="/achievements?section=reports" replace />,
          },
          {
            path: '/testing',
            element: (
              <RoleGuard
                allowedRoles={[
                  'ROLE_TEST',
                  'ROLE_TEST_CONTROL',
                  'ROLE_TEST_ADMIN',
                  'ROLE_ADMIN',
                ]}
              >
                <TestingPage />
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

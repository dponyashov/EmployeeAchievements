import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { MainLayout } from '../layouts/MainLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleGuard } from './RoleGuard';
import { ErpDashboard } from '../features/dashboard/ErpDashboard';
// Импортируем компонент администрирования
import { AdminUserManagement } from '../features/admin/components/AdminUserManagement';

const Directories = () => (
  <div style={{ background: '#fff', padding: '20px', border: '1px solid #ccc' }}>
    📚 Справочники: Номенклатура, Контрагенты.
  </div>
);
const Reports = () => (
  <div style={{ background: '#fff', padding: '20px', border: '1px solid #ccc' }}>
    📊 Отчеты: Оборотно-сальдовая ведомость.
  </div>
);
const Tasks = () => (
  <div style={{ background: '#fff', padding: '20px', border: '1px solid #ccc' }}>
    ✅ Задачи и бизнес-процессы.
  </div>
);
const Employees = () => (
  <div style={{ background: '#fff', padding: '20px', border: '1px solid #ccc' }}>
    👥 Кадровый учет и расчет зарплаты.
  </div>
);

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<AuthLayout isLoginInit={true} />} />
      <Route path="/register" element={<AuthLayout isLoginInit={false} />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<ErpDashboard />} />

          <Route
            path="admin"
            element={
              <RoleGuard allowedRoles={['ROLE_ADMIN']}>
                <AdminUserManagement />
              </RoleGuard>
            }
          />

          <Route
            path="directories"
            element={
              <RoleGuard allowedRoles={['ROLE_USER', 'ROLE_ADMIN']}>
                <Directories />
              </RoleGuard>
            }
          />

          <Route
            path="reports"
            element={
              <RoleGuard allowedRoles={['ROLE_REPORT', 'ROLE_ADMIN']}>
                <Reports />
              </RoleGuard>
            }
          />

          <Route
            path="tasks"
            element={
              <RoleGuard allowedRoles={['ROLE_USER', 'ROLE_ADMIN']}>
                <Tasks />
              </RoleGuard>
            }
          />

          <Route
            path="employees"
            element={
              <RoleGuard allowedRoles={['ROLE_SUPERVISOR', 'ROLE_ADMIN']}>
                <Employees />
              </RoleGuard>
            }
          />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

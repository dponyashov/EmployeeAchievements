import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { MainLayout } from '../layouts/MainLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleGuard } from './RoleGuard';
import { ErpDashboard } from '../features/dashboard/ErpDashboard';

// Компоненты подсистем (для проверки оберните их в читаемые блоки)
const AdminPanel = () => (
  <div style={{ background: '#fff', padding: '20px', border: '1px solid #ccc' }}>
    🛠️ Панель администрирования ERP системы.
  </div>
);
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
      {/* Публичные окна */}
      <Route path="/login" element={<AuthLayout isLoginInit={true} />} />
      <Route path="/register" element={<AuthLayout isLoginInit={false} />} />

      {/* Защищенный контур ERP */}
      <Route element={<ProtectedRoute />}>
        {/* Главный макет (Шапка, Тело, Подвал) */}
        <Route path="/" element={<MainLayout />}>
          {/* index означает: отображать плитки, если путь ровно "/" */}
          <Route index element={<ErpDashboard />} />

          {/* ВАЖНО: пути дочерних элементов пишутся БЕЗ слэша в начале! */}
          <Route
            path="admin"
            element={
              <RoleGuard allowedRoles={['ROLE_ADMIN']}>
                <AdminPanel />
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
              <RoleGuard allowedRoles={['ROLE_HR', 'ROLE_ADMIN']}>
                <Employees />
              </RoleGuard>
            }
          />
        </Route>
      </Route>

      {/* Перенаправление для любых некорректных URL */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

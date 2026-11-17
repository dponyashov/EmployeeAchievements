import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../app/store';
import './routes.css';

interface RoleGuardProps {
  allowedRoles: string[];
  children: React.ReactElement;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, children }) => {
  const user = useSelector((state: RootState) => state.auth.user);

  const userRoles = user?.roles ? user.roles.map((r) => r.toUpperCase()) : [];
  const requiredRoles = allowedRoles.map((r) => r.toUpperCase());

  const hasAccess = userRoles.some((role) => requiredRoles.includes(role));

  if (!hasAccess) {
    return (
      <div className="role-guard-denied">
        <h3 className="role-guard-title">
          🛑 ДС:Достижения сотрудников — Нарушение прав доступа
        </h3>
        <p className="role-guard-message">
          У текущего пользователя ({user?.name || 'Гость'}) недостаточно прав для
          выполнения операции.
        </p>
        <p className="role-guard-meta">Ваши роли: {userRoles.join(', ') || 'нет'}</p>
        <p className="role-guard-meta--sub">
          Необходимые роли: {requiredRoles.join(', ')}
        </p>
      </div>
    );
  }

  return children;
};

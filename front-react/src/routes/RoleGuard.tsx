import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../app/store';

interface RoleGuardProps {
  allowedRoles: string[];
  children: React.ReactElement;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, children }) => {
  const user = useSelector((state: RootState) => state.auth.user);

  // Приводим все роли к верхнему регистру на случай опечаток в бэкенде
  const userRoles = user?.roles ? user.roles.map((r) => r.toUpperCase()) : [];
  const requiredRoles = allowedRoles.map((r) => r.toUpperCase());

  // // Выводим диагностику в консоль F12 при каждом клике на плитку
  // console.log('--- Проверка прав доступа ERP ---');
  // console.log('Текущий пользователь:', user?.name);
  // console.log('Роли пользователя в Redux:', userRoles);
  // console.log('Требуемые роли для этой плитки:', requiredRoles);

  // Алгоритм проверки пересечения массивов ролей
  const hasAccess = userRoles.some((role) => requiredRoles.includes(role));

  // console.log(
  //   'Результат проверки доступа:',
  //   hasAccess ? 'ДОСТУП РАЗРЕШЕН' : 'ДОСТУП ЗАПРЕЩЕН',
  // );
  // console.log('------------------------------------');

  if (!hasAccess) {
    return (
      <div
        style={{
          padding: '20px',
          background: '#FFF0F0',
          border: '1px solid #FFBBBB',
          margin: '20px',
          fontFamily: 'Segoe UI',
        }}
      >
        <h3 style={{ color: '#CC0000', margin: '0 0 10px 0' }}>
          🛑 ДС:Достижения сотрудников — Нарушение прав доступа
        </h3>
        <p style={{ margin: 0 }}>
          У текущего пользователя ({user?.name || 'Гость'}) недостаточно прав для
          выполнения операции.
        </p>
        <p style={{ fontSize: '12px', color: '#777', marginTop: '10px' }}>
          Ваши роли: {userRoles.join(', ') || 'нет'}
        </p>
        <p style={{ fontSize: '12px', color: '#777' }}>
          Необходимые роли: {requiredRoles.join(', ')}
        </p>
      </div>
    );
  }

  return children;
};

import React, { useState } from 'react';
import {
  useGetAdminUsersQuery,
  useLazyGetUserRolesQuery,
  type User,
} from '../adminAuthApi';
import { AdminUserList } from './AdminUserList';
import { AdminPasswordReset } from './AdminPasswordReset';
import { AdminRoleMatrix } from './AdminRoleMatrix';

export const AdminUserManagement: React.FC = () => {
  const { data: users = [], isLoading: usersLoading } = useGetAdminUsersQuery();
  const [triggerFetchRoles, { isFetching: isUserRolesLoading }] =
    useLazyGetUserRolesQuery();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Всегда берем актуального пользователя из кэша по ссылке/id
  const activeUser = users.find((u) => u.id === selectedUser?.id) || selectedUser;

  const handleUserSelect = async (user: User) => {
    setSelectedUser(user);
    if (user.roles === null) {
      try {
        await triggerFetchRoles(user.id).unwrap();
      } catch (err) {
        console.error('Не удалось загрузить роли пользователя:', err);
      }
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        height: '100%',
        border: '1px solid #ccc',
        background: '#fff',
        fontSize: '13px',
      }}
    >
      {/* ЛЕВАЯ ЧАСТЬ: Список */}
      <AdminUserList
        users={users}
        isLoading={usersLoading}
        activeUserId={activeUser?.id}
        onUserSelect={handleUserSelect}
      />

      {/* ПРАВАЯ ЧАСТЬ: Управление */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {activeUser ? (
          <>
            <div
              style={{
                padding: '8px',
                background: '#f5f5f5',
                borderBottom: '1px solid #ccc',
                fontWeight: 'bold',
              }}
            >
              Текущий пользователь:{' '}
              <span style={{ color: '#2b579a' }}>{activeUser.userName}</span>
            </div>

            {/* ВЕРХ: Смена пароля */}
            <AdminPasswordReset userId={activeUser.id} />

            {/* НИЗ: Матрица ролей */}
            <AdminRoleMatrix
              userId={activeUser.id}
              userRoles={activeUser.roles}
              isUserRolesLoading={isUserRolesLoading}
            />
          </>
        ) : (
          <div
            style={{
              display: 'flex',
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              color: '#888',
              background: '#fafafa',
            }}
          >
            Выберите пользователя для редактирования прав доступа
          </div>
        )}
      </div>
    </div>
  );
};

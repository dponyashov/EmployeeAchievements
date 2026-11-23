import React, { useState } from 'react';
import {
  useGetAdminUsersQuery,
  useLazyGetUserRolesQuery,
  type User,
} from '../adminAuthApi';
import { AdminUserList } from './AdminUserList';
import { AdminPasswordReset } from './AdminPasswordReset';
import { AdminRoleMatrix } from './AdminRoleMatrix';
import '../admin.css';

export const AdminUserManagement: React.FC = () => {
  const appTitle = import.meta.env.VITE_APP_TITLE;
  document.title = `Администрирование — ${appTitle}`;

  const { data: users = [], isLoading: usersLoading } = useGetAdminUsersQuery();
  const [triggerFetchRoles, { isFetching: isUserRolesLoading }] =
    useLazyGetUserRolesQuery();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

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
    <div className="admin-container">
      <AdminUserList
        users={users}
        isLoading={usersLoading}
        activeUserId={activeUser?.id}
        onUserSelect={handleUserSelect}
      />

      <div className="admin-right-pane">
        {activeUser ? (
          <>
            <div className="admin-user-header">
              Текущий пользователь:{' '}
              <span className="admin-user-header-name">{activeUser.userName}</span>
            </div>

            <AdminPasswordReset userId={activeUser.id} />

            <AdminRoleMatrix
              userId={activeUser.id}
              userRoles={activeUser.roles}
              isUserRolesLoading={isUserRolesLoading}
            />
          </>
        ) : (
          <div className="admin-empty-pane">
            Выберите пользователя для редактирования прав доступа
          </div>
        )}
      </div>
    </div>
  );
};

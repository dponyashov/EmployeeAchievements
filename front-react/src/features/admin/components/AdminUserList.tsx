import React, { useState } from 'react';
import { type User } from '../adminAuthApi';
import '../admin.css';

interface AdminUserListProps {
  users: User[];
  isLoading: boolean;
  activeUserId: number | undefined;
  onUserSelect: (user: User) => void;
}

export const AdminUserList: React.FC<AdminUserListProps> = ({
  users,
  isLoading,
  activeUserId,
  onUserSelect,
}) => {
  const [search, setSearch] = useState('');

  const filteredUsers = users.filter((u) =>
    u.userName.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="admin-users-pane">
      <div className="admin-users-header">Пользователи</div>
      <div className="admin-users-search-box">
        <input
          type="text"
          className="admin-users-search-input"
          placeholder="Поиск по имени..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="admin-users-list-scroll">
        {isLoading ? (
          <div className="admin-users-loading">Загрузка...</div>
        ) : (
          <table className="admin-users-table">
            <tbody>
              {filteredUsers.map((user) => {
                const isSelected = activeUserId === user.id;
                return (
                  <tr
                    key={user.id}
                    onClick={() => onUserSelect(user)}
                    className={`admin-user-row ${isSelected ? 'admin-user-row--selected' : ''}`}
                  >
                    <td className="admin-user-cell">
                      👤 {user.userName}{' '}
                      {user.roles === null && (
                        <span className="admin-user-no-roles">(нет прав)</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

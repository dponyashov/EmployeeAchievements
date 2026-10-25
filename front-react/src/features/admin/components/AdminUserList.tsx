import React, { useState } from 'react';
import { type User } from '../adminAuthApi';

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
    <div
      style={{
        width: '300px',
        borderRight: '1px solid #ccc',
        display: 'flex',
        flexDirection: 'column',
        background: '#fcfcfc',
      }}
    >
      <div
        style={{
          padding: '8px',
          background: '#e6e6e6',
          borderBottom: '1px solid #ccc',
          fontWeight: 'bold',
        }}
      >
        Пользователи
      </div>
      <div style={{ padding: '6px', borderBottom: '1px solid #ddd' }}>
        <input
          type="text"
          placeholder="Поиск по имени..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '4px 6px',
            border: '1px solid #bbb',
            boxSizing: 'border-box',
          }}
        />
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {isLoading ? (
          <div style={{ padding: '10px', color: '#666' }}>Загрузка...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {filteredUsers.map((user) => {
                const isSelected = activeUserId === user.id;
                return (
                  <tr
                    key={user.id}
                    onClick={() => onUserSelect(user)}
                    style={{
                      cursor: 'pointer',
                      background: isSelected ? '#ffecb3' : 'transparent',
                      borderBottom: '1px solid #eee',
                    }}
                  >
                    <td
                      style={{
                        padding: '8px',
                        fontWeight: isSelected ? 'bold' : 'normal',
                      }}
                    >
                      👤 {user.userName}{' '}
                      {user.roles === null && (
                        <span style={{ color: '#aaa', fontSize: '11px' }}>
                          (нет прав)
                        </span>
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

import React from 'react';
import {
  type Role,
  useGetAdminRolesQuery,
  useAddUserRoleMutation,
  useDeleteUserRoleMutation,
} from '../adminAuthApi';

interface AdminRoleMatrixProps {
  userId: number;
  userRoles: Role[] | null;
  isUserRolesLoading: boolean;
}

export const AdminRoleMatrix: React.FC<AdminRoleMatrixProps> = ({
  userId,
  userRoles,
  isUserRolesLoading,
}) => {
  const { data: roles = [], isLoading: rolesLoading } = useGetAdminRolesQuery();
  const [addRole] = useAddUserRoleMutation();
  const [deleteRole] = useDeleteUserRoleMutation();

  const handleRoleToggle = async (roleId: number, isAssigned: boolean) => {
    const targetRole = roles.find((r) => r.id === roleId);
    if (!targetRole) return;

    if (isAssigned) {
      await deleteRole({ userId, roleId });
    } else {
      await addRole({ userId, roleId, roleObject: targetRole });
    }
  };

  return (
    <div
      style={{
        flex: 1,
        padding: '15px',
        display: 'flex',
        flexDirection: 'column',
        background: '#fff',
      }}
    >
      <div
        style={{
          fontWeight: 'bold',
          marginBottom: '8px',
          color: '#555',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <span>Роли пользователя</span>
        {isUserRolesLoading && (
          <span style={{ color: '#888', fontWeight: 'normal', fontSize: '12px' }}>
            🔄 Синхронизация прав...
          </span>
        )}
      </div>
      <div style={{ flex: 1, overflowY: 'auto', border: '1px solid #ddd' }}>
        {rolesLoading ? (
          <div style={{ padding: '10px', color: '#666' }}>Загрузка ролей...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr
                style={{
                  background: '#f5f5f5',
                  textAlign: 'left',
                  borderBottom: '1px solid #ccc',
                }}
              >
                <th
                  style={{
                    padding: '6px',
                    border: '1px solid #ddd',
                    width: '40px',
                    textAlign: 'center',
                  }}
                >
                  Доступ
                </th>
                <th style={{ padding: '6px', border: '1px solid #ddd', width: '150px' }}>
                  Роль
                </th>
                <th style={{ padding: '6px', border: '1px solid #ddd' }}>Описание</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => {
                const currentRoles = userRoles || [];
                const isAssigned = currentRoles.some((r) => r.id === role.id);
                return (
                  <tr key={role.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td
                      style={{
                        padding: '6px',
                        border: '1px solid #ddd',
                        textAlign: 'center',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isAssigned}
                        disabled={isUserRolesLoading}
                        onChange={() => handleRoleToggle(role.id, isAssigned)}
                        style={{ cursor: 'pointer' }}
                      />
                    </td>
                    <td
                      style={{
                        padding: '6px',
                        border: '1px solid #ddd',
                        fontWeight: 'bold',
                      }}
                    >
                      {role.name}
                    </td>
                    <td
                      style={{
                        padding: '6px',
                        border: '1px solid #ddd',
                        color: '#666',
                        fontSize: '12px',
                      }}
                    >
                      {role.description}
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

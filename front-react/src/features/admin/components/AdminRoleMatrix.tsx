import React from 'react';
import {
  type Role,
  useGetAdminRolesQuery,
  useAddUserRoleMutation,
  useDeleteUserRoleMutation,
} from '../adminAuthApi';
import '../admin.css';

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
    <div className="admin-roles-section">
      <div className="admin-roles-header">
        <span>Роли пользователя</span>
        {isUserRolesLoading && (
          <span className="admin-roles-sync">🔄 Синхронизация прав...</span>
        )}
      </div>
      <div className="admin-roles-table-wrap">
        {rolesLoading ? (
          <div className="admin-roles-loading">Загрузка ролей...</div>
        ) : (
          <table className="admin-roles-table">
            <thead>
              <tr>
                <th className="col-access">Доступ</th>
                <th className="col-role">Роль</th>
                <th>Описание</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => {
                const currentRoles = userRoles || [];
                const isAssigned = currentRoles.some((r) => r.id === role.id);
                return (
                  <tr key={role.id}>
                    <td className="cell-access">
                      <input
                        type="checkbox"
                        checked={isAssigned}
                        disabled={isUserRolesLoading}
                        onChange={() => handleRoleToggle(role.id, isAssigned)}
                        className="admin-roles-checkbox"
                      />
                    </td>
                    <td className="cell-role-name">{role.name}</td>
                    <td className="cell-role-desc">{role.description}</td>
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

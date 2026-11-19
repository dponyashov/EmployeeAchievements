import React, { useState } from 'react';
import {
  useGetDirectoryDataQuery,
  useDeleteDirectoryItemMutation,
} from '../../directoriesApi';
import { ProfileComponents } from './ProfileComponents';
import '../../directories.css';

export const EmployeesPage: React.FC = () => {
  const { data = [], isLoading, refetch } = useGetDirectoryDataQuery('profile');
  const [deleteItem] = useDeleteDirectoryItemMutation();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="erp-loading-text dir-loading-text">
        Загрузка списка сотрудников...
      </div>
    );
  }

  return (
    <ProfileComponents
      data={data}
      selectedId={selectedId}
      onSelectRow={setSelectedId}
      onDelete={async (id) => {
        if (window.confirm('Удалить сотрудника?')) {
          try {
            await deleteItem({ cleanKey: 'profile', id }).unwrap();
            setSelectedId(null);
          } catch {
            alert('Ошибка удаления. Возможно, сотрудник связан с задачами или бронями.');
          }
        }
      }}
      onRefresh={refetch}
    />
  );
};

import React from 'react';
import { useGetDirectoryDataQuery } from '../../directories/directoriesApi';

interface TileProps {
  onClick: () => void;
}

export const EmployeesTile: React.FC<TileProps> = ({ onClick }) => {
  const { data: profiles, isLoading } = useGetDirectoryDataQuery('profile');

  return (
    <div className="erp-tile" onClick={onClick}>
      <div className="erp-tile-icon">👥</div>
      <div className="erp-tile-title">Сотрудники</div>
      <div className="erp-tile-info">Список сотрудников.</div>
      <div className="erp-tile-counter" style={{ backgroundColor: '#449D44' }}>
        {isLoading ? '...' : `В штате: ${profiles?.length || 0}`}
      </div>
    </div>
  );
};

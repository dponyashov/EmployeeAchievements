// src/features/dashboard/tiles/EmployeesTile.tsx
import React from 'react';
// import { useNavigate } from 'react-router-dom'; // Добавьте импорт навигатора
import { useGetDirectoryDataQuery } from '../../directories/directoriesApi';

interface TileProps {
  onClick: () => void;
}

export const EmployeesTile: React.FC<TileProps> = ({ onClick }) => {
  const { data: profiles, isLoading } = useGetDirectoryDataQuery('profile');
  // const navigate = useNavigate(); // Инициализируем навигатор

  return (
    // При клике уводим пользователя в общую подсистему НСИ на ключ 'profile'
    // <div className="erp-tile" onClick={() => navigate('/directories/profile')}>
    <div className="erp-tile" onClick={onClick}>
      <div className="erp-tile-icon">👥</div>
      <div className="erp-tile-title">Сотрудники и кадры</div>
      <div className="erp-tile-info">
        Штатное расписание, кадровый учет, графики работы и расчет заработной платы
        сотрудников.
      </div>
      <div className="erp-tile-counter" style={{ backgroundColor: '#449D44' }}>
        {isLoading ? '...' : `В штате: ${profiles?.length || 0}`}
      </div>
    </div>
  );
};

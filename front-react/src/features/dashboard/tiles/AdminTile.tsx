import React from 'react';

interface TileProps {
  onClick: () => void;
}

export const AdminTile: React.FC<TileProps> = ({ onClick }) => {
  return (
    <div className="erp-tile" onClick={onClick}>
      <div className="erp-tile-icon">🛠️</div>
      <div className="erp-tile-title">Администрирование</div>
      <div className="erp-tile-info">
        Настройки системы, ведение журнала регистрации, права доступа.
      </div>
      <div className="erp-tile-badge">База: Активна</div>
    </div>
  );
};

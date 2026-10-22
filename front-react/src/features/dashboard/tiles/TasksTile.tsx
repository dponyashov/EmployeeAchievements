import React from 'react';

interface TileProps {
  onClick: () => void;
}

export const TasksTile: React.FC<TileProps> = ({ onClick }) => {
  return (
    <div className="erp-tile" onClick={onClick}>
      <div className="erp-tile-icon">✅</div>
      <div className="erp-tile-title">Мои задачи</div>
      <div className="erp-tile-info">
        Согласование заявок, исполнение поручений и бизнес-процессы.
      </div>
      <div className="erp-tile-counter">Ожидают: 5</div>
    </div>
  );
};

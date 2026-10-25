import React from 'react';

interface TileProps {
  onClick: () => void;
}

export const ReportsTile: React.FC<TileProps> = ({ onClick }) => {
  return (
    <div className="erp-tile" onClick={onClick}>
      <div className="erp-tile-icon">📊</div>
      <div className="erp-tile-title">Отчеты</div>
      <div className="erp-tile-info">Формирование отчетов по критериям.</div>
    </div>
  );
};

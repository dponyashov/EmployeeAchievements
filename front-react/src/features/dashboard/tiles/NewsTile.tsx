import React from 'react';
import { useAppSelector } from '../../../app/store';

interface TileProps {
  onClick: () => void;
}

export const NewsTile: React.FC<TileProps> = ({ onClick }) => {
  const userRoles = useAppSelector((state) => state.auth.user?.roles || []);
  const isNewsmaker = userRoles.includes('ROLE_NEWSMAKER');

  return (
    <div className="erp-tile" onClick={onClick}>
      <div className="erp-tile-icon">📰</div>
      <div className="erp-tile-title">Новости компании</div>
      <div className="erp-tile-info">
        {isNewsmaker
          ? 'Публикация и просмотр корпоративных новостей.'
          : 'Лента событий и объявлений предприятия.'}
      </div>
      {isNewsmaker && <div className="erp-tile-badge">Редактор новостей</div>}
    </div>
  );
};

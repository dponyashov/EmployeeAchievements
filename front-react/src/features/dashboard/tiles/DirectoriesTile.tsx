import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetDirectoriesMetaQuery } from '../../directories/directoriesApi';
import '../dashboard.css';

interface TileProps {
  onClick: () => void;
}

export const DirectoriesTile: React.FC<TileProps> = ({ onClick }) => {
  const { data: meta, isLoading } = useGetDirectoriesMetaQuery();
  const navigate = useNavigate();

  const getCleanKey = (url: string) => {
    return url.replace('/directory/', '').replace('/', '');
  };

  return (
    <div className="erp-tile" onClick={onClick}>
      <div className="erp-tile-icon">📚</div>
      <div className="erp-tile-title">Справочники (НСИ)</div>

      <div className="erp-tile-sublist erp-v8-scrollbar dir-tile-sublist">
        {isLoading && (
          <div className="erp-tile-loading dir-tile-loading">
            Загрузка конфигурации...
          </div>
        )}

        {meta?.map((dir) => {
          const cleanKey = getCleanKey(dir.url);
          return (
            <div
              key={dir.url}
              className="erp-tile-sublink dir-tile-sublink"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/directories/${cleanKey}`);
              }}
            >
              • {dir.name}
            </div>
          );
        })}
      </div>

      <div className="erp-tile-counter dir-tile-counter">
        {isLoading ? '...' : `Всего: ${meta?.length || 0}`}
      </div>
    </div>
  );
};

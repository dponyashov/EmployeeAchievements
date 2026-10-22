import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetDirectoriesMetaQuery } from '../../directories/directoriesApi';

interface TileProps {
  onClick: () => void;
}

export const DirectoriesTile: React.FC<TileProps> = ({ onClick }) => {
  const { data: meta, isLoading } = useGetDirectoriesMetaQuery();
  const navigate = useNavigate();

  // Функция извлечения чистого ключа (из "/directory/service" делает "service")
  const getCleanKey = (url: string) => {
    return url.replace('/directory/', '').replace('/', '');
  };

  return (
    <div className="erp-tile" onClick={onClick}>
      <div className="erp-tile-icon">📚</div>
      <div className="erp-tile-title">Справочники (НСИ)</div>

      <div
        className="erp-tile-sublist erp-v8-scrollbar"
        style={{
          height: '70px',
          overflowY: 'auto',
          paddingRight: '4px',
          marginTop: '8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
        }}
      >
        {isLoading && (
          <div className="erp-tile-loading" style={{ fontSize: '14px' }}>
            Загрузка конфигурации...
          </div>
        )}

        {meta?.map((dir) => {
          const cleanKey = getCleanKey(dir.url);
          return (
            <div
              key={dir.url}
              className="erp-tile-sublink"
              style={{
                fontSize: '14px' /* 🌟 Увеличили размер шрифта с 12px до 14px */,
                lineHeight: '22px' /* 🌟 Задали крупную высоту строки */,
                fontWeight: '500',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
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

      <div className="erp-tile-counter" style={{ backgroundColor: '#0056B3' }}>
        {isLoading ? '...' : `Всего: ${meta?.length || 0}`}
      </div>
    </div>
  );
};

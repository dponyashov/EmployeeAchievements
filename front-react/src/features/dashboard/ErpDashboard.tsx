// // src/features/dashboard/ErpDashboard.tsx
// import React from 'react';
// import { useNavigate } from 'react-router-dom';

// import { AdminTile } from './tiles/AdminTile';
// import { DirectoriesTile } from './tiles/DirectoriesTile';
// import { ReportsTile } from './tiles/ReportsTile';
// import { TasksTile } from './tiles/TasksTile';
// import { EmployeesTile } from './tiles/EmployeesTile';

// export const ErpDashboard: React.FC = () => {
//   const navigate = useNavigate();

//   return (
//     <div className="erp-grid-dashboard">
//       <AdminTile onClick={() => navigate('/admin')} />
//       <DirectoriesTile onClick={() => navigate('/directories')} />
//       <ReportsTile onClick={() => navigate('/reports')} />
//       <TasksTile onClick={() => navigate('/tasks')} />
//       <EmployeesTile onClick={() => navigate('/directories/profile')} />
//     </div>
//   );
// };

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../app/store';
import { erpMenuItems } from '../../routes/menuConfig';

// Импортируем готовые компоненты плиток из структуры вашего проекта
import { DirectoriesTile } from './tiles/DirectoriesTile';
import { EmployeesTile } from './tiles/EmployeesTile';
import { ReportsTile } from './tiles/ReportsTile';
import { TasksTile } from './tiles/TasksTile';
import { AdminTile } from './tiles/AdminTile';

export const ErpDashboard: React.FC = () => {
  const navigate = useNavigate();

  // Получаем роли текущего авторизованного пользователя из Redux
  const { user } = useAppSelector((state) => state.auth);
  const userRoles = user?.roles || [];

  // Карта соответствия путей из menuConfig и реальных React-компонентов плиток
  const tileComponentsMap: Record<string, React.ComponentType> = {
    '/dashboard': () => null,
    '/admin': AdminTile,
    '/directories/profile': EmployeesTile,
    '/directories': DirectoriesTile,
    '/reports': ReportsTile,
    '/tasks': TasksTile,
  };

  // Фильтруем элементы меню на основе ролей пользователя
  const visibleTiles = erpMenuItems.filter((item) => {
    if (!item.allowedRoles || item.allowedRoles.length === 0) return false;
    return item.allowedRoles.some((role) => userRoles.includes(role));
  });

  return (
    <div style={{ padding: '20px', height: '100%', boxSizing: 'border-box' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)', // Сетка плиток 4х3
          gap: '20px',
          autoRows: '180px', // Фиксированная высота 180px по ТЗ
        }}
      >
        {visibleTiles.map((tile) => {
          const Component = tileComponentsMap[tile.path];

          if (!Component) return null;

          return (
            <div
              key={tile.path}
              onClick={() => navigate(tile.path)} // Навигация по клику
              style={{
                display: 'contents', // Игнорирует этот div при расчете сетки и стилей, передавая управление внутреннему компоненту
                cursor: 'pointer',
              }}
            >
              <Component />
            </div>
          );
        })}
      </div>
    </div>
  );
};

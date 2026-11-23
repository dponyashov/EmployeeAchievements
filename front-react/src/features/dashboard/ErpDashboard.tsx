import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../app/store';
import { erpMenuItems } from '../../routes/menuConfig';
import { EmployeesTile } from './tiles/EmployeesTile';
import { AdminTile } from './tiles/AdminTile';
import './dashboard.css';
import { NewsTile } from './tiles/NewsTile';
import { BookingsTile } from './tiles/BookingsTile';
import { TestingTile } from './tiles/TestingTile';
import { AchievementsTile } from './tiles/AchievementsTile';

export const ErpDashboard: React.FC = () => {
  const appTitle = import.meta.env.VITE_APP_TITLE;
  document.title = `Рабочий стол — ${appTitle}`;

  const navigate = useNavigate();

  const { user } = useAppSelector((state) => state.auth);
  const userRoles = user?.roles || [];

  const tileComponentsMap: Record<string, React.ComponentType<any>> = {
    '/dashboard': () => null,
    '/admin': AdminTile,
    '/directories/profile': EmployeesTile,
    '/reports': AchievementsTile, // ReportsTile,
    '/tasks': AchievementsTile, // TasksTile,
    '/achievements': AchievementsTile,
    '/news': NewsTile,
    '/bookings': BookingsTile,
    '/testing': TestingTile,
  };

  const visibleTiles = erpMenuItems.filter((item) => {
    if (!item.allowedRoles || item.allowedRoles.length === 0) return false;
    return item.allowedRoles.some((role) => userRoles.includes(role));
  });

  return (
    <div className="erp-dashboard-container">
      <div className="erp-dashboard-grid">
        {visibleTiles.map((tile) => {
          const Component = tileComponentsMap[tile.path];

          if (!Component) return null;

          return (
            <div key={tile.path} className="erp-dashboard-tile-wrapper">
              <Component onClick={() => navigate(tile.path)} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

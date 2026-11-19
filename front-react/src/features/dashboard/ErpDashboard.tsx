import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../app/store';
import { erpMenuItems } from '../../routes/menuConfig';
import { EmployeesTile } from './tiles/EmployeesTile';
import { ReportsTile } from './tiles/ReportsTile';
import { TasksTile } from './tiles/TasksTile';
import { AdminTile } from './tiles/AdminTile';
import './dashboard.css';
import { NewsTile } from './tiles/NewsTile';
import { BookingsTile } from './tiles/BookingsTile';

export const ErpDashboard: React.FC = () => {
  const navigate = useNavigate();

  const { user } = useAppSelector((state) => state.auth);
  const userRoles = user?.roles || [];

  const tileComponentsMap: Record<string, React.ComponentType<any>> = {
    '/dashboard': () => null,
    '/admin': AdminTile,
    '/directories/profile': EmployeesTile,
    '/reports': ReportsTile,
    '/tasks': TasksTile,
    '/news': NewsTile,
    '/bookings': BookingsTile,
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
            <div
              key={tile.path}
              onClick={() => navigate(tile.path)}
              className="erp-dashboard-tile-wrapper"
            >
              <Component onClick={() => navigate(tile.path)} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

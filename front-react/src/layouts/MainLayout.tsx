import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../app/store';

import { ErpHeader } from '../components/layout/ErpHeader';
import { ErpFooter } from '../components/layout/ErpFooter';
import { erpMenuItems } from '../routes/menuConfig';

import './MainLayout.css';

export const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state: RootState) => state.auth.user);

  const userRoles = user?.roles || [];
  const isHomePage = location.pathname === '/dashboard';

  const allowedSidebarItems = erpMenuItems.filter((item) =>
    item.allowedRoles.some((role) => userRoles.includes(role)),
  );

  return (
    <div className="erp-main-wrapper">
      <ErpHeader isHomePage={isHomePage} />

      <div className="erp-main-body-container">
        <aside className="erp-sidebar-menu">
          {allowedSidebarItems.map((item) => {
            const isActive =
              item.path === '/dashboard'
                ? location.pathname === '/dashboard'
                : item.path === '/directories'
                  ? location.pathname === '/directories'
                  : location.pathname.startsWith(item.path);

            return (
              <div
                key={item.path}
                className={`erp-menu-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  navigate(item.path);
                }}
              >
                <span className="erp-menu-icon">{item.icon}</span>
                <span className="erp-menu-text">{item.title}</span>
              </div>
            );
          })}
        </aside>

        <main className="erp-content-body erp-content-body--fill">
          <Outlet />
        </main>
      </div>

      <ErpFooter />
    </div>
  );
};

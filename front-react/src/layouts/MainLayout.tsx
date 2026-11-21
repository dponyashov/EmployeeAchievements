import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../app/store';

import { ErpHeader } from '../components/layout/ErpHeader';
import { ErpFooter } from '../components/layout/ErpFooter';
import { erpMenuItems } from '../routes/menuConfig';

import './MainLayout.css';

const SIDEBAR_STORAGE_KEY = 'erp_sidebar_collapsed';

export const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userRoles = useAppSelector((state) => state.auth.user?.roles || []);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      } catch {
        // Игнорируем ошибку доступа к localStorage
      }
      return next;
    });
  };

  const isHomePage = location.pathname === '/dashboard';

  const allowedSidebarItems = erpMenuItems.filter((item) =>
    item.allowedRoles.some((role) => userRoles.includes(role)),
  );

  return (
    <div className="erp-main-wrapper">
      <ErpHeader
        isHomePage={isHomePage}
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleSidebar={handleToggleSidebar}
      />

      <div className="erp-main-body-container">
        <aside
          className={`erp-sidebar-menu ${
            isSidebarCollapsed ? 'erp-sidebar-menu--collapsed' : ''
          }`}
        >
          {allowedSidebarItems.map((item) => {
            const isActive =
              item.path === '/dashboard'
                ? location.pathname === '/dashboard'
                : location.pathname.startsWith(item.path);

            return (
              <div
                key={item.path}
                className={`erp-menu-item ${isActive ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
              >
                <span className="erp-menu-icon">{item.icon}</span>
                <span className="erp-menu-text">{item.title}</span>
              </div>
            );
          })}
        </aside>

        <main className="erp-content-body">
          <Outlet />
        </main>
      </div>

      <ErpFooter />
    </div>
  );
};

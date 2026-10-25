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
  // const isHomePage = location.pathname === '/';
  const isHomePage = location.pathname === '/dashboard';

  // Фильтруем боковую панель разделов по ролям
  const allowedSidebarItems = erpMenuItems.filter((item) =>
    item.allowedRoles.some((role) => userRoles.includes(role)),
  );

  return (
    <div className="erp-main-wrapper">
      {/* Шапка системы с верхним выпадающим меню */}
      <ErpHeader isHomePage={isHomePage} />

      {/* Основной двухколоночный контур */}
      <div className="erp-main-body-container">
        {/* Левая вертикальная Панель разделов */}
        <aside className="erp-sidebar-menu">
          {allowedSidebarItems.map((item) => {
            // 🌟 ИСПРАВЛЕННАЯ СТРОГАЯ ЛОГИКА ПОДСВЕТКИ КНОПОК
            // Пункт активен, если текущий URL полностью совпадает с его путем,
            // либо если мы провалились внутрь подразделов directories/ profile/ position
            const isActive =
              item.path === '/dashboard'
                ? location.pathname === '/dashboard'
                : item.path === '/directories'
                  ? location.pathname === '/directories' // Общий список НСИ подсвечивается только на своем корне
                  : location.pathname.startsWith(item.path); // Кадры (/directories/profile), Админка (/admin) подсвечиваются по вхождению

            return (
              <div
                key={item.path}
                className={`erp-menu-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  console.log(`Клик по разделу меню. Переход на: ${item.path}`);
                  navigate(item.path); // Совершаем переход
                }}
              >
                <span className="erp-menu-icon">{item.icon}</span>
                <span className="erp-menu-text">{item.title}</span>
              </div>
            );
          })}
        </aside>

        {/* Правая рабочая зона */}
        <main className="erp-content-body" style={{ flex: 1, background: '#FFF' }}>
          <Outlet />
        </main>
      </div>

      {/* Подвал системы */}
      <ErpFooter />
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../../app/store';
import { logOut } from '../../features/auth/authSlice';
import { erpMenuItems } from '../../routes/menuConfig';

interface ErpHeaderProps {
  isHomePage: boolean;
}

export const ErpHeader: React.FC<ErpHeaderProps> = ({ isHomePage }) => {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const userRoles = user?.roles || [];

  // Фильтруем пункты меню на основе ролей пользователя
  const visibleMenu = erpMenuItems.filter((item) =>
    item.allowedRoles.some((role) => userRoles.includes(role)),
  );

  // Закрытие меню при клике вне его области
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="erp-header" style={{ position: 'relative' }}>
      <div className="erp-header-left" style={{ display: 'flex', alignItems: 'center' }}>
        {/* Кнопка Главного меню функций в стиле  */}
        <button
          className="erp-header-menu-btn"
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          ☰ Меню функций
        </button>

        {dropdownOpen && (
          <div className="erp-dropdown-menu" ref={dropdownRef}>
            {visibleMenu.map((item) => (
              <div
                key={item.path}
                className="erp-menu-item"
                onClick={() => {
                  navigate(item.path);
                  setDropdownOpen(false);
                }}
              >
                <span>{item.icon}</span> {item.title}
              </div>
            ))}
          </div>
        )}

        <div className="erp-logo" style={{ marginLeft: '10px' }}>
          ДС
        </div>
        <span className="erp-project-name" style={{ marginRight: '15px' }}>
          Достижения сотрудников
        </span>

        {/* 🚀 Переиспользован стиль erp-btn-logout для консистентного отображения */}
        {!isHomePage && (
          <button
            className="erp-btn-logout" // Используем тот же класс, что и у кнопки Выход
            onClick={() => navigate('/dashboard')}
            style={{ marginLeft: '5px' }} // Небольшой отступ от названия проекта
          >
            ◀ Рабочий стол
          </button>
        )}
      </div>

      <div className="erp-header-right">
        <span className="erp-username" style={{ fontSize: '13px', marginRight: '10px' }}>
          👤 {user?.name}
        </span>
        <button className="erp-btn-logout" onClick={() => dispatch(logOut())}>
          Выход
        </button>
      </div>
    </header>
  );
};

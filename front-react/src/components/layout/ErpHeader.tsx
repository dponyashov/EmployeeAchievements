import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../../app/store';
import { logOut } from '../../features/auth/authSlice';
import { erpMenuItems } from '../../routes/menuConfig';
import logoUrl from '../../assets/logo.svg';
import { useLogoutMutation } from '../../features/auth/authApi';
import { AdminPasswordReset } from '../../features/admin/components/AdminPasswordReset';
import { MyProfileEditModal } from './MyProfileEditModal';
import './layout.css';
import { createPortal } from 'react-dom';

interface ErpHeaderProps {
  isHomePage: boolean;
}

export const ErpHeader: React.FC<ErpHeaderProps> = ({ isHomePage }) => {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [logout] = useLogoutMutation();

  const appTitle = import.meta.env.VITE_APP_TITLE;

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [userPanelOpen, setUserPanelOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const userPanelRef = useRef<HTMLDivElement>(null);

  const userRoles = user?.roles || [];

  const visibleMenu = erpMenuItems.filter((item) =>
    item.allowedRoles.some((role) => userRoles.includes(role)),
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (userPanelRef.current && !userPanelRef.current.contains(event.target as Node)) {
        setUserPanelOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isPasswordModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsPasswordModalOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPasswordModalOpen]);

  const handleLogout = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await logout({}).unwrap();
      dispatch(logOut());
    } catch (err: any) {
      console.error('Полная структура ошибки:', err);
    }
  };

  return (
    <header className="erp-header erp-header--relative">
      <div className="erp-header-left erp-header-left-group">
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

        <div className="erp-logo erp-header-logo">
          <img src={logoUrl} alt="Logo" />
        </div>

        <span className="erp-project-name erp-header-title">{appTitle}</span>

        {!isHomePage && (
          <button
            className="erp-btn-logout erp-header-home-btn"
            onClick={() => navigate('/dashboard')}
          >
            ◀ Рабочий стол
          </button>
        )}
      </div>

      <div className="erp-header-right erp-header-right-group" ref={userPanelRef}>
        <button
          type="button"
          className="erp-username erp-header-user-btn"
          onClick={() => setUserPanelOpen((prev) => !prev)}
          title="Действия с профилем"
        >
          👤 {user?.name} ▾
        </button>

        {userPanelOpen && (
          <div className="erp-user-popover">
            <div className="erp-user-popover-meta">
              {user?.position || 'Сотрудник'} • {user?.department || 'Без отдела'}
            </div>

            <button
              type="button"
              className="erp-cmd-btn erp-user-popover-btn"
              onClick={() => {
                setUserPanelOpen(false);
                setIsPasswordModalOpen(true);
              }}
            >
              🔑 Изменить пароль
            </button>

            <button
              type="button"
              className="erp-cmd-btn erp-user-popover-btn"
              onClick={() => {
                setUserPanelOpen(false);
                setIsProfileModalOpen(true);
              }}
            >
              ✏️ Редактировать профиль
            </button>
          </div>
        )}

        <button className="erp-btn-logout" onClick={handleLogout}>
          Выход
        </button>
      </div>

      {isPasswordModalOpen &&
        user &&
        createPortal(
          <div
            className="erp-layout-modal-overlay"
            onClick={() => setIsPasswordModalOpen(false)}
          >
            <div className="erp-layout-modal-window" onClick={(e) => e.stopPropagation()}>
              <div className="erp-layout-modal-header">
                <span>Смена пароля пользователя ({user.name})</span>
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="erp-layout-modal-close"
                  title="Закрыть (Esc)"
                >
                  ✕
                </button>
              </div>
              <AdminPasswordReset
                userId={user.id}
                onSuccess={() => setIsPasswordModalOpen(false)}
              />
            </div>
          </div>,
          document.body,
        )}

      {isProfileModalOpen && user && (
        <MyProfileEditModal onClose={() => setIsProfileModalOpen(false)} />
      )}
    </header>
  );
};

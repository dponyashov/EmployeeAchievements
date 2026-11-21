import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../app/store';
import { logOut } from '../../features/auth/authSlice';
import { useLogoutMutation } from '../../features/auth/authApi';
import { AdminPasswordReset } from '../../features/admin/components/AdminPasswordReset';
import { MyProfileEditModal } from './MyProfileEditModal';
import logoUrl from '../../assets/logo.svg';
import './layout.css';

interface ErpHeaderProps {
  isHomePage: boolean;
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

export const ErpHeader: React.FC<ErpHeaderProps> = ({
  isHomePage,
  isSidebarCollapsed,
  onToggleSidebar,
}) => {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [logout] = useLogoutMutation();
  const appTitle = import.meta.env.VITE_APP_TITLE;

  const [userPanelOpen, setUserPanelOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const userPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
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

  const handleLogout = async () => {
    try {
      await logout({}).unwrap();
    } catch (err) {
      console.error('Ошибка при выходе из системы:', err);
    } finally {
      dispatch(logOut());
    }
  };

  const sidebarToggleLabel = isSidebarCollapsed
    ? 'Показать панель разделов'
    : 'Скрыть панель разделов';

  return (
    <header className="erp-header">
      <div className="erp-header-left-group">
        <div className="erp-burger-wrapper">
          <button
            type="button"
            className={`erp-burger-btn ${!isSidebarCollapsed ? 'erp-burger-btn--open' : ''}`}
            onClick={onToggleSidebar}
            title={sidebarToggleLabel}
            aria-label={sidebarToggleLabel}
            aria-expanded={!isSidebarCollapsed}
          >
            <span className="erp-burger-line" />
            <span className="erp-burger-line" />
            <span className="erp-burger-line" />
          </button>
        </div>

        <div className="erp-logo">
          <img src={logoUrl} alt="Logo" />
        </div>

        <span className="erp-project-name erp-header-title">{appTitle}</span>

        {!isHomePage && (
          <button
            type="button"
            className="erp-btn-logout"
            onClick={() => navigate('/dashboard')}
          >
            ◀ Рабочий стол
          </button>
        )}
      </div>

      <div className="erp-header-right-group" ref={userPanelRef}>
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

        <button type="button" className="erp-btn-logout" onClick={handleLogout}>
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

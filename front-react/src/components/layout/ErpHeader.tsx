// src/components/layout/ErpHeader.tsx
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
    <header className="erp-header" style={{ position: 'relative' }}>
      <div className="erp-header-left" style={{ display: 'flex', alignItems: 'center' }}>
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
          <img src={logoUrl} alt="Logo" />
        </div>

        <span className="erp-project-name" style={{ marginRight: '15px' }}>
          {appTitle}
        </span>

        {!isHomePage && (
          <button
            className="erp-btn-logout"
            onClick={() => navigate('/dashboard')}
            style={{ marginLeft: '5px' }}
          >
            ◀ Рабочий стол
          </button>
        )}
      </div>

      <div
        className="erp-header-right"
        style={{ display: 'flex', alignItems: 'center', position: 'relative' }}
        ref={userPanelRef}
      >
        <button
          type="button"
          className="erp-username"
          onClick={() => setUserPanelOpen((prev) => !prev)}
          title="Действия с профилем"
          style={{
            fontSize: '13px',
            marginRight: '10px',
            background: 'transparent',
            border: '1px solid transparent',
            borderRadius: '3px',
            padding: '3px 8px',
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          👤 {user?.name} ▾
        </button>

        {userPanelOpen && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              right: '70px',
              marginTop: '4px',
              backgroundColor: '#FFF',
              border: '1px solid #B5B5B5',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.18)',
              padding: '10px',
              zIndex: 900,
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              minWidth: '210px',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                color: '#777',
                borderBottom: '1px solid #EEE',
                paddingBottom: '4px',
              }}
            >
              {user?.position || 'Сотрудник'} • {user?.department || 'Без отдела'}
            </div>

            <button
              type="button"
              className="erp-cmd-btn"
              style={{ width: '100%', textAlign: 'left', padding: '6px 10px' }}
              onClick={() => {
                setUserPanelOpen(false);
                setIsPasswordModalOpen(true);
              }}
            >
              🔑 Изменить пароль
            </button>

            <button
              type="button"
              className="erp-cmd-btn"
              style={{ width: '100%', textAlign: 'left', padding: '6px 10px' }}
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

      {/* МОДАЛЬНОЕ ОКНО 1: Смена пароля */}
      {isPasswordModalOpen && user && (
        <div style={modalOverlayStyle} onClick={() => setIsPasswordModalOpen(false)}>
          <div style={modalWindowStyle} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <span>Смена пароля пользователя ({user.name})</span>
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(false)}
                style={modalCloseBtnStyle}
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
        </div>
      )}

      {/* МОДАЛЬНОЕ ОКНО 2: Редактирование профиля */}
      {isProfileModalOpen && user && (
        <MyProfileEditModal onClose={() => setIsProfileModalOpen(false)} />
      )}
    </header>
  );
};

const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.45)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const modalWindowStyle: React.CSSProperties = {
  backgroundColor: '#FFF',
  border: '1px solid #999',
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
  width: '440px',
  maxWidth: '95vw',
  overflow: 'hidden',
};

const modalHeaderStyle: React.CSSProperties = {
  backgroundColor: '#FFCC00',
  borderBottom: '1px solid #D4A000',
  padding: '8px 12px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontWeight: 'bold',
  fontSize: '13px',
  color: '#333',
};

const modalCloseBtnStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  fontSize: '14px',
  cursor: 'pointer',
  fontWeight: 'bold',
  color: '#333',
};

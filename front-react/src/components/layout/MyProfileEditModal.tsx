// src/components/layout/MyProfileEditModal.tsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../app/store';
import { useGetCurrentUserProfileQuery } from '../../features/tasks/tasksApi';
import {
  useGetPositionsForSelectQuery,
  useGetDepartmentsForSelectQuery,
  useSaveProfileItemMutation,
} from '../../features/directories/directoriesApi';
import { ProfileCardPane } from '../../features/directories/components/profile/ProfileCardPane';
import { updateUserProfile } from '../../features/auth/authSlice';
import { parseErpError } from '../../utils/parseErpError';

interface MyProfileEditModalProps {
  onClose: () => void;
}

export const MyProfileEditModal: React.FC<MyProfileEditModalProps> = ({ onClose }) => {
  const dispatch = useDispatch();
  const authUser = useSelector((state: RootState) => state.auth.user);
  const userId = authUser?.id;

  // Точечный запрос профиля текущего пользователя: GET /auth/user/{userId}/profile
  const {
    data: currentEmployee,
    isFetching: isLoadingProfile,
    refetch: refetchProfile,
  } = useGetCurrentUserProfileQuery(userId!, {
    skip: !userId,
  });

  const employeeId: number | null = currentEmployee?.id ?? null;

  const { data: positions } = useGetPositionsForSelectQuery();
  const { data: departments } = useGetDepartmentsForSelectQuery();
  const [saveProfile, { isLoading: isSaving }] = useSaveProfileItemMutation();

  const [formEmail, setFormEmail] = useState('');
  const [formFirstName, setFormFirstName] = useState('');
  const [formLastName, setFormLastName] = useState('');
  const [formPositionId, setFormPositionId] = useState('');
  const [formDepartmentId, setFormDepartmentId] = useState('');
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Заполняем форму данными из GET /auth/user/{userId}/profile
  useEffect(() => {
    if (currentEmployee) {
      setFormEmail(currentEmployee.email || '');
      setFormFirstName(currentEmployee.firstName || '');
      setFormLastName(currentEmployee.lastName || '');
      setFormPositionId(currentEmployee.position?.id?.toString() || '');
      setFormDepartmentId(currentEmployee.department?.id?.toString() || '');
    }
  }, [currentEmployee]);

  // Закрытие по клавише Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId) {
      setErrorBanner('Не удалось определить идентификатор сотрудника (employeeId).');
      return;
    }

    setErrorBanner(null);

    const payload = {
      email: formEmail,
      firstName: formFirstName,
      lastName: formLastName,
      positionId: formPositionId ? Number(formPositionId) : null,
      departmentId: formDepartmentId ? Number(formDepartmentId) : null,
    };

    try {
      // Отправляем PATCH /directory/profile/{employeeId}
      await saveProfile({ id: employeeId, data: payload }).unwrap();

      // Обновляем кэш GET /auth/user/{userId}/profile
      refetchProfile();

      const selectedPos = positions?.find((p) => p.id === Number(formPositionId));
      const selectedDept = departments?.find((d) => d.id === Number(formDepartmentId));

      dispatch(
        updateUserProfile({
          firstName: formFirstName,
          lastName: formLastName,
          email: formEmail,
          position: selectedPos?.name ?? '',
          department: selectedDept?.name ?? '',
        }),
      );

      onClose();
    } catch (err) {
      setErrorBanner(parseErpError(err));
    }
  };

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalWindowStyle} onClick={(e) => e.stopPropagation()}>
        <div style={modalHeaderStyle}>
          <span>Редактирование профиля пользователя</span>
          <button
            type="button"
            onClick={onClose}
            style={modalCloseBtnStyle}
            title="Закрыть (Esc)"
          >
            ✕
          </button>
        </div>

        <div style={{ padding: '16px', background: '#F5F5F5' }}>
          {errorBanner && (
            <div
              className="erp-error-banner"
              style={{ marginBottom: '12px', position: 'static' }}
            >
              <span className="erp-error-icon">⚠️</span>
              <div className="erp-error-text">
                <strong>Ошибка:</strong> {errorBanner}
              </div>
            </div>
          )}

          {isLoadingProfile ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
              Загрузка данных профиля...
            </div>
          ) : !employeeId ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#B71C1C' }}>
              Профиль сотрудника для учетной записи <strong>{authUser?.email}</strong> не
              найден.
            </div>
          ) : (
            <div style={{ width: '100%' }}>
              <ProfileCardPane
                editingId={employeeId}
                selectedEmployee={currentEmployee}
                positions={positions}
                departments={departments}
                isSaving={isSaving}
                formLastName={formLastName}
                formFirstName={formFirstName}
                formEmail={formEmail}
                formPositionId={formPositionId}
                formDepartmentId={formDepartmentId}
                onLastNameChange={setFormLastName}
                onFirstNameChange={setFormFirstName}
                onEmailChange={setFormEmail}
                onPositionChange={setFormPositionId}
                onDepartmentChange={setFormDepartmentId}
                onSave={handleSave}
                onCancel={onClose}
                onStartEdit={() => {}}
              />
            </div>
          )}
        </div>
      </div>
    </div>
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
  width: '540px',
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

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
import './layout.css';
import { createPortal } from 'react-dom';

interface MyProfileEditModalProps {
  onClose: () => void;
}

export const MyProfileEditModal: React.FC<MyProfileEditModalProps> = ({ onClose }) => {
  const dispatch = useDispatch();
  const authUser = useSelector((state: RootState) => state.auth.user);
  const userId = authUser?.id;

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
  const [formPhone, setFormPhone] = useState('');
  const [formPositionId, setFormPositionId] = useState('');
  const [formDepartmentId, setFormDepartmentId] = useState('');
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  useEffect(() => {
    if (currentEmployee) {
      setFormEmail(currentEmployee.email || '');
      setFormFirstName(currentEmployee.firstName || '');
      setFormLastName(currentEmployee.lastName || '');
      setFormPhone(currentEmployee.phone || '');
      setFormPositionId(currentEmployee.position?.id?.toString() || '');
      setFormDepartmentId(currentEmployee.department?.id?.toString() || '');
    }
  }, [currentEmployee]);

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
      phone: formPhone,
      positionId: formPositionId ? Number(formPositionId) : null,
      departmentId: formDepartmentId ? Number(formDepartmentId) : null,
    };

    try {
      await saveProfile({ id: employeeId, data: payload }).unwrap();
      refetchProfile();

      const selectedPos = positions?.find((p) => p.id === Number(formPositionId));
      const selectedDept = departments?.find((d) => d.id === Number(formDepartmentId));

      dispatch(
        updateUserProfile({
          firstName: formFirstName,
          lastName: formLastName,
          phone: formPhone,
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

  return createPortal(
    <div className="erp-layout-modal-overlay" onClick={onClose}>
      <div
        className="erp-layout-modal-window erp-layout-modal-window--profile"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="erp-layout-modal-header">
          <span>Редактирование профиля пользователя</span>
          <button
            type="button"
            onClick={onClose}
            className="erp-layout-modal-close"
            title="Закрыть (Esc)"
          >
            ✕
          </button>
        </div>

        <div className="erp-profile-modal-body">
          {errorBanner && (
            <div className="erp-error-banner erp-profile-modal-error">
              <span className="erp-error-icon">⚠️</span>
              <div className="erp-error-text">
                <strong>Ошибка:</strong> {errorBanner}
              </div>
            </div>
          )}

          {isLoadingProfile ? (
            <div className="erp-profile-modal-loading">Загрузка данных профиля...</div>
          ) : !employeeId ? (
            <div className="erp-profile-modal-not-found">
              Профиль сотрудника для учетной записи <strong>{authUser?.email}</strong> не
              найден.
            </div>
          ) : (
            <div className="erp-profile-modal-form-wrap">
              <ProfileCardPane
                editingId={employeeId}
                selectedEmployee={currentEmployee}
                positions={positions}
                departments={departments}
                isSaving={isSaving}
                formLastName={formLastName}
                formFirstName={formFirstName}
                formEmail={formEmail}
                formPhone={formPhone}
                formPositionId={formPositionId}
                formDepartmentId={formDepartmentId}
                onLastNameChange={setFormLastName}
                onFirstNameChange={setFormFirstName}
                onEmailChange={setFormEmail}
                onPhoneChange={setFormPhone}
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
    </div>,
    document.body,
  );
};

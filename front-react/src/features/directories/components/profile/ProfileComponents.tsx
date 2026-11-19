import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../../../../app/store';
import {
  useGetPositionsForSelectQuery,
  useGetDepartmentsForSelectQuery,
  useSaveProfileItemMutation,
} from '../../directoriesApi';
import { parseErpError } from '../../../../utils/parseErpError';
import { ProfileListPane } from './ProfileListPane';
import { ProfileCardPane } from './ProfileCardPane';
import { SimpleDirectoryTab } from '../SimpleDirectoryTab';
import '../../directories.css';
import { useSearchParams } from 'react-router-dom';

interface ProfileListProps {
  data: any[];
  selectedId: number | null;
  onSelectRow: (id: number | null) => void;
  onDelete: (id: number) => void;
  onRefresh: () => void;
}

export const ProfileComponents: React.FC<ProfileListProps> = ({
  data,
  selectedId,
  onSelectRow,
  onDelete,
  onRefresh,
}) => {
  const userRoles = useAppSelector((state) => state.auth.user?.roles || []);
  const canEditDirectories =
    userRoles.includes('ROLE_SERVICE') || userRoles.includes('ROLE_ADMIN');

  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const activeTab: 'employees' | 'departments' | 'positions' =
    tabParam === 'departments' || tabParam === 'positions' ? tabParam : 'employees';

  const handleTabChange = (tab: 'employees' | 'departments' | 'positions') => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (tab === 'employees') {
          next.delete('tab');
        } else {
          next.set('tab', tab);
        }
        return next;
      },
      { replace: true },
    );
  };

  const [searchLastName, setSearchLastName] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [editingId, setEditingId] = useState<number | 'new' | null>(null);

  const [formEmail, setFormEmail] = useState('');
  const [formFirstName, setFormFirstName] = useState('');
  const [formLastName, setFormLastName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formPositionId, setFormPositionId] = useState('');
  const [formDepartmentId, setFormDepartmentId] = useState('');

  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const { data: positions } = useGetPositionsForSelectQuery();
  const { data: departments } = useGetDepartmentsForSelectQuery();
  const [saveProfile, { isLoading: isSaving }] = useSaveProfileItemMutation();

  const normalizeDigits = (val: string) => val.replace(/\D/g, '');

  const filteredData = data.filter((emp) => {
    const matchesLastName = (emp.lastName || '')
      .toLowerCase()
      .includes(searchLastName.toLowerCase());

    if (!searchPhone.trim()) return matchesLastName;

    const rawPhone = (emp.phone || '').toLowerCase();
    const queryLower = searchPhone.trim().toLowerCase();
    const queryDigits = normalizeDigits(searchPhone);

    const matchesPhone =
      rawPhone.includes(queryLower) ||
      (queryDigits.length > 0 && normalizeDigits(emp.phone || '').includes(queryDigits));

    return matchesLastName && matchesPhone;
  });

  const selectedEmployee = data.find((emp) => emp.id === selectedId);

  useEffect(() => {
    if (editingId === 'new') {
      setFormEmail('');
      setFormFirstName('');
      setFormLastName('');
      setFormPhone('');
      setFormPositionId('');
      setFormDepartmentId('');
      return;
    }

    if (selectedEmployee) {
      setFormEmail(selectedEmployee.email || '');
      setFormFirstName(selectedEmployee.firstName || '');
      setFormLastName(selectedEmployee.lastName || '');
      setFormPhone(selectedEmployee.phone || '');
      setFormPositionId(selectedEmployee.position?.id?.toString() || '');
      setFormDepartmentId(selectedEmployee.department?.id?.toString() || '');
    } else {
      setFormEmail('');
      setFormFirstName('');
      setFormLastName('');
      setFormPhone('');
      setFormPositionId('');
      setFormDepartmentId('');
    }
  }, [selectedEmployee, selectedId, editingId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
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
      await saveProfile({ id: editingId!, data: payload }).unwrap();
      alert('Данные сотрудника успешно сохранены.');
      setEditingId(null);
    } catch (err) {
      setErrorBanner(parseErpError(err));
    }
  };

  return (
    <div className="erp-directory-container">
      <div className="erp-directory-header dir-section-header">
        <h2>Сотрудники и кадры</h2>

        <div className="dir-section-tabs">
          <button
            type="button"
            className={`dir-section-tab-btn ${
              activeTab === 'employees' ? 'dir-section-tab-btn--active' : ''
            }`}
            onClick={() => handleTabChange('employees')}
          >
            👥 Сотрудники
          </button>
          <button
            type="button"
            className={`dir-section-tab-btn ${
              activeTab === 'departments' ? 'dir-section-tab-btn--active' : ''
            }`}
            onClick={() => handleTabChange('departments')}
          >
            🏢 Отделы
          </button>
          <button
            type="button"
            className={`dir-section-tab-btn ${
              activeTab === 'positions' ? 'dir-section-tab-btn--active' : ''
            }`}
            onClick={() => handleTabChange('positions')}
          >
            💼 Должности
          </button>
        </div>
      </div>

      {activeTab === 'employees' && (
        <div className="erp-two-pane-container profile-two-pane">
          {errorBanner && (
            <div className="erp-error-banner profile-error-banner">
              <span className="erp-error-icon">⚠️</span>
              <div className="erp-error-text">
                <strong>Ошибка:</strong> {errorBanner}
              </div>
            </div>
          )}

          <ProfileListPane
            filteredData={filteredData}
            selectedId={selectedId}
            searchLastName={searchLastName}
            searchPhone={searchPhone}
            onSearchChange={setSearchLastName}
            onSearchPhoneChange={setSearchPhone}
            onSelectRow={(id) => {
              onSelectRow(id);
              setEditingId(null);
            }}
            onCreateNew={() => {
              setErrorBanner(null);
              onSelectRow(null);
              setEditingId('new');
            }}
            onStartEdit={() => {
              if (selectedId) {
                setErrorBanner(null);
                setEditingId(selectedId);
              } else alert('Выделите строку.');
            }}
            onDelete={() => selectedId && onDelete(selectedId)}
            onRefresh={onRefresh}
          />

          <ProfileCardPane
            editingId={editingId}
            selectedEmployee={selectedEmployee}
            positions={positions}
            departments={departments}
            isSaving={isSaving}
            formLastName={formLastName}
            formFirstName={formFirstName}
            formPhone={formPhone}
            formEmail={formEmail}
            formPositionId={formPositionId}
            formDepartmentId={formDepartmentId}
            onLastNameChange={setFormLastName}
            onFirstNameChange={setFormFirstName}
            onPhoneChange={setFormPhone}
            onEmailChange={setFormEmail}
            onPositionChange={setFormPositionId}
            onDepartmentChange={setFormDepartmentId}
            onSave={handleSave}
            onCancel={() => setEditingId(null)}
            onStartEdit={() => {
              setErrorBanner(null);
              setEditingId(selectedId);
            }}
          />
        </div>
      )}

      {activeTab === 'departments' && (
        <SimpleDirectoryTab
          cleanKey="department"
          title="Структурные подразделения (Отделы)"
          itemLabel="Наименование отдела"
          canEdit={canEditDirectories}
        />
      )}

      {activeTab === 'positions' && (
        <SimpleDirectoryTab
          cleanKey="position"
          title="Должности"
          itemLabel="Наименование должности"
          canEdit={canEditDirectories}
        />
      )}
    </div>
  );
};

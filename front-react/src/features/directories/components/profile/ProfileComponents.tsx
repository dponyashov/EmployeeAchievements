// src/features/directories/components/profile/ProfileComponents.tsx
import React, { useState, useEffect } from 'react';
import {
  useGetPositionsForSelectQuery,
  useGetDepartmentsForSelectQuery,
  useSaveProfileItemMutation,
} from '../../directoriesApi';
import { parseErpError } from '../../../../utils/parseErpError';

// Импортируем вынесенные дочерние панели
import { ProfileListPane } from './ProfileListPane';
import { ProfileCardPane } from './ProfileCardPane';

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
  const [searchLastName, setSearchLastName] = useState('');
  const [editingId, setEditingId] = useState<number | 'new' | null>(null);

  const [formEmail, setFormEmail] = useState('');
  const [formFirstName, setFormFirstName] = useState('');
  const [formLastName, setFormLastName] = useState('');
  const [formPositionId, setFormPositionId] = useState('');
  const [formDepartmentId, setFormDepartmentId] = useState('');
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const { data: positions } = useGetPositionsForSelectQuery();
  const { data: departments } = useGetDepartmentsForSelectQuery();
  const [saveProfile, { isLoading: isSaving }] = useSaveProfileItemMutation();

  const filteredData = data.filter((emp) =>
    (emp.lastName || '').toLowerCase().includes(searchLastName.toLowerCase()),
  );

  const selectedEmployee = data.find((emp) => emp.id === selectedId);

  useEffect(() => {
    if (selectedEmployee) {
      setFormEmail(selectedEmployee.email || '');
      setFormFirstName(selectedEmployee.firstName || '');
      setFormLastName(selectedEmployee.lastName || '');
      setFormPositionId(selectedEmployee.position?.id?.toString() || '');
      setFormDepartmentId(selectedEmployee.department?.id?.toString() || '');
    } else if (editingId !== 'new') {
      setFormEmail('');
      setFormFirstName('');
      setFormLastName('');
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
      <div className="erp-directory-header">
        <h2>Список сотрудников</h2>
      </div>
      <div className="erp-two-pane-container" style={{ height: '100%', width: '100%' }}>
        {errorBanner && (
          <div
            className="erp-error-banner"
            style={{ position: 'absolute', top: '50px', right: '20px', zIndex: 10 }}
          >
            <span className="erp-error-icon">⚠️</span>
            <div className="erp-error-text">
              <strong>Ошибка:</strong> {errorBanner}
            </div>
          </div>
        )}

        {/* Левая панель: Список */}
        <ProfileListPane
          filteredData={filteredData}
          selectedId={selectedId}
          searchLastName={searchLastName}
          onSearchChange={setSearchLastName}
          onSelectRow={(id) => {
            onSelectRow(id);
            if (editingId !== 'new') setEditingId(null);
          }}
          onCreateNew={() => {
            setErrorBanner(null);
            setEditingId('new');
            onSelectRow(null);
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

        {/* Правая панель: Карточка */}
        <ProfileCardPane
          editingId={editingId}
          selectedEmployee={selectedEmployee}
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
          onCancel={() => setEditingId(null)}
          onStartEdit={() => {
            setErrorBanner(null);
            setEditingId(selectedId);
          }}
        />
      </div>
    </div>
  );
};

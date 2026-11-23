import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppSelector } from '../../../../app/store';
import {
  useGetDirectoryDataQuery,
  useDeleteDirectoryItemMutation,
} from '../../directoriesApi';
import { SimpleDirectoryTab } from '../SimpleDirectoryTab';
import { ProfileComponents } from './ProfileComponents';
import '../../../testing/testing.css';

type EmployeesTab = 'employees' | 'departments' | 'positions';

const TAB_TITLES: Record<EmployeesTab, string> = {
  employees: '👥 Сотрудники и кадры',
  departments: '🏢 Справочник отделов',
  positions: '💼 Справочник должностей',
};

export const EmployeesPage: React.FC = () => {
  const appTitle = import.meta.env.VITE_APP_TITLE;

  const [searchParams, setSearchParams] = useSearchParams();
  const user = useAppSelector((state) => state.auth.user);
  const roles = user?.roles || [];

  const canEditDirectories =
    roles.includes('ROLE_ADMIN') || roles.includes('ROLE_SERVICE');

  const rawTab = searchParams.get('tab');

  let activeTab: EmployeesTab = 'employees';
  if (rawTab === 'departments') {
    activeTab = 'departments';
  } else if (rawTab === 'positions') {
    activeTab = 'positions';
  }

  const currentTitle = TAB_TITLES[activeTab];

  useEffect(() => {
    const cleanTitle = currentTitle.replace(/^[^\p{L}\p{N}]+/u, '').trim();
    document.title = `${cleanTitle} — ${appTitle}`;
  }, [currentTitle]);

  const handleSwitchTab = (nextTab: EmployeesTab) => {
    const nextParams = new URLSearchParams();
    nextParams.set('tab', nextTab);
    setSearchParams(nextParams);
  };

  const { data: profiles = [], refetch } = useGetDirectoryDataQuery('profile');
  const [deleteDirectoryItem] = useDeleteDirectoryItemMutation();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Удалить выбранного сотрудника?')) return;
    try {
      await deleteDirectoryItem({ cleanKey: 'profile', id }).unwrap();
      if (selectedId === id) {
        setSelectedId(null);
      }
    } catch {
      alert('Не удалось удалить запись сотрудника.');
    }
  };

  return (
    <div className="testing-page">
      <div className="testing-topbar">
        <div className="testing-topbar-left">
          <h2 className="testing-page-title">{currentTitle}</h2>
        </div>

        <div className="testing-tabs">
          <button
            type="button"
            className={`testing-tab-btn ${
              activeTab === 'employees' ? 'testing-tab-btn--active' : ''
            }`}
            onClick={() => handleSwitchTab('employees')}
          >
            👥 Сотрудники
          </button>

          <button
            type="button"
            className={`testing-tab-btn ${
              activeTab === 'departments' ? 'testing-tab-btn--active' : ''
            }`}
            onClick={() => handleSwitchTab('departments')}
          >
            🏢 Отделы
          </button>

          <button
            type="button"
            className={`testing-tab-btn ${
              activeTab === 'positions' ? 'testing-tab-btn--active' : ''
            }`}
            onClick={() => handleSwitchTab('positions')}
          >
            💼 Должности
          </button>
        </div>
      </div>

      <div className="testing-content erp-v8-scrollbar">
        {activeTab === 'departments' && (
          <SimpleDirectoryTab
            cleanKey="department"
            itemLabel="Наименование отдела"
            title="Справочник отделов"
            canEdit={canEditDirectories}
          />
        )}
        {activeTab === 'positions' && (
          <SimpleDirectoryTab
            cleanKey="position"
            itemLabel="Наименование должности"
            title="Справочник должностей"
            canEdit={canEditDirectories}
          />
        )}
        {activeTab === 'employees' && (
          <ProfileComponents
            data={profiles}
            selectedId={selectedId}
            onSelectRow={setSelectedId}
            onDelete={handleDelete}
            onRefresh={refetch}
          />
        )}
      </div>
    </div>
  );
};

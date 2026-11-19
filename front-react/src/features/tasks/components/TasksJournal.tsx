import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../../../app/store';
import {
  useGetCurrentUserProfileQuery,
  useLazyGetAllEmployeesQuery,
  useLazyGetDepartmentEmployeesQuery,
  type EmployeeProfile,
} from '../tasksApi';
import { TasksEmployeeList } from './TasksEmployeeList';
import { TasksTablePane } from './TasksTablePane';
import { SimpleDirectoryTab } from '../../directories/components/SimpleDirectoryTab';
import '../tasks.css';
import '../../directories/directories.css';
import { useSearchParams } from 'react-router-dom';

export const TasksJournal: React.FC = () => {
  const authUser = useAppSelector((state) => state.auth.user);
  const userRoles = authUser?.roles || [];
  const currentUserId = authUser?.id;

  const isSupervisor = userRoles.includes('ROLE_SUPERVISOR');
  const isMegavisor = userRoles.includes('ROLE_DEPARTMENT_ALL');
  const canEditDirectories =
    userRoles.includes('ROLE_SERVICE') || userRoles.includes('ROLE_ADMIN');

  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const activeTab: 'tasks' | 'services' | 'components' =
    tabParam === 'services' || tabParam === 'components' ? tabParam : 'tasks';

  const handleTabChange = (tab: 'tasks' | 'services' | 'components') => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (tab === 'tasks') {
          next.delete('tab');
        } else {
          next.set('tab', tab);
        }
        return next;
      },
      { replace: true },
    );
  };

  const { data: currentUserProfile } = useGetCurrentUserProfileQuery(currentUserId!, {
    skip: !currentUserId,
  });

  const { data: supervisorProfile } = useGetCurrentUserProfileQuery(currentUserId!, {
    skip: !currentUserId || !isSupervisor,
  });

  const [
    triggerFetchEmployees,
    { data: departmentEmployees = [], isLoading: isEmployeesLoading },
  ] = useLazyGetDepartmentEmployeesQuery();

  const [
    triggerFetchAllEmployees,
    { data: allEmployees = [], isLoading: isAllEmployeesLoading },
  ] = useLazyGetAllEmployeesQuery();

  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeProfile | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    if (isSupervisor && supervisorProfile?.department?.id) {
      triggerFetchEmployees(supervisorProfile.department.id);
    }
  }, [isSupervisor, supervisorProfile, triggerFetchEmployees]);

  useEffect(() => {
    if (isMegavisor) {
      triggerFetchAllEmployees();
    }
  }, [isMegavisor, triggerFetchAllEmployees]);

  useEffect(() => {
    if (isSupervisor && departmentEmployees.length > 0 && !selectedEmployee) {
      setSelectedEmployee(departmentEmployees[0]);
    }
  }, [isSupervisor, departmentEmployees, selectedEmployee]);

  useEffect(() => {
    if (isMegavisor && allEmployees.length > 0 && !selectedEmployee) {
      setSelectedEmployee(allEmployees[0]);
    }
  }, [isMegavisor, allEmployees, selectedEmployee]);

  useEffect(() => {
    if (!isSupervisor && !isMegavisor && currentUserProfile) {
      setSelectedEmployee(currentUserProfile);
    }
  }, [currentUserProfile, isSupervisor, isMegavisor]);

  if (!currentUserId) {
    return <div className="tasks-journal-init">Инициализация сессии...</div>;
  }

  return (
    <div className="erp-directory-container">
      <div className="erp-directory-header dir-section-header">
        <h2>Мои задачи</h2>

        <div className="dir-section-tabs">
          <button
            type="button"
            className={`dir-section-tab-btn ${
              activeTab === 'tasks' ? 'dir-section-tab-btn--active' : ''
            }`}
            onClick={() => handleTabChange('tasks')}
          >
            ✅ Задачи
          </button>
          <button
            type="button"
            className={`dir-section-tab-btn ${
              activeTab === 'services' ? 'dir-section-tab-btn--active' : ''
            }`}
            onClick={() => handleTabChange('services')}
          >
            🛠️ Услуги
          </button>
          <button
            type="button"
            className={`dir-section-tab-btn ${
              activeTab === 'components' ? 'dir-section-tab-btn--active' : ''
            }`}
            onClick={() => handleTabChange('components')}
          >
            🧩 Компоненты
          </button>
        </div>
      </div>

      {activeTab === 'tasks' && (
        <>
          {isSupervisor || isMegavisor ? (
            <div
              className={`tasks-journal ${isFormOpen ? 'tasks-journal--form-open' : ''}`}
            >
              {!isFormOpen && (
                <TasksEmployeeList
                  listTitle={isMegavisor ? 'Все сотрудники' : 'Сотрудники отдела'}
                  employees={isMegavisor ? allEmployees : departmentEmployees}
                  isLoading={isMegavisor ? isAllEmployeesLoading : isEmployeesLoading}
                  selectedEmployeeId={selectedEmployee?.id}
                  onEmployeeSelect={(emp) => setSelectedEmployee(emp)}
                />
              )}

              {selectedEmployee ? (
                <TasksTablePane
                  profileId={selectedEmployee.id}
                  currentUserId={currentUserId}
                  employeeName={`${selectedEmployee.lastName} ${selectedEmployee.firstName}`}
                  onToggleForm={(isOpen) => setIsFormOpen(isOpen)}
                />
              ) : (
                <div className="tasks-journal-empty-pane">
                  Выберите сотрудника из списка для контроля его задач
                </div>
              )}
            </div>
          ) : (
            <div className="tasks-journal">
              <TasksTablePane
                profileId={selectedEmployee?.id || 0}
                currentUserId={currentUserId}
                employeeName={authUser?.name || 'Я'}
                onToggleForm={() => {}}
              />
            </div>
          )}
        </>
      )}

      {activeTab === 'services' && (
        <SimpleDirectoryTab
          cleanKey="service"
          title="Услуги"
          itemLabel="Наименование услуги"
          canEdit={canEditDirectories}
        />
      )}

      {activeTab === 'components' && (
        <SimpleDirectoryTab
          cleanKey="component"
          title="Компоненты услуг"
          itemLabel="Наименование компонента"
          canEdit={canEditDirectories}
        />
      )}
    </div>
  );
};

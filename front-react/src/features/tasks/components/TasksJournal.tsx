import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../../../app/store';
import {
  useGetCurrentUserProfileQuery,
  useLazyGetDepartmentEmployeesQuery,
  type EmployeeProfile,
} from '../tasksApi';
import { TasksEmployeeList } from './TasksEmployeeList';
import { TasksTablePane } from './TasksTablePane';

export const TasksJournal: React.FC = () => {
  const authUser = useAppSelector((state) => state.auth.user);
  const userRoles = authUser?.roles || [];
  const currentUserId = authUser?.id;

  const isSupervisor = userRoles.includes('ROLE_SUPERVISOR');

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

  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeProfile | null>(null);

  // 🚀 Новое состояние: сигнализирует корневому окну, что открыта форма редактирования/создания
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    if (isSupervisor && supervisorProfile?.department?.id) {
      triggerFetchEmployees(supervisorProfile.department.id);
    }
  }, [isSupervisor, supervisorProfile, triggerFetchEmployees]);

  useEffect(() => {
    if (isSupervisor && departmentEmployees.length > 0 && !selectedEmployee) {
      setSelectedEmployee(departmentEmployees[0]);
    }
  }, [isSupervisor, departmentEmployees, selectedEmployee]);

  useEffect(() => {
    console.log(currentUserProfile);

    if (!isSupervisor && currentUserProfile) {
      setSelectedEmployee(currentUserProfile);
    }
  }, [currentUserProfile, isSupervisor]);

  // Сценарий 1: Руководитель подразделения
  if (isSupervisor) {
    return (
      <div
        style={{
          display: 'flex',
          height: '100%',
          border: isFormOpen ? 'none' : '1px solid #ccc',
          background: '#fff',
          fontSize: '13px',
        }}
      >
        {/* 🚀 Условие скрытия: рендерим список сотрудников только если форма создания/изменения НЕ открыта */}
        {!isFormOpen && (
          <TasksEmployeeList
            employees={departmentEmployees}
            isLoading={isEmployeesLoading}
            selectedEmployeeId={selectedEmployee?.id}
            onEmployeeSelect={(emp) => setSelectedEmployee(emp)}
          />
        )}

        {selectedEmployee ? (
          <TasksTablePane
            profileId={selectedEmployee.id}
            currentUserId={currentUserId!}
            employeeName={`${selectedEmployee.lastName} ${selectedEmployee.firstName}`}
            onToggleForm={(isOpen) => setIsFormOpen(isOpen)} // Пробрасываем управление состоянием видимости наружу
          />
        ) : (
          <div
            style={{
              display: 'flex',
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              color: '#888',
              background: '#fafafa',
            }}
          >
            Выберите сотрудника из списка для контроля его задач
          </div>
        )}
      </div>
    );
  }

  // Сценарий 2: Обычный сотрудник (списка сотрудников и так нет)
  if (!currentUserId)
    return <div style={{ padding: '15px' }}>Инициализация сессии...</div>;

  return (
    <div
      style={{
        display: 'flex',
        height: '100%',
        border: '1px solid #ccc',
        background: '#fff',
        fontSize: '13px',
      }}
    >
      <TasksTablePane
        profileId={selectedEmployee?.id || 0}
        currentUserId={currentUserId}
        employeeName={authUser?.name || 'Я'}
        onToggleForm={() => {}} // Для обычного пользователя скрывать нечего
      />
    </div>
  );
};

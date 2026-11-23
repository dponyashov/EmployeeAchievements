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
import '../tasks.css';
import '../../directories/directories.css';

export const TasksJournal: React.FC = () => {
  const authUser = useAppSelector((state) => state.auth.user);
  const userRoles = authUser?.roles || [];
  const currentUserId = authUser?.id;

  const isSupervisor = userRoles.includes('ROLE_SUPERVISOR');
  const isMegavisor = userRoles.includes('ROLE_DEPARTMENT_ALL');

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
      {isSupervisor || isMegavisor ? (
        <div className={`tasks-journal ${isFormOpen ? 'tasks-journal--form-open' : ''}`}>
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
    </div>
  );
};

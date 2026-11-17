import React, { useEffect, useState, useCallback } from 'react';
import { useAppSelector } from '../../../app/store';
import {
  useGetCurrentUserProfileQuery,
  useLazyGetDepartmentEmployeesQuery,
  useLazyGetAllEmployeesQuery,
  useGetTasksByProfileQuery,
  useGetTasksByUserQuery,
} from '../../tasks/tasksApi';

interface TileProps {
  onClick: () => void;
}

// Вспомогательный микро-компонент для безопасного подсчета задач отдельного сотрудника внутри цикла
const EmployeeTaskCounter: React.FC<{
  profileId: number;
  onCountReady: (count: number) => void;
}> = ({ profileId, onCountReady }) => {
  const { data: tasks = [] } = useGetTasksByProfileQuery(profileId);

  useEffect(() => {
    onCountReady(tasks.length);
  }, [tasks.length, onCountReady]);

  return null;
};

export const TasksTile: React.FC<TileProps> = ({ onClick }) => {
  const authUser = useAppSelector((state) => state.auth.user);
  const userRoles = authUser?.roles || [];
  const currentUserId = authUser?.id;

  const isMegavisor = userRoles.includes('ROLE_DEPARTMENT_ALL');
  const isSupervisor = !isMegavisor && userRoles.includes('ROLE_SUPERVISOR');

  // 1. Запрос профиля для руководителя отдела (только если нет ROLE_DEPARTMENT_ALL)
  const { data: supervisorProfile } = useGetCurrentUserProfileQuery(currentUserId!, {
    skip: !currentUserId || !isSupervisor,
  });

  const [triggerFetchDepartmentEmployees, { data: departmentEmployees = [] }] =
    useLazyGetDepartmentEmployeesQuery();

  const [triggerFetchAllEmployees, { data: allEmployees = [] }] =
    useLazyGetAllEmployeesQuery();

  useEffect(() => {
    if (isMegavisor) {
      triggerFetchAllEmployees();
    } else if (isSupervisor && supervisorProfile?.department?.id) {
      triggerFetchDepartmentEmployees(supervisorProfile.department.id);
    }
  }, [
    isMegavisor,
    isSupervisor,
    supervisorProfile,
    triggerFetchAllEmployees,
    triggerFetchDepartmentEmployees,
  ]);

  // 2. Сбор данных для обычного сотрудника
  const { data: ownTasks = [] } = useGetTasksByUserQuery(currentUserId!, {
    skip: !currentUserId || isMegavisor || isSupervisor,
  });

  // 3. Динамическое суммирование задач по списку сотрудников (отдела или всей компании)
  const [employeesTasksMap, setEmployeesTasksMap] = useState<Record<number, number>>({});

  const handleCountReady = useCallback((empId: number, count: number) => {
    setEmployeesTasksMap((prev) => {
      if (prev[empId] === count) return prev;
      return { ...prev, [empId]: count };
    });
  }, []);

  // Определяем список сотрудников для подсчета и подпись плитки
  const targetEmployees = isMegavisor
    ? allEmployees
    : isSupervisor
      ? departmentEmployees
      : [];

  let totalTasksCount = 0;
  if (isMegavisor || isSupervisor) {
    totalTasksCount = targetEmployees.reduce(
      (sum, emp) => sum + (employeesTasksMap[emp.id] ?? 0),
      0,
    );
  } else {
    totalTasksCount = ownTasks.length;
  }

  const tileDescription = isMegavisor
    ? 'Задачи всех сотрудников'
    : isSupervisor
      ? `Задачи сотрудников отдела: ${supervisorProfile?.department?.name || ''}`
      : 'Редактирование списка задач';

  return (
    <div className="erp-tile" onClick={onClick}>
      {(isMegavisor || isSupervisor) &&
        targetEmployees.map((emp) => (
          <EmployeeTaskCounter
            key={emp.id}
            profileId={emp.id}
            onCountReady={(count) => handleCountReady(emp.id, count)}
          />
        ))}

      <div className="erp-tile-icon">✅</div>
      <div className="erp-tile-title">Задачи сотрудников</div>
      <div className="erp-tile-info">{tileDescription}</div>
      <div className="erp-tile-counter">Всего: {totalTasksCount}</div>
    </div>
  );
};

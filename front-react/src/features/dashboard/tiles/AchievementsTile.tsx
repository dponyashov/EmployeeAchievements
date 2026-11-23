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

export const AchievementsTile: React.FC<TileProps> = ({ onClick }) => {
  const authUser = useAppSelector((state) => state.auth.user);
  const userRoles = authUser?.roles || [];
  const currentUserId = authUser?.id;

  const isMegavisor = userRoles.includes('ROLE_DEPARTMENT_ALL');
  const isSupervisor = !isMegavisor && userRoles.includes('ROLE_SUPERVISOR');

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

  const { data: ownTasks = [] } = useGetTasksByUserQuery(currentUserId!, {
    skip: !currentUserId || isMegavisor || isSupervisor,
  });

  const [employeesTasksMap, setEmployeesTasksMap] = useState<Record<number, number>>({});

  const handleCountReady = useCallback((empId: number, count: number) => {
    setEmployeesTasksMap((prev) => {
      if (prev[empId] === count) return prev;
      return { ...prev, [empId]: count };
    });
  }, []);

  const targetEmployees = isMegavisor
    ? allEmployees
    : isSupervisor
      ? departmentEmployees
      : [];

  const totalTasksCount =
    isMegavisor || isSupervisor
      ? targetEmployees.reduce((sum, emp) => sum + (employeesTasksMap[emp.id] ?? 0), 0)
      : ownTasks.length;

  const tileDescription = isMegavisor
    ? 'Задачи и отчеты по всем сотрудникам'
    : isSupervisor
      ? `Отдел: ${supervisorProfile?.department?.name || ''}`
      : 'Учёт задач и аналитическая отчетность';

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
      <div className="erp-tile-counter">Задач: {totalTasksCount}</div>
    </div>
  );
};

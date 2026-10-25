import React, { useEffect } from 'react';
import { useAppSelector } from '../../../app/store';
import {
  useGetCurrentUserProfileQuery,
  useLazyGetDepartmentEmployeesQuery,
  useGetTasksByProfileQuery,
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
  // 1. Получаем ID и роли текущего пользователя из Redux
  const authUser = useAppSelector((state) => state.auth.user);
  const userRoles = authUser?.roles || [];
  const currentUserId = authUser?.id;

  const isSupervisor = userRoles.includes('ROLE_SUPERVISOR');

  // 2. Запрос профиля для руководителя
  const { data: supervisorProfile } = useGetCurrentUserProfileQuery(currentUserId!, {
    skip: !currentUserId || !isSupervisor,
  });

  const [triggerFetchEmployees, { data: departmentEmployees = [] }] =
    useLazyGetDepartmentEmployeesQuery();

  useEffect(() => {
    if (isSupervisor && supervisorProfile?.department?.id) {
      triggerFetchEmployees(supervisorProfile.department.id);
    }
  }, [isSupervisor, supervisorProfile, triggerFetchEmployees]);

  // 3. Сбор данных для обычного сотрудника
  const { data: ownTasks = [] } = useGetTasksByProfileQuery(currentUserId!, {
    skip: !currentUserId || isSupervisor,
  });

  // Локальный стейт для динамического суммирования задач всего отдела у руководителя
  const [departmentTasksMap, setDepartmentTasksMap] = React.useState<
    Record<number, number>
  >({});

  const handleCountReady = React.useCallback((empId: number, count: number) => {
    setDepartmentTasksMap((prev) => {
      if (prev[empId] === count) return prev;
      return { ...prev, [empId]: count };
    });
  }, []);

  // Итоговое число для вывода на плитку
  let totalTasksCount = 0;
  if (isSupervisor) {
    totalTasksCount = Object.values(departmentTasksMap).reduce(
      (sum, current) => sum + current,
      0,
    );
  } else {
    totalTasksCount = ownTasks.length;
  }

  return (
    <div className="erp-tile" onClick={onClick}>
      {/* Фоновые триггеры для подсчета задач каждого сотрудника в отделе руководителя */}
      {isSupervisor &&
        departmentEmployees.map((emp) => (
          <EmployeeTaskCounter
            key={emp.id}
            profileId={emp.id}
            onCountReady={(count) => handleCountReady(emp.id, count)}
          />
        ))}

      <div className="erp-tile-icon">✅</div>
      <div className="erp-tile-title">Задачи сотрудников</div>
      <div className="erp-tile-info">
        {isSupervisor
          ? `Задачи сотрудников отдела: ${supervisorProfile?.department?.name || ''}`
          : 'Редактирование списка задач'}
      </div>
      <div className="erp-tile-counter">Всего: {totalTasksCount}</div>
    </div>
  );
};

import React, { useState } from 'react';
import { type EmployeeProfile } from '../tasksApi';
import '../tasks.css';

interface TasksEmployeeListProps {
  listTitle: string;
  employees: EmployeeProfile[];
  isLoading: boolean;
  selectedEmployeeId: number | undefined;
  onEmployeeSelect: (emp: EmployeeProfile) => void;
}

export const TasksEmployeeList: React.FC<TasksEmployeeListProps> = ({
  listTitle,
  employees,
  isLoading,
  selectedEmployeeId,
  onEmployeeSelect,
}) => {
  const [search, setSearch] = useState('');

  const filteredEmployees = employees.filter((emp) => {
    const fullName = `${emp.lastName} ${emp.firstName}`.toLowerCase();
    return fullName.includes(search.toLowerCase());
  });

  return (
    <div className="tasks-emp-pane">
      <div className="tasks-emp-header">{listTitle}</div>
      <div className="tasks-emp-search-box">
        <input
          type="text"
          className="tasks-emp-search-input"
          placeholder="Поиск по имени/фамилии..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="tasks-emp-list-scroll">
        {isLoading ? (
          <div className="tasks-emp-loading">Загрузка сотрудников...</div>
        ) : (
          <table className="tasks-emp-table">
            <tbody>
              {filteredEmployees.map((emp) => {
                const isSelected = selectedEmployeeId === emp.id;
                return (
                  <tr
                    key={emp.id}
                    onClick={() => onEmployeeSelect(emp)}
                    className={`tasks-emp-row ${isSelected ? 'tasks-emp-row--selected' : ''}`}
                  >
                    <td className="tasks-emp-cell">
                      <div className="tasks-emp-name">
                        👤 {emp.lastName} {emp.firstName}
                      </div>
                      <div className="tasks-emp-position">
                        {emp.position?.name || 'Должность не указана'}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

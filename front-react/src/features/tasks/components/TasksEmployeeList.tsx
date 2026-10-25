import React, { useState } from 'react';
import { type EmployeeProfile } from '../tasksApi';

interface TasksEmployeeListProps {
  employees: EmployeeProfile[];
  isLoading: boolean;
  selectedEmployeeId: number | undefined;
  onEmployeeSelect: (emp: EmployeeProfile) => void;
}

export const TasksEmployeeList: React.FC<TasksEmployeeListProps> = ({
  employees,
  isLoading,
  selectedEmployeeId,
  onEmployeeSelect,
}) => {
  const [search, setSearch] = useState('');

  // Сквозной поиск по имени или фамилии в одном поле ввода
  const filteredEmployees = employees.filter((emp) => {
    const fullName = `${emp.lastName} ${emp.firstName}`.toLowerCase();
    return fullName.includes(search.toLowerCase());
  });

  return (
    <div
      style={{
        width: '300px',
        borderRight: '1px solid #ccc',
        display: 'flex',
        flexDirection: 'column',
        background: '#fcfcfc',
      }}
    >
      <div
        style={{
          padding: '8px',
          background: '#e6e6e6',
          borderBottom: '1px solid #ccc',
          fontWeight: 'bold',
        }}
      >
        Сотрудники отдела
      </div>
      <div style={{ padding: '6px', borderBottom: '1px solid #ddd' }}>
        <input
          type="text"
          placeholder="Поиск по имени/фамилии..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '4px 6px',
            border: '1px solid #bbb',
            boxSizing: 'border-box',
          }}
        />
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {isLoading ? (
          <div style={{ padding: '10px', color: '#666' }}>Загрузка сотрудников...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {filteredEmployees.map((emp) => {
                const isSelected = selectedEmployeeId === emp.id;
                return (
                  <tr
                    key={emp.id}
                    onClick={() => onEmployeeSelect(emp)}
                    style={{
                      cursor: 'pointer',
                      background: isSelected ? '#ffecb3' : 'transparent',
                      borderBottom: '1px solid #eee',
                    }}
                  >
                    <td style={{ padding: '8px' }}>
                      <div style={{ fontWeight: isSelected ? 'bold' : 'normal' }}>
                        👤 {emp.lastName} {emp.firstName}
                      </div>
                      <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
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

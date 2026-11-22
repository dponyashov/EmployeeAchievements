import React, { useState } from 'react';
import type { TestEmployeeControlRow } from '../../testingApi';

interface TestEmployeesTableCardProps {
  employees: TestEmployeeControlRow[];
  selectedProfileId: number | null;
  onSelectEmployee: (profileId: number) => void;
}

export const TestEmployeesTableCard: React.FC<TestEmployeesTableCardProps> = ({
  employees,
  selectedProfileId,
  onSelectEmployee,
}) => {
  const [search, setSearch] = useState('');

  const filtered = employees.filter((emp) =>
    emp.fullName.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="sub-view">
      <div className="dir-section-header">
        <strong>Сотрудники ({employees.length})</strong>
      </div>

      <input
        type="text"
        className="erp-search-input-field"
        placeholder="Поиск по ФИО..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="testing-emp-scroll-wrap erp-v8-scrollbar">
        <table className="erp-v8-table">
          <thead>
            <tr>
              <th>ФИО сотрудника</th>
              <th className="dir-col-code-md">Балл</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((emp) => (
              <tr
                key={emp.profileId}
                onClick={() => onSelectEmployee(emp.profileId)}
                className={selectedProfileId === emp.profileId ? 'erp-row-selected' : ''}
              >
                <td className="testing-qstat-question-cell">
                  <div className="font-medium">{emp.fullName}</div>
                  <div className="tasks-emp-position">
                    Попыток: {emp.attemptsCount}
                    {emp.unusedExtraGrantsCount > 0 && ' • Доп. открыта'}
                  </div>
                </td>
                <td className="text-center font-medium">{emp.bestScorePercent}%</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={2} className="erp-empty-table">
                  Сотрудники не найдены.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

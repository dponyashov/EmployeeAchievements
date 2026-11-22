import React from 'react';
import type { TestSummaryItem } from '../../testingApi';

interface TestControlSidebarProps {
  tests: TestSummaryItem[];
  selectedTestId: number | null;
  onSelectTest: (testId: number) => void;
}

export const TestControlSidebar: React.FC<TestControlSidebarProps> = ({
  tests,
  selectedTestId,
  onSelectTest,
}) => {
  return (
    <aside className="testing-control-left">
      <div className="admin-users-header">Тесты раздела</div>
      <div className="admin-users-list-scroll erp-v8-scrollbar">
        <table className="admin-users-table">
          <tbody>
            {tests.map((test) => (
              <tr
                key={test.id}
                onClick={() => onSelectTest(test.id)}
                className={`admin-user-row ${
                  selectedTestId === test.id ? 'admin-user-row--selected' : ''
                }`}
              >
                <td className="admin-user-cell">
                  <div>{test.title}</div>
                  <div className="tasks-emp-position">
                    Вопросов: {test.questionsLimit} •{' '}
                    {test.hasTimeLimit ? `${test.timeLimitMinutes} мин.` : 'Без таймера'}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </aside>
  );
};

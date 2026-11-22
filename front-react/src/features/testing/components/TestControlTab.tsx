import React, { useState, useEffect } from 'react';
import { useGetTestsBySectionQuery, useGetTestControlOverviewQuery } from '../testingApi';
import { ErpErrorBanner } from '../../../components/ui/ErpErrorBanner';
import { TestControlSidebar } from './control/TestControlSidebar';
import { TestQuestionStatsCard } from './control/TestQuestionStatsCard';
import { TestEmployeesTableCard } from './control/TestEmployeesTableCard';
import { TestEmployeeAttemptsCard } from './control/TestEmployeeAttemptsCard';

interface TestControlTabProps {
  sectionId: number;
}

export const TestControlTab: React.FC<TestControlTabProps> = ({ sectionId }) => {
  const { data: tests, isLoading: isTestsLoading } = useGetTestsBySectionQuery(sectionId);

  const [selectedTestId, setSelectedTestId] = useState<number | null>(null);
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null);
  const [controlSubTab, setControlSubTab] = useState<'employees' | 'questions'>(
    'employees',
  );
  const [error, setError] = useState<unknown>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const firstTest = tests?.at(0);
    if (firstTest && selectedTestId === null) {
      setSelectedTestId(firstTest.id);
    }
  }, [tests, selectedTestId]);

  const { data: overview, isFetching: isOverviewLoading } =
    useGetTestControlOverviewQuery(selectedTestId ?? 0, {
      skip: selectedTestId === null,
    });

  const handleSelectTest = (testId: number) => {
    setSelectedTestId(testId);
    setSelectedProfileId(null);
    setError(null);
    setSuccessMsg(null);
  };

  if (isTestsLoading) {
    return <div>Загрузка списка тестов...</div>;
  }

  if (!tests || tests.length === 0) {
    return <div className="sub-view">В данном разделе пока нет тестов для контроля.</div>;
  }

  const selectedEmployeeName =
    overview?.employees.find((e) => e.profileId === selectedProfileId)?.fullName || '';

  return (
    <div className="testing-control-layout">
      <TestControlSidebar
        tests={tests}
        selectedTestId={selectedTestId}
        onSelectTest={handleSelectTest}
      />

      <div className="testing-control-right erp-v8-scrollbar">
        {Boolean(error) && <ErpErrorBanner error={error} />}

        {successMsg && (
          <div className="testing-badge testing-badge--success">✔ {successMsg}</div>
        )}

        {isOverviewLoading || !overview ? (
          <div>Загрузка статистики тестирования...</div>
        ) : (
          <>
            <div className="testing-stats-cards">
              <div className="testing-stat-box">
                <div>Прошли сотрудников</div>
                <div className="testing-stat-value">{overview.totalParticipants}</div>
              </div>
              <div className="testing-stat-box">
                <div>Завершённых попыток</div>
                <div className="testing-stat-value">
                  {overview.completedAttemptsTotal}
                </div>
              </div>
              <div className="testing-stat-box">
                <div>Средний балл по тесту</div>
                <div className="testing-stat-value">{overview.averageScorePercent}%</div>
              </div>
            </div>

            <div>
              <div className="testing-tabs">
                <button
                  type="button"
                  className={`testing-tab-btn ${
                    controlSubTab === 'employees' ? 'testing-tab-btn--active' : ''
                  }`}
                  onClick={() => setControlSubTab('employees')}
                >
                  👥 Сотрудники, проходившие тест ({overview.employees.length})
                </button>
                <button
                  type="button"
                  className={`testing-tab-btn ${
                    controlSubTab === 'questions' ? 'testing-tab-btn--active' : ''
                  }`}
                  onClick={() => setControlSubTab('questions')}
                >
                  📈 Статистика ответов по вопросам ({overview.questionStats?.length || 0}
                  )
                </button>
              </div>
            </div>

            {controlSubTab === 'questions' ? (
              <div className="testing-control-tab-fill">
                <TestQuestionStatsCard questionStats={overview.questionStats || []} />
              </div>
            ) : (
              <div className="testing-control-employees-pane">
                <div className="testing-control-employees-left">
                  <TestEmployeesTableCard
                    employees={overview.employees}
                    selectedProfileId={selectedProfileId}
                    onSelectEmployee={(profileId) => {
                      setSelectedProfileId(profileId);
                      setSuccessMsg(null);
                      setError(null);
                    }}
                  />
                </div>

                <div className="testing-control-employees-right erp-v8-scrollbar">
                  {selectedTestId !== null && selectedProfileId !== null ? (
                    <TestEmployeeAttemptsCard
                      testId={selectedTestId}
                      profileId={selectedProfileId}
                      employeeName={selectedEmployeeName}
                      onSuccess={(msg) => setSuccessMsg(msg)}
                      onError={(err) => setError(err)}
                    />
                  ) : (
                    <div className="sub-view">
                      Выберите сотрудника в списке слева, чтобы просмотреть его попытки,
                      детализацию ответов, выгрузить протокол или сформировать справку.
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

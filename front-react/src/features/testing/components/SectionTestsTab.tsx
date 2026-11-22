import React, { useState } from 'react';
import {
  useGetTestsBySectionQuery,
  useStartTestAttemptMutation,
  type TestAttemptSession,
} from '../testingApi';
import { ErpErrorBanner } from '../../../components/ui/ErpErrorBanner';

interface SectionTestsTabProps {
  sectionId: number;
  isAdmin: boolean;
  onStartSession: (session: TestAttemptSession) => void;
}

export const SectionTestsTab: React.FC<SectionTestsTabProps> = ({
  sectionId,
  isAdmin,
  onStartSession,
}) => {
  const { data: tests, isLoading } = useGetTestsBySectionQuery(sectionId);
  const [startAttempt, { isLoading: isStarting }] = useStartTestAttemptMutation();
  const [error, setError] = useState<unknown>(null);

  const handleStart = async (testId: number) => {
    try {
      setError(null);
      const session = await startAttempt(testId).unwrap();
      onStartSession(session);
    } catch (err) {
      setError(err);
    }
  };

  if (isLoading) {
    return <div className="testing-feed-wrap">Загрузка списка тестов...</div>;
  }

  return (
    <div className="testing-feed-wrap">
      {Boolean(error) && <ErpErrorBanner error={error} />}

      {(!tests || tests.length === 0) && (
        <div className="sub-view">
          В данном разделе пока нет доступных тестов.
          {isAdmin &&
            ' Перейдите на вкладку «Редактирование тестов», чтобы создать тест.'}
        </div>
      )}

      {tests?.map((test) => (
        <div
          key={test.id}
          className={`testing-section-card ${
            test.isHidden ? 'testing-section-card--inactive' : ''
          }`}
          onClick={() => {
            if (test.canStartNow && !isStarting) {
              handleStart(test.id);
            }
          }}
        >
          <div>
            <div className="testing-section-title">{test.title}</div>
            {test.description && (
              <div className="testing-section-desc">{test.description}</div>
            )}

            <div className="testing-test-badges">
              <span className="testing-badge">
                Вопросов: <strong>{test.questionsLimit}</strong> (в банке:{' '}
                {test.bankQuestionsCount})
              </span>

              <span className="testing-badge">
                Время:{' '}
                <strong>
                  {test.hasTimeLimit
                    ? `${test.timeLimitMinutes} мин.`
                    : 'Без ограничения'}
                </strong>
              </span>

              <span className="testing-badge">
                Попыток: <strong>{test.userAttemptsCount}</strong>
              </span>

              {test.lastScorePercent !== null && test.lastScorePercent !== undefined && (
                <span className="testing-badge testing-badge--success">
                  Результат: <strong>{test.lastScorePercent}%</strong>
                </span>
              )}

              {test.isHidden && (
                <span className="testing-badge testing-badge--warn">
                  Скрыт от сотрудников
                </span>
              )}
            </div>
          </div>

          <div className="testing-section-meta" onClick={(e) => e.stopPropagation()}>
            {test.canStartNow ? (
              <button
                type="button"
                className="bookings-create-btn"
                disabled={isStarting}
                onClick={() => handleStart(test.id)}
              >
                {test.hasInProgressAttempt
                  ? '▶ Продолжить тест'
                  : test.userAttemptsCount > 0
                    ? '🔄 Пройти повторно'
                    : '▶ Начать тест'}
              </button>
            ) : (
              <span className="testing-badge testing-badge--danger">
                {test.bankQuestionsCount === 0 ? 'Нет вопросов' : 'Доступ закрыт'}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

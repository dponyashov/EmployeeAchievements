import React from 'react';
import type { TestQuestionStat } from '../../testingApi';

interface TestQuestionStatsCardProps {
  questionStats: TestQuestionStat[];
}

export const TestQuestionStatsCard: React.FC<TestQuestionStatsCardProps> = ({
  questionStats,
}) => {
  return (
    <div className="sub-view">
      <div className="dir-section-header">
        <strong>
          Статистика правильных ответов по вопросам ({questionStats.length})
        </strong>
      </div>

      <div className="testing-qstat-scroll-wrap erp-v8-scrollbar">
        <table className="erp-v8-table">
          <thead>
            <tr>
              <th className="dir-col-code-sm">№</th>
              <th>Текст вопроса</th>
              <th className="dir-col-code-md">Задан раз</th>
              <th className="dir-col-code-md">Верно</th>
              <th className="profile-col-email">Частота правильных ответов</th>
            </tr>
          </thead>
          <tbody>
            {questionStats.map((qs, idx) => {
              const barModifier =
                qs.timesAsked === 0
                  ? ''
                  : qs.correctPercent < 40
                    ? 'testing-qstat-bar-fill--danger'
                    : qs.correctPercent < 75
                      ? 'testing-qstat-bar-fill--warn'
                      : '';

              return (
                <tr key={qs.questionId}>
                  <td className="text-center">{idx + 1}</td>
                  <td className="testing-qstat-question-cell">{qs.questionText}</td>
                  <td className="text-center">{qs.timesAsked}</td>
                  <td className="text-center">
                    {qs.correctAnswersCount} из {qs.timesAsked}
                  </td>
                  <td>
                    {qs.timesAsked === 0 ? (
                      <span className="dir-item-form-label">Нет завершённых попыток</span>
                    ) : (
                      <div className="testing-qstat-bar-wrap">
                        <div className="testing-qstat-bar-bg">
                          <div
                            className={`testing-qstat-bar-fill ${barModifier}`}
                            style={{ width: `${qs.correctPercent}%` }}
                          />
                        </div>
                        <strong>{qs.correctPercent}%</strong>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            {questionStats.length === 0 && (
              <tr>
                <td colSpan={5} className="erp-empty-table">
                  В тесте пока нет вопросов.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

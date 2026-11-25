import React, { useState, useEffect } from 'react';
import {
  useDeleteTestAttemptMutation,
  useGetEmployeeProtocolsQuery,
  useGrantExtraAttemptMutation,
  type AttemptProtocol,
} from '../../testingApi';
import {
  exportAttemptProtocolToExcel,
  exportAttemptCertificateToPdf,
} from '../../utils/exportTestingFiles';

interface TestEmployeeAttemptsCardProps {
  testId: number;
  profileId: number;
  employeeName: string;
  onSuccess: (message: string) => void;
  onError: (err: unknown) => void;
}

const formatDateTime = (iso?: string | null) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString('ru-RU');
};

const statusText = (status: string) => {
  if (status === 'COMPLETED') return 'Завершён';
  if (status === 'EXPIRED') return 'Время истекло';
  return 'В процессе';
};

export const TestEmployeeAttemptsCard: React.FC<TestEmployeeAttemptsCardProps> = ({
  testId,
  profileId,
  employeeName,
  onSuccess,
  onError,
}) => {
  const { data: protocols, isFetching: isProtocolsLoading } =
    useGetEmployeeProtocolsQuery({ testId, profileId });

  const [grantExtraAttempt, { isLoading: isGranting }] = useGrantExtraAttemptMutation();

  const [selectedAttemptId, setSelectedAttemptId] = useState<number | null>(null);

  const [deleteAttempt, { isLoading: isDeleting }] = useDeleteTestAttemptMutation();

  useEffect(() => {
    const lastProtocol = protocols?.at(-1);
    setSelectedAttemptId(lastProtocol ? lastProtocol.attemptId : null);
  }, [protocols]);

  const handleDeleteAttempt = async (attemptId: number, attemptNumber: number) => {
    if (
      !window.confirm(`Удалить попытку №${attemptNumber} и все её ответы из журнала?`)
    ) {
      return;
    }
    try {
      await deleteAttempt(attemptId).unwrap();
    } catch {
      alert('Не удалось удалить попытку тестирования.');
    }
  };

  const handleGrantAttempt = async () => {
    try {
      onError(null);
      await grantExtraAttempt({ testId, profileId }).unwrap();
      onSuccess('Сотруднику открыта дополнительная попытка тестирования.');
    } catch (err) {
      onError(err);
    }
  };

  const selectedProtocol: AttemptProtocol | null =
    protocols?.find((p) => Number(p.attemptId) === Number(selectedAttemptId)) ??
    protocols?.at(-1) ??
    null;

  return (
    <div className="sub-view testing-attempts-card-root">
      <div className="dir-section-header">
        <strong>Попытки сотрудника: {employeeName}</strong>

        <div className="bookings-toolbar-right">
          <button
            type="button"
            className="bookings-create-btn"
            disabled={isGranting}
            onClick={handleGrantAttempt}
          >
            ➕ Открыть повторную попытку
          </button>

          {selectedProtocol && (
            <>
              <button
                type="button"
                className="erp-cmd-btn"
                onClick={() => exportAttemptProtocolToExcel(selectedProtocol)}
              >
                📥 Выгрузить протокол (Excel)
              </button>
              <button
                type="button"
                className="erp-cmd-btn"
                onClick={() => exportAttemptCertificateToPdf(selectedProtocol)}
              >
                📄 Сформировать справку (PDF)
              </button>
              <button
                type="button"
                className="erp-cmd-btn erp-cmd-btn--danger"
                disabled={isDeleting}
                onClick={() =>
                  handleDeleteAttempt(
                    selectedProtocol.attemptId,
                    selectedProtocol.attemptNumber,
                  )
                }
                title="Удалить попытку из журнала и статистики"
              >
                🗑️ Удалить
              </button>
            </>
          )}
        </div>
      </div>

      {isProtocolsLoading ? (
        <div>Загрузка попыток...</div>
      ) : (
        <div className="testing-attempts-scroll-wrap erp-v8-scrollbar">
          <table className="erp-v8-table">
            <thead>
              <tr>
                <th className="dir-col-code-sm">№</th>
                <th>Статус</th>
                <th>Начало</th>
                <th>Завершение</th>
                <th className="dir-col-code-md">Ответов</th>
                <th className="dir-col-code-md">Верно</th>
                <th className="dir-col-code-md">Результат</th>
              </tr>
            </thead>
            <tbody>
              {protocols?.map((prot) => (
                <tr
                  key={prot.attemptId}
                  onClick={() => setSelectedAttemptId(prot.attemptId)}
                  className={
                    selectedAttemptId === prot.attemptId ? 'erp-row-selected' : ''
                  }
                >
                  <td className="text-center">Попытка №{prot.attemptNumber}</td>
                  <td>{statusText(prot.status)}</td>
                  <td>{formatDateTime(prot.startedAt)}</td>
                  <td>{formatDateTime(prot.finishedAt)}</td>
                  <td className="text-center">
                    {prot.answeredQuestions} из {prot.totalQuestions}
                  </td>
                  <td className="text-center">
                    {prot.correctAnswers} из {prot.totalQuestions}
                  </td>
                  <td className="text-center font-medium">{prot.scorePercent}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedProtocol && (
        <div className="dir-embedded-table-wrap testing-protocol-details-section">
          <div className="dir-item-form-label">
            Детализация ответов (Попытка №{selectedProtocol.attemptNumber}):
          </div>
          <div className="testing-protocol-answers-scroll erp-v8-scrollbar">
            <table className="erp-v8-table">
              <thead>
                <tr>
                  <th className="dir-col-code-sm">№</th>
                  <th>Вопрос</th>
                  <th className="dir-col-code-md">Ответы (коды)</th>
                  <th className="dir-col-code-md">Эталон</th>
                  <th className="dir-col-code-md">Итог</th>
                  <th className="profile-col-phone">Дата и время</th>
                </tr>
              </thead>
              <tbody>
                {selectedProtocol.answers.map((ans) => (
                  <tr key={ans.questionOrder}>
                    <td className="text-center">{ans.questionOrder}</td>
                    <td className="testing-qstat-question-cell">{ans.questionText}</td>
                    <td className="text-center font-medium">
                      {ans.isAnswered ? ans.selectedCodes : '—'}
                    </td>
                    <td className="text-center">{ans.correctCodes}</td>
                    <td className="text-center">
                      {!ans.isAnswered ? (
                        'Не отвечен'
                      ) : ans.isCorrect ? (
                        <span className="testing-badge testing-badge--success">
                          Верно
                        </span>
                      ) : (
                        <span className="testing-badge testing-badge--danger">
                          Неверно
                        </span>
                      )}
                    </td>
                    <td>{formatDateTime(ans.answeredAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

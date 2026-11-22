import React, { useState, useEffect, useRef } from 'react';
import {
  useSubmitTestAnswerMutation,
  useFinishTestAttemptMutation,
  type TestAttemptSession,
} from '../testingApi';
import { ErpErrorBanner } from '../../../components/ui/ErpErrorBanner';

interface TestRunnerViewProps {
  initialSession: TestAttemptSession;
  onExit: () => void;
}

export const TestRunnerView: React.FC<TestRunnerViewProps> = ({
  initialSession,
  onExit,
}) => {
  const [session, setSession] = useState<TestAttemptSession>(initialSession);
  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    // Открываем первый ещё не отвеченный вопрос (если есть)
    const firstUnanswered = initialSession.questions.findIndex((q) => !q.isAnswered);
    return firstUnanswered >= 0 ? firstUnanswered : 0;
  });

  // Локальные черновики выбора для ещё не принятых вопросов: { [questionId]: string[] }
  const [draftSelections, setDraftSelections] = useState<Record<number, string[]>>({});
  const [secondsLeft, setSecondsLeft] = useState<number | null>(
    initialSession.remainingSeconds ?? null,
  );
  const [error, setError] = useState<unknown>(null);

  const [submitAnswer, { isLoading: isSubmitting }] = useSubmitTestAnswerMutation();
  const [finishAttempt, { isLoading: isFinishing }] = useFinishTestAttemptMutation();

  const expiredTriggeredRef = useRef(false);

  // Живой обратный отсчёт времени
  useEffect(() => {
    if (
      session.status !== 'IN_PROGRESS' ||
      !session.hasTimeLimit ||
      secondsLeft === null
    ) {
      return;
    }

    if (secondsLeft <= 0) {
      if (!expiredTriggeredRef.current) {
        expiredTriggeredRef.current = true;
        finishAttempt({ attemptId: session.attemptId, expired: true })
          .unwrap()
          .then((updated) => setSession(updated))
          .catch((err) => setError(err));
      }
      return;
    }

    const timerId = window.setInterval(() => {
      setSecondsLeft((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [
    session.status,
    session.hasTimeLimit,
    session.attemptId,
    secondsLeft,
    finishAttempt,
  ]);

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Экран итогов после завершения или истечения времени
  if (session.status !== 'IN_PROGRESS') {
    const isExpired = session.status === 'EXPIRED';
    return (
      <div className="testing-runner-wrap">
        <div className="testing-runner-header">
          <strong>Тест завершён: {session.testTitle}</strong>
          <span
            className={`testing-badge ${
              isExpired ? 'testing-badge--danger' : 'testing-badge--success'
            }`}
          >
            {isExpired ? 'Время истекло (результат зафиксирован)' : 'Завершено'}
          </span>
        </div>

        <div className="testing-result-summary">
          <h3>Результат попытки №{session.attemptNumber}</h3>
          <p>
            Дано ответов:{' '}
            <strong>
              {session.answeredQuestions} из {session.totalQuestions}
            </strong>
          </p>
          <p>
            Правильных ответов:{' '}
            <strong>
              {session.correctAnswers} из {session.totalQuestions}
            </strong>
          </p>
          <div className="testing-stat-value">Итоговый балл: {session.scorePercent}%</div>
          <p className="dir-item-form-label">
            Доступ к повторному прохождению закрыт. При необходимости обратитесь к
            куратору тестирования.
          </p>
          <button type="button" className="bookings-create-btn" onClick={onExit}>
            Вернуться к списку тестов
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = session.questions[currentIndex];
  if (!currentQuestion) return null;

  const isLocked = currentQuestion.isAnswered;
  const selectedCodes = isLocked
    ? currentQuestion.selectedCodes
    : draftSelections[currentQuestion.questionId] || [];

  const handleToggleOption = (code: string) => {
    if (isLocked) return;
    const normCode = code.toLowerCase();

    setDraftSelections((prev) => {
      const current = prev[currentQuestion.questionId] || [];
      if (!currentQuestion.isMultipleChoice) {
        return { ...prev, [currentQuestion.questionId]: [normCode] };
      }
      const exists = current.includes(normCode);
      const next = exists
        ? current.filter((c) => c !== normCode)
        : [...current, normCode];
      return { ...prev, [currentQuestion.questionId]: next };
    });
  };

  const handleAcceptAnswer = async () => {
    if (isLocked || selectedCodes.length === 0) return;
    try {
      setError(null);
      const updated = await submitAnswer({
        attemptId: session.attemptId,
        questionId: currentQuestion.questionId,
        selectedCodes,
      }).unwrap();
      setSession(updated);
      if (updated.remainingSeconds !== null && updated.remainingSeconds !== undefined) {
        setSecondsLeft(updated.remainingSeconds);
      }
      // Автоматически переходим к следующему неотвеченному вопросу, если тест продолжается
      if (
        updated.status === 'IN_PROGRESS' &&
        currentIndex < updated.questions.length - 1
      ) {
        setCurrentIndex((idx) => idx + 1);
      }
    } catch (err) {
      setError(err);
    }
  };

  const handleFinishEarly = async () => {
    if (
      !window.confirm(
        `Завершить тестирование досрочно? Отвечено ${session.answeredQuestions} из ${session.totalQuestions} вопросов.`,
      )
    ) {
      return;
    }
    try {
      setError(null);
      const updated = await finishAttempt({
        attemptId: session.attemptId,
        expired: false,
      }).unwrap();
      setSession(updated);
    } catch (err) {
      setError(err);
    }
  };

  return (
    <div className="testing-runner-wrap">
      {Boolean(error) && <ErpErrorBanner error={error} />}

      <div className="testing-runner-header">
        <div>
          <strong>
            Вопрос {currentIndex + 1} из {session.totalQuestions}
          </strong>{' '}
          <span className="testing-badge">
            Принято ответов:{' '}
            <strong>
              {session.answeredQuestions} из {session.totalQuestions}
            </strong>
          </span>
        </div>

        <div className="bookings-toolbar-right">
          {session.hasTimeLimit && secondsLeft !== null && (
            <div
              className={`testing-timer-box ${
                secondsLeft <= 60 ? 'testing-timer-box--danger' : ''
              }`}
            >
              ⏱ Осталось: {formatTimer(secondsLeft)}
            </div>
          )}

          <button
            type="button"
            className="erp-cmd-btn"
            disabled={isFinishing}
            onClick={handleFinishEarly}
          >
            Завершить тест
          </button>
        </div>
      </div>

      <div className="testing-runner-body">
        <div className="testing-question-text">
          {currentQuestion.questionOrder}. {currentQuestion.questionText}
        </div>

        <div className="dir-item-form-label">
          {currentQuestion.isMultipleChoice
            ? 'Выберите несколько правильных вариантов ответа:'
            : 'Выберите один правильный вариант ответа:'}
          {isLocked && ' (Ответ принят и зафиксирован)'}
        </div>

        <div className="testing-options-list">
          {currentQuestion.options.map((opt) => {
            const isSelected = selectedCodes.includes(opt.code.toLowerCase());
            return (
              <div
                key={opt.id}
                className={`testing-option-row ${
                  isSelected ? 'testing-option-row--selected' : ''
                } ${isLocked ? 'testing-option-row--locked' : ''}`}
                onClick={() => handleToggleOption(opt.code)}
              >
                <input
                  type={currentQuestion.isMultipleChoice ? 'checkbox' : 'radio'}
                  checked={isSelected}
                  disabled={isLocked}
                  onChange={() => {}}
                />
                <span>{opt.optionText}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="testing-runner-footer">
        <button
          type="button"
          className="erp-cmd-btn"
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
        >
          ◀ Назад
        </button>

        <button
          type="button"
          className="bookings-create-btn"
          disabled={isLocked || selectedCodes.length === 0 || isSubmitting}
          onClick={handleAcceptAnswer}
        >
          {isLocked ? '✔ Ответ принят' : '✔ Принять ответ'}
        </button>

        <button
          type="button"
          className="erp-cmd-btn"
          disabled={currentIndex >= session.questions.length - 1}
          onClick={() =>
            setCurrentIndex((prev) => Math.min(session.questions.length - 1, prev + 1))
          }
        >
          Вперёд ▶
        </button>
      </div>
    </div>
  );
};

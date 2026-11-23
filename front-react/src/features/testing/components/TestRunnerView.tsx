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
    const firstUnanswered = initialSession.questions.findIndex((q) => !q.isAnswered);
    return firstUnanswered >= 0 ? firstUnanswered : 0;
  });
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(
    initialSession.hasTimeLimit ? (initialSession.remainingSeconds ?? null) : null,
  );
  const [error, setError] = useState<unknown>(null);

  const [submitAnswer, { isLoading: isSubmitting }] = useSubmitTestAnswerMutation();
  const [finishAttempt, { isLoading: isFinishing }] = useFinishTestAttemptMutation();

  const autoFinishTriggered = useRef(false);
  const currentQuestion = session.questions.at(currentIndex);

  useEffect(() => {
    if (currentQuestion) {
      setSelectedCodes(currentQuestion.selectedCodes || []);
    }
  }, [currentIndex, currentQuestion]);

  useEffect(() => {
    if (
      session.status !== 'IN_PROGRESS' ||
      !session.hasTimeLimit ||
      secondsLeft === null
    ) {
      return;
    }

    if (secondsLeft <= 0) {
      if (!autoFinishTriggered.current) {
        autoFinishTriggered.current = true;
        finishAttempt({ attemptId: session.attemptId, expired: true })
          .unwrap()
          .then((updated) => setSession(updated))
          .catch(() => {});
      }
      return;
    }

    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [
    secondsLeft,
    session.status,
    session.hasTimeLimit,
    session.attemptId,
    finishAttempt,
  ]);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleToggleOption = (code: string) => {
    if (!currentQuestion || currentQuestion.isAnswered) return;
    if (session.status !== 'IN_PROGRESS') return;

    const lower = code.toLowerCase();
    if (currentQuestion.isMultipleChoice) {
      setSelectedCodes((prev) =>
        prev.includes(lower) ? prev.filter((c) => c !== lower) : [...prev, lower],
      );
    } else {
      setSelectedCodes([lower]);
    }
  };

  // Остаёмся на текущем вопросе после принятия ответа, чтобы показать подсветку
  const handleAcceptAnswer = async () => {
    if (!currentQuestion || selectedCodes.length === 0) return;
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
    } catch (err) {
      setError(err);
    }
  };

  const handleFinish = async () => {
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
  if (session.status !== 'IN_PROGRESS') {
    const passScore = session.passScorePercent ?? 80;
    const isPassed = session.isPassed ?? session.scorePercent >= passScore;

    return (
      <div className="testing-runner-wrap">
        <div className="testing-runner-header">
          <strong>
            {session.isTraining ? '🎓 Обучающий тест: ' : 'Тест: '}
            {session.testTitle}
          </strong>
          <span className="testing-badge">
            {session.status === 'EXPIRED'
              ? 'Время истекло'
              : session.isTraining
                ? 'Обучающая попытка (без фиксации в журнале)'
                : `Попытка №${session.attemptNumber}`}
          </span>
        </div>

        <div className="testing-result-summary">
          <h3>
            {session.isTraining
              ? 'Обучающее тестирование завершено'
              : 'Тестирование завершено'}
          </h3>
          <p>
            Отвечено вопросов: <strong>{session.answeredQuestions}</strong> из{' '}
            <strong>{session.totalQuestions}</strong>
          </p>
          <p>
            Правильных ответов: <strong>{session.correctAnswers}</strong> из{' '}
            <strong>{session.totalQuestions}</strong>
          </p>
          <p>
            Результат: <strong>{session.scorePercent}%</strong> (проходной балл:{' '}
            {passScore}%)
          </p>
          <p>
            Итог:{' '}
            {isPassed ? (
              <span className="testing-badge testing-badge--success">✔ СДАЛ</span>
            ) : (
              <span className="testing-badge testing-badge--danger">✖ НЕ СДАЛ</span>
            )}
          </p>

          <button type="button" className="bookings-create-btn" onClick={onExit}>
            Вернуться к списку тестов
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return null;
  }

  const isLocked = currentQuestion.isAnswered;
  const isLastQuestion = currentIndex === session.questions.length - 1;
  const correctSet = new Set(
    (currentQuestion.correctCodes || []).map((c) => c.toLowerCase()),
  );

  return (
    <div className="testing-runner-wrap">
      {Boolean(error) && <ErpErrorBanner error={error} />}

      <div className="testing-runner-header">
        <div>
          <strong>
            {session.isTraining ? '🎓 [Обучение] ' : ''}
            {session.testTitle}
          </strong>
          <div className="tasks-emp-position">
            Вопрос {currentIndex + 1} из {session.questions.length} • Принято ответов:{' '}
            {session.answeredQuestions} из {session.totalQuestions}
          </div>
        </div>

        {secondsLeft !== null && (
          <div
            className={`testing-timer-box ${
              secondsLeft <= 60 ? 'testing-timer-box--danger' : ''
            }`}
          >
            ⏱ Осталось: {formatTimer(secondsLeft)}
          </div>
        )}
      </div>

      <div className="testing-runner-body">
        <div className="testing-question-text">
          {currentIndex + 1}. {currentQuestion.questionText}
        </div>

        <div className="tasks-emp-position">
          {currentQuestion.isMultipleChoice
            ? 'Выберите все подходящие варианты ответа:'
            : 'Выберите один вариант ответа:'}
        </div>

        <div className="testing-options-list">
          {currentQuestion.options.map((opt) => {
            const lowerCode = opt.code.toLowerCase();
            const isSelected = selectedCodes.includes(lowerCode);
            const isOptionCorrect = isLocked && correctSet.has(lowerCode);
            const isOptionWrongSelected =
              isLocked && isSelected && !correctSet.has(lowerCode);

            let rowClass = 'testing-option-row';
            if (isOptionCorrect) {
              rowClass += ' testing-option-row--correct';
            } else if (isOptionWrongSelected) {
              rowClass += ' testing-option-row--wrong';
            } else if (isSelected) {
              rowClass += ' testing-option-row--selected';
            }
            if (isLocked) {
              rowClass += ' testing-option-row--locked';
            }

            return (
              <div
                key={opt.id}
                className={rowClass}
                onClick={() => handleToggleOption(opt.code)}
              >
                <input
                  type={currentQuestion.isMultipleChoice ? 'checkbox' : 'radio'}
                  checked={isSelected}
                  disabled={isLocked}
                  onChange={() => {}}
                />
                <span>{opt.optionText}</span>

                {isOptionCorrect && (
                  <span className="testing-option-status-tag">✔ Правильный ответ</span>
                )}
                {isOptionWrongSelected && (
                  <span className="testing-option-status-tag">✖ Ваш ответ неверен</span>
                )}
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

        <div className="bookings-toolbar-right">
          {!isLocked && (
            <button
              type="button"
              className="bookings-create-btn"
              disabled={selectedCodes.length === 0 || isSubmitting}
              onClick={handleAcceptAnswer}
            >
              ✔ Принять ответ
            </button>
          )}

          {!isLastQuestion ? (
            <button
              type="button"
              className="erp-cmd-btn"
              onClick={() =>
                setCurrentIndex((prev) =>
                  Math.min(session.questions.length - 1, prev + 1),
                )
              }
            >
              Вперёд ▶
            </button>
          ) : (
            <button
              type="button"
              className="bookings-create-btn"
              disabled={isFinishing}
              onClick={handleFinish}
            >
              🏁 Завершить тест
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

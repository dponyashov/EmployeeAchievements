import React, { useState, useEffect, useRef } from 'react';
import {
  useGetTestsBySectionQuery,
  useLazyGetTestAdminDetailQuery,
  useCreateTestMutation,
  useUpdateTestMutation,
  useDeleteTestMutation,
  type TestQuestionUpsert,
  type TestOptionUpsert,
} from '../testingApi';
import {
  type EditorMode,
  type TestFormSettings,
  type TestEditorTabProps,
  INITIAL_TEST_SETTINGS,
  createEmptyOption,
  createEmptyQuestion,
} from '../types/testEditor.types';
import {
  downloadQuestionsTemplateExcel,
  parseQuestionsFromFile,
} from '../utils/importTestQuestions';
import { ErpCommandBar } from '../../../components/ui/ErpCommandBar';
import { ErpErrorBanner } from '../../../components/ui/ErpErrorBanner';
import { TestSettingsForm } from './editor/TestSettingsForm';
import { TestQuestionCard } from './editor/TestQuestionCard';

export const TestEditorTab: React.FC<TestEditorTabProps> = ({ sectionId }) => {
  const { data: tests, isLoading, refetch } = useGetTestsBySectionQuery(sectionId);
  const [fetchTestDetail, { isFetching: isDetailLoading }] =
    useLazyGetTestAdminDetailQuery();
  const [createTest, { isLoading: isCreating }] = useCreateTestMutation();
  const [updateTest, { isLoading: isUpdating }] = useUpdateTestMutation();
  const [deleteTest] = useDeleteTestMutation();

  const [mode, setMode] = useState<EditorMode>('list');
  const [selectedTestId, setSelectedTestId] = useState<number | null>(null);
  const [settings, setSettings] = useState<TestFormSettings>(INITIAL_TEST_SETTINGS);
  const [questions, setQuestions] = useState<TestQuestionUpsert[]>([
    createEmptyQuestion(1),
  ]);
  const [error, setError] = useState<unknown>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMode('list');
    setSelectedTestId(null);
    setError(null);
  }, [sectionId]);

  const handleCopyTest = async (testId?: number) => {
    const targetId = testId ?? selectedTestId;
    if (!targetId) return;

    try {
      setError(null);
      const detail = await fetchTestDetail(targetId).unwrap();
      // Сбрасываем selectedTestId и id вопросов/вариантов, чтобы создать новый тест
      setSelectedTestId(null);
      setSettings({
        title: `${detail.title} (копия)`,
        description: detail.description || '',
        questionsLimit: detail.questionsLimit,
        hasTimeLimit: detail.hasTimeLimit,
        timeLimitMinutes: detail.timeLimitMinutes ?? 15,
        isHidden: false,
        allowTraining: Boolean(detail.allowTraining),
        passScorePercent: detail.passScorePercent ?? 80,
      });
      setQuestions(
        detail.questions.length > 0
          ? detail.questions.map((q, idx) => ({
              questionText: q.questionText,
              sortOrder: idx + 1,
              options: q.options.map((o) => ({
                code: o.code,
                optionText: o.optionText,
                isCorrect: o.isCorrect,
              })),
            }))
          : [createEmptyQuestion(1)],
      );
      setMode('create');
    } catch (err) {
      setError(err);
    }
  };

  const handleSettingChange = <K extends keyof TestFormSettings>(
    field: K,
    value: TestFormSettings[K],
  ) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleOpenCreate = () => {
    setError(null);
    setSelectedTestId(null);
    setSettings(INITIAL_TEST_SETTINGS);
    setQuestions([createEmptyQuestion(1)]);
    setMode('create');
  };

  const handleOpenEdit = async (testId?: number) => {
    const targetId = testId ?? selectedTestId;
    if (!targetId) return;

    try {
      setError(null);
      const detail = await fetchTestDetail(targetId).unwrap();
      setSelectedTestId(detail.id);
      setSettings({
        title: detail.title,
        description: detail.description || '',
        questionsLimit: detail.questionsLimit,
        hasTimeLimit: detail.hasTimeLimit,
        timeLimitMinutes: detail.timeLimitMinutes ?? 15,
        isHidden: detail.isHidden,
        allowTraining: Boolean(detail.allowTraining),
        passScorePercent: detail.passScorePercent ?? 80,
      });
      setQuestions(
        detail.questions.length > 0 ? detail.questions : [createEmptyQuestion(1)],
      );
      setMode('edit');
    } catch (err) {
      setError(err);
    }
  };

  const handleDeleteSelected = async () => {
    if (!selectedTestId) return;
    if (!window.confirm('Удалить выбранный тест и всю его историю?')) return;
    try {
      setError(null);
      await deleteTest(selectedTestId).unwrap();
      setSelectedTestId(null);
    } catch (err) {
      setError(err);
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.item(0);
    if (!file) return;

    try {
      setError(null);
      const isInitialBlank =
        questions.length === 1 &&
        !questions.at(0)?.questionText.trim() &&
        questions.at(0)?.options.every((o) => !o.optionText.trim());

      const baseOrder = isInitialBlank ? 1 : questions.length + 1;
      const imported = await parseQuestionsFromFile(file, baseOrder);
      setQuestions((prev) => (isInitialBlank ? imported : [...prev, ...imported]));
    } catch (err) {
      setError(err);
    } finally {
      e.target.value = '';
    }
  };

  const handleSaveTest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      const payload = {
        sectionId,
        title: settings.title.trim(),
        description: settings.description.trim(),
        questionsLimit: settings.questionsLimit,
        hasTimeLimit: settings.hasTimeLimit,
        timeLimitMinutes: settings.hasTimeLimit ? settings.timeLimitMinutes : null,
        isHidden: settings.isHidden,
        allowTraining: settings.allowTraining,
        passScorePercent: settings.passScorePercent,
        questions: questions.map((q, idx) => ({
          id: q.id,
          questionText: q.questionText.trim(),
          sortOrder: idx + 1,
          options: q.options.map((o) => ({
            id: o.id,
            code: o.code.trim().toLowerCase(),
            optionText: o.optionText.trim(),
            isCorrect: Boolean(o.isCorrect),
          })),
        })),
      };

      if (mode === 'create') {
        await createTest(payload).unwrap();
      } else if (mode === 'edit' && selectedTestId) {
        await updateTest({ testId: selectedTestId, data: payload }).unwrap();
      }
      setMode('list');
    } catch (err) {
      setError(err);
    }
  };
  const addQuestion = () => {
    setQuestions((prev) => [...prev, createEmptyQuestion(prev.length + 1)]);
  };

  const removeQuestion = (qIndex: number) => {
    setQuestions((prev) => prev.filter((_, idx) => idx !== qIndex));
  };

  const updateQuestionText = (qIndex: number, text: string) => {
    setQuestions((prev) =>
      prev.map((q, idx) => (idx === qIndex ? { ...q, questionText: text } : q)),
    );
  };

  const addOption = (qIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, idx) =>
        idx === qIndex
          ? { ...q, options: [...q.options, createEmptyOption(q.options.length)] }
          : q,
      ),
    );
  };

  const updateOption = <K extends keyof TestOptionUpsert>(
    qIndex: number,
    oIndex: number,
    field: K,
    value: TestOptionUpsert[K],
  ) => {
    setQuestions((prev) =>
      prev.map((q, idx) =>
        idx === qIndex
          ? {
              ...q,
              options: q.options.map((opt, oi) =>
                oi === oIndex ? { ...opt, [field]: value } : opt,
              ),
            }
          : q,
      ),
    );
  };

  const removeOption = (qIndex: number, oIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, idx) =>
        idx === qIndex
          ? { ...q, options: q.options.filter((_, oi) => oi !== oIndex) }
          : q,
      ),
    );
  };

  if (mode === 'create' || mode === 'edit') {
    const isSaving = isCreating || isUpdating;

    return (
      <form onSubmit={handleSaveTest} className="testing-tests-grid">
        {Boolean(error) && <ErpErrorBanner error={error} />}

        <div className="dir-section-header">
          <strong>
            {mode === 'create'
              ? 'Создание нового теста'
              : `Редактирование теста: ${settings.title}`}
          </strong>
          <div className="bookings-toolbar-right">
            <button type="submit" className="bookings-create-btn" disabled={isSaving}>
              💾 {isSaving ? 'Сохранение...' : 'Сохранить тест'}
            </button>
            <button type="button" className="erp-cmd-btn" onClick={() => setMode('list')}>
              ✖ Отмена
            </button>
          </div>
        </div>

        <TestSettingsForm settings={settings} onChange={handleSettingChange} />

        <div className="sub-view">
          <div className="dir-section-header">
            <strong>Банк вопросов теста ({questions.length})</strong>
            <div className="bookings-toolbar-right">
              <button
                type="button"
                className="erp-cmd-btn"
                onClick={downloadQuestionsTemplateExcel}
              >
                📥 Шаблон (Excel)
              </button>
              <button
                type="button"
                className="erp-cmd-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                📤 Загрузить из файла
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                hidden
                onChange={handleImportFile}
              />
              <button type="button" className="erp-cmd-btn" onClick={addQuestion}>
                ➕ Добавить вопрос
              </button>
            </div>
          </div>

          {questions.map((q, qIndex) => (
            <TestQuestionCard
              key={q.id ?? `new-q-${qIndex}`}
              question={q}
              index={qIndex}
              canRemoveQuestion={questions.length > 1}
              onChangeText={updateQuestionText}
              onRemoveQuestion={removeQuestion}
              onAddOption={addOption}
              onChangeOption={updateOption}
              onRemoveOption={removeOption}
            />
          ))}
        </div>
      </form>
    );
  }

  return (
    <div>
      {Boolean(error) && <ErpErrorBanner error={error} />}

      <ErpCommandBar
        onCreate={handleOpenCreate}
        onEdit={() => handleOpenEdit()}
        onDelete={handleDeleteSelected}
        onRefresh={refetch}
      />
      <div className="bookings-toolbar-right" style={{ marginBottom: 8 }}>
        <button
          type="button"
          className="erp-cmd-btn"
          disabled={selectedTestId === null || isDetailLoading}
          onClick={() => handleCopyTest()}
        >
          📋 Копировать выбранный тест
        </button>
      </div>

      {isLoading ? (
        <div>Загрузка списка тестов...</div>
      ) : (
        <table className="erp-v8-table">
          <thead>
            <tr>
              <th>Наименование теста</th>
              <th className="dir-col-code-md">Вопросов</th>
              <th className="dir-col-code-md">Проходной</th>
              <th className="dir-col-code-md">Таймер</th>
              <th className="dir-col-code-md">Обучение</th>
              <th className="dir-col-code-md">Статус</th>
            </tr>
          </thead>
          <tbody>
            {tests?.map((t) => (
              <tr
                key={t.id}
                onClick={() => setSelectedTestId(t.id)}
                onDoubleClick={() => handleOpenEdit(t.id)}
                className={selectedTestId === t.id ? 'erp-row-selected' : ''}
              >
                <td className="font-medium">{t.title}</td>
                <td className="text-center">
                  {t.questionsLimit} из {t.bankQuestionsCount}
                </td>
                <td className="text-center">{t.passScorePercent ?? 80}%</td>
                <td className="text-center">
                  {t.hasTimeLimit ? `${t.timeLimitMinutes} мин.` : 'Нет'}
                </td>
                <td className="text-center">{t.allowTraining ? 'Разрешено' : 'Нет'}</td>
                <td className="text-center">
                  {t.isHidden ? (
                    <span className="testing-badge testing-badge--warn">Скрыт</span>
                  ) : (
                    <span className="testing-badge testing-badge--success">Активен</span>
                  )}
                </td>
              </tr>
            ))}
            {(!tests || tests.length === 0) && (
              <tr>
                <td colSpan={6} className="erp-empty-table">
                  В разделе пока нет тестов. Нажмите «Создать», чтобы добавить первый
                  тест.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

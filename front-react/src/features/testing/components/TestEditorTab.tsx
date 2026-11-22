import React, { useRef, useState } from 'react';
import {
  useGetTestsBySectionQuery,
  useLazyGetTestAdminDetailQuery,
  useCreateTestMutation,
  useUpdateTestMutation,
  useDeleteTestMutation,
  type TestQuestionUpsert,
  type TestOptionUpsert,
} from '../testingApi';
import { ErpErrorBanner } from '../../../components/ui/ErpErrorBanner';
import { ErpCommandBar } from '../../../components/ui/ErpCommandBar';
import {
  downloadQuestionsTemplateExcel,
  parseQuestionsFromFile,
} from '../utils/importTestQuestions';

interface TestEditorTabProps {
  sectionId: number;
}

const DEFAULT_CODES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

const createEmptyQuestion = (order: number): TestQuestionUpsert => ({
  questionText: '',
  sortOrder: order,
  options: [
    { code: 'a', optionText: '', isCorrect: true },
    { code: 'b', optionText: '', isCorrect: false },
  ],
});

export const TestEditorTab: React.FC<TestEditorTabProps> = ({ sectionId }) => {
  const { data: tests, isLoading, refetch } = useGetTestsBySectionQuery(sectionId);
  const [fetchAdminDetail, { isFetching: isLoadingDetail }] =
    useLazyGetTestAdminDetailQuery();
  const [createTest, { isLoading: isCreating }] = useCreateTestMutation();
  const [updateTest, { isLoading: isUpdating }] = useUpdateTestMutation();
  const [deleteTest] = useDeleteTestMutation();

  const [selectedTestId, setSelectedTestId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<unknown>(null);

  const [isEditingForm, setIsEditingForm] = useState(false);
  const [editingTestId, setEditingTestId] = useState<number | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questionsLimit, setQuestionsLimit] = useState(10);
  const [hasTimeLimit, setHasTimeLimit] = useState(false);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(15);
  const [isHidden, setIsHidden] = useState(false);
  const [questions, setQuestions] = useState<TestQuestionUpsert[]>([
    createEmptyQuestion(1),
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const filteredTests = (tests || []).filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase()),
  );

  const handleCreateNew = () => {
    setError(null);
    setEditingTestId(null);
    setTitle('');
    setDescription('');
    setQuestionsLimit(10);
    setHasTimeLimit(false);
    setTimeLimitMinutes(15);
    setIsHidden(false);
    setQuestions([createEmptyQuestion(1)]);
    setIsEditingForm(true);
  };

  const handleEditSelected = async () => {
    if (!selectedTestId) {
      alert('Выделите тест в таблице для редактирования.');
      return;
    }
    try {
      setError(null);
      const detail = await fetchAdminDetail(selectedTestId).unwrap();
      setEditingTestId(detail.id);
      setTitle(detail.title);
      setDescription(detail.description || '');
      setQuestionsLimit(detail.questionsLimit);
      setHasTimeLimit(detail.hasTimeLimit);
      setTimeLimitMinutes(detail.timeLimitMinutes || 15);
      setIsHidden(detail.isHidden);
      setQuestions(
        detail.questions.length > 0
          ? detail.questions.map((q) => ({
              ...q,
              options: q.options.map((o) => ({ ...o })),
            }))
          : [createEmptyQuestion(1)],
      );
      setIsEditingForm(true);
    } catch (err) {
      setError(err);
    }
  };

  const handleDeleteSelected = async () => {
    if (!selectedTestId) {
      alert('Выделите тест для удаления.');
      return;
    }
    if (!window.confirm('Удалить выбранный тест и всю историю его прохождения?')) {
      return;
    }
    try {
      setError(null);
      await deleteTest(selectedTestId).unwrap();
      setSelectedTestId(null);
    } catch (err) {
      setError(err);
    }
  };

  const addQuestion = () => {
    setQuestions((prev) => [...prev, createEmptyQuestion(prev.length + 1)]);
  };

  const removeQuestion = (qIndex: number) => {
    if (questions.length <= 1) return;
    setQuestions((prev) =>
      prev
        .filter((_, idx) => idx !== qIndex)
        .map((q, idx) => ({ ...q, sortOrder: idx + 1 })),
    );
  };

  const updateQuestionText = (qIndex: number, text: string) => {
    setQuestions((prev) =>
      prev.map((q, idx) => (idx === qIndex ? { ...q, questionText: text } : q)),
    );
  };

  const addOption = (qIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, idx) => {
        if (idx !== qIndex) return q;
        const nextCode =
          DEFAULT_CODES[q.options.length] || String.fromCharCode(97 + q.options.length);
        return {
          ...q,
          options: [...q.options, { code: nextCode, optionText: '', isCorrect: false }],
        };
      }),
    );
  };

  const removeOption = (qIndex: number, oIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, idx) => {
        if (idx !== qIndex || q.options.length <= 2) return q;
        return {
          ...q,
          options: q.options.filter((_, i) => i !== oIndex),
        };
      }),
    );
  };

  const updateOptionField = <K extends keyof TestOptionUpsert>(
    qIndex: number,
    oIndex: number,
    field: K,
    value: TestOptionUpsert[K],
  ) => {
    setQuestions((prev) =>
      prev.map((q, idx) => {
        if (idx !== qIndex) return q;
        return {
          ...q,
          options: q.options.map((opt, i) =>
            i === oIndex ? { ...opt, [field]: value } : opt,
          ),
        };
      }),
    );
  };

  const handleSaveTest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      const payload = {
        sectionId,
        title: title.trim(),
        description: description.trim(),
        questionsLimit: Number(questionsLimit) || 1,
        hasTimeLimit,
        timeLimitMinutes: hasTimeLimit ? Number(timeLimitMinutes) || 1 : null,
        isHidden,
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

      if (editingTestId) {
        await updateTest({ testId: editingTestId, data: payload }).unwrap();
      } else {
        await createTest(payload).unwrap();
      }
      setIsEditingForm(false);
    } catch (err) {
      setError(err);
    }
  };
  if (isEditingForm) {
    return (
      <div className="testing-tests-grid">
        {Boolean(error) && <ErpErrorBanner error={error} />}

        <div className="task-form-header">
          {editingTestId
            ? `Редактирование теста №${editingTestId}`
            : 'Создание нового теста'}
        </div>

        <form onSubmit={handleSaveTest} className="task-form-body">
          <div className="bookings-form-row">
            <label>Наименование теста *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="bookings-form-row">
            <label>Описание / инструкция к тесту</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="bookings-form-time-grid">
            <div className="bookings-form-row">
              <label>На сколько вопросов отвечает сотрудник *</label>
              <input
                type="number"
                min={1}
                value={questionsLimit}
                onChange={(e) => setQuestionsLimit(Number(e.target.value))}
                required
              />
            </div>

            <div className="bookings-form-row">
              <label>Видимость теста</label>
              <label>
                <input
                  type="checkbox"
                  checked={isHidden}
                  onChange={(e) => setIsHidden(e.target.checked)}
                />{' '}
                Скрыть тест от пользователей
              </label>
            </div>
          </div>

          <div className="bookings-form-time-grid">
            <div className="bookings-form-row">
              <label>Ограничение по времени</label>
              <label>
                <input
                  type="checkbox"
                  checked={hasTimeLimit}
                  onChange={(e) => setHasTimeLimit(e.target.checked)}
                />{' '}
                Включить обратный отсчёт времени
              </label>
            </div>

            {hasTimeLimit && (
              <div className="bookings-form-row">
                <label>Лимит времени (в минутах) *</label>
                <input
                  type="number"
                  min={1}
                  value={timeLimitMinutes}
                  onChange={(e) => setTimeLimitMinutes(Number(e.target.value))}
                  required
                />
              </div>
            )}
          </div>

          <hr />

          <div className="dir-section-header">
            <strong>Банк вопросов теста ({questions.length})</strong>
            <div className="bookings-toolbar-right">
              <button
                type="button"
                className="erp-cmd-btn"
                onClick={downloadQuestionsTemplateExcel}
              >
                📥 Пример шаблона (Excel)
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

          {questions.map((q, qIdx) => (
            <div key={qIdx} className="testing-editor-question-card">
              <div className="dir-section-header">
                <strong>Вопрос №{qIdx + 1}</strong>
                {questions.length > 1 && (
                  <button
                    type="button"
                    className="bookings-delete-btn"
                    onClick={() => removeQuestion(qIdx)}
                  >
                    Удалить вопрос
                  </button>
                )}
              </div>

              <div className="bookings-form-row">
                <label>Текст вопроса *</label>
                <textarea
                  rows={2}
                  value={q.questionText}
                  onChange={(e) => updateQuestionText(qIdx, e.target.value)}
                  required
                />
              </div>

              <div className="dir-item-form-label">
                Варианты ответов (укажите символьный код a, b, c... и отметьте 1 или
                несколько правильных):
              </div>

              {q.options.map((opt, oIdx) => (
                <div key={oIdx} className="testing-editor-option-row">
                  <input
                    type="text"
                    placeholder="Код (a)"
                    maxLength={5}
                    value={opt.code}
                    onChange={(e) =>
                      updateOptionField(qIdx, oIdx, 'code', e.target.value)
                    }
                    required
                  />
                  <input
                    type="text"
                    placeholder="Текст варианта ответа"
                    value={opt.optionText}
                    onChange={(e) =>
                      updateOptionField(qIdx, oIdx, 'optionText', e.target.value)
                    }
                    required
                  />
                  <label>
                    <input
                      type="checkbox"
                      checked={opt.isCorrect}
                      onChange={(e) =>
                        updateOptionField(qIdx, oIdx, 'isCorrect', e.target.checked)
                      }
                    />{' '}
                    Верный
                  </label>
                  <button
                    type="button"
                    className="erp-cmd-btn"
                    disabled={q.options.length <= 2}
                    onClick={() => removeOption(qIdx, oIdx)}
                    title="Удалить вариант"
                  >
                    ✕
                  </button>
                </div>
              ))}

              <button
                type="button"
                className="erp-cmd-btn"
                onClick={() => addOption(qIdx)}
              >
                + Вариант ответа
              </button>
            </div>
          ))}

          <div className="dir-modal-actions">
            <button
              type="button"
              className="erp-cmd-btn"
              onClick={() => setIsEditingForm(false)}
            >
              Отмена
            </button>
            <button
              type="submit"
              className="bookings-create-btn"
              disabled={isCreating || isUpdating}
            >
              💾 Сохранить тест
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="testing-tests-grid">
      {Boolean(error) && <ErpErrorBanner error={error} />}

      <ErpCommandBar
        onCreate={handleCreateNew}
        onEdit={handleEditSelected}
        onDelete={handleDeleteSelected}
        onRefresh={refetch}
        searchPlaceholder="Поиск теста по названию..."
        searchValue={search}
        onSearchChange={setSearch}
      />

      {isLoading || isLoadingDetail ? (
        <div>Загрузка...</div>
      ) : (
        <table className="erp-v8-table">
          <thead>
            <tr>
              <th className="dir-col-code-sm">Код</th>
              <th>Название теста</th>
              <th className="dir-col-code-md">Вопросов</th>
              <th className="dir-col-code-md">Время</th>
              <th className="dir-col-code-md">Статус</th>
            </tr>
          </thead>
          <tbody>
            {filteredTests.map((t) => (
              <tr
                key={t.id}
                onClick={() => setSelectedTestId(t.id)}
                className={selectedTestId === t.id ? 'erp-row-selected' : ''}
              >
                <td className="text-center">{t.id}</td>
                <td className="font-medium">{t.title}</td>
                <td className="text-center">
                  {t.questionsLimit} из {t.bankQuestionsCount}
                </td>
                <td className="text-center">
                  {t.hasTimeLimit ? `${t.timeLimitMinutes} мин.` : 'Без лимита'}
                </td>
                <td className="text-center">
                  {t.isHidden ? (
                    <span className="testing-badge testing-badge--warn">Скрыт</span>
                  ) : (
                    <span className="testing-badge testing-badge--success">Активен</span>
                  )}
                </td>
              </tr>
            ))}
            {filteredTests.length === 0 && (
              <tr>
                <td colSpan={5} className="erp-empty-table">
                  Тесты в разделе не найдены. Нажмите «Создать», чтобы добавить тест.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

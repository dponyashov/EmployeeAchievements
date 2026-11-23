import React, { useState } from 'react';
import {
  useCreateTestSectionMutation,
  useUpdateTestSectionMutation,
  useDeleteTestSectionMutation,
  type TestSectionItem,
  useGetTestSectionsQuery,
} from '../testingApi';
import { ErpErrorBanner } from '../../../components/ui/ErpErrorBanner';
import { ErpCommandBar } from '../../../components/ui/ErpCommandBar';

interface TestSectionEditorTabProps {
  sections: TestSectionItem[];
}

export const TestSectionEditorTab: React.FC<TestSectionEditorTabProps> = ({
  sections,
}) => {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<unknown>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<TestSectionItem | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  const [createSection, { isLoading: isCreating }] = useCreateTestSectionMutation();
  const [updateSection, { isLoading: isUpdating }] = useUpdateTestSectionMutation();
  const [deleteSection] = useDeleteTestSectionMutation();
  const { refetch } = useGetTestSectionsQuery();

  const filtered = sections.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase()),
  );

  const openCreate = () => {
    setError(null);
    setEditingSection(null);
    setTitle('');
    setDescription('');
    setSortOrder(sections.length + 1);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEdit = () => {
    const item = sections.find((s) => s.id === selectedId);
    if (!item) {
      alert('Выделите строку раздела в таблице.');
      return;
    }
    setError(null);
    setEditingSection(item);
    setTitle(item.title);
    setDescription(item.description || '');
    setSortOrder(item.sortOrder);
    setIsActive(item.isActive);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedId) {
      alert('Выделите строку раздела для удаления.');
      return;
    }
    if (!window.confirm('Удалить раздел тестирования вместе со всеми тестами?')) return;
    try {
      setError(null);
      await deleteSection(selectedId).unwrap();
      setSelectedId(null);
    } catch (err) {
      setError(err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      const payload = {
        title: title.trim(),
        description: description.trim(),
        sortOrder: Number(sortOrder) || 0,
        isActive,
      };
      if (editingSection) {
        await updateSection({ id: editingSection.id, data: payload }).unwrap();
      } else {
        await createSection(payload).unwrap();
      }
      setIsModalOpen(false);
    } catch (err) {
      setError(err);
    }
  };

  const handleToggleVisibility = async (e: React.MouseEvent, sec: TestSectionItem) => {
    e.stopPropagation();
    try {
      setError(null);
      await updateSection({
        id: sec.id,
        data: {
          title: sec.title,
          description: sec.description || '',
          sortOrder: sec.sortOrder,
          isActive: !sec.isActive,
        },
      }).unwrap();
    } catch (err) {
      setError(err);
    }
  };

  return (
    <div className="testing-feed-wrap">
      {Boolean(error) && <ErpErrorBanner error={error} />}

      <ErpCommandBar
        onCreate={openCreate}
        onEdit={openEdit}
        onDelete={handleDelete}
        onRefresh={refetch}
        searchPlaceholder="Поиск по названию раздела..."
        searchValue={search}
        onSearchChange={setSearch}
      />

      <table className="erp-v8-table">
        <thead>
          <tr>
            <th className="dir-col-code-sm">Порядок</th>
            <th>Наименование раздела</th>
            <th>Описание</th>
            <th className="dir-col-code-md">Тестов</th>
            <th className="dir-col-code-md">Видимость</th>
            <th className="dir-col-code-md">Действие</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((sec) => (
            <tr
              key={sec.id}
              onClick={() => setSelectedId(sec.id)}
              className={selectedId === sec.id ? 'erp-row-selected' : ''}
            >
              <td className="text-center">{sec.sortOrder}</td>
              <td className="font-medium">{sec.title}</td>
              <td>{sec.description || '—'}</td>
              <td className="text-center">{sec.testsCount}</td>
              <td className="text-center">
                {sec.isActive ? (
                  <span className="testing-badge testing-badge--success">Активен</span>
                ) : (
                  <span className="testing-badge testing-badge--warn">Скрыт</span>
                )}
              </td>
              <td className="text-center">
                <button
                  type="button"
                  className="erp-cmd-btn"
                  disabled={isUpdating}
                  onClick={(e) => handleToggleVisibility(e, sec)}
                  title={
                    sec.isActive
                      ? 'Скрыть раздел от сотрудников'
                      : 'Показать раздел сотрудникам'
                  }
                >
                  {sec.isActive ? '🙈 Скрыть' : '👁️ Показать'}
                </button>
              </td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr>
              <td colSpan={6} className="erp-empty-table">
                Разделы тестирования не найдены.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {isModalOpen && (
        <div className="dir-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="dir-modal-window" onClick={(e) => e.stopPropagation()}>
            <div className="dir-modal-header">
              <span>
                {editingSection
                  ? `Редактирование раздела №${editingSection.id}`
                  : 'Новый раздел тестирования'}
              </span>
              <button
                type="button"
                className="dir-modal-close"
                onClick={() => setIsModalOpen(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSave} className="dir-modal-body">
              <div className="bookings-form-row">
                <label>Название раздела *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="bookings-form-row">
                <label>Описание</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="bookings-form-time-grid">
                <div className="bookings-form-row">
                  <label>Порядок сортировки</label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                  />
                </div>
                {/* <div className="bookings-form-row">
                  <label>Видимость</label>
                  <label>
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                    />{' '}
                    Отображать сотрудникам
                  </label>
                </div> */}
                <div className="bookings-form-row">
                  <label>Видимость раздела</label>
                  <label>
                    <input
                      type="checkbox"
                      checked={!isActive}
                      onChange={(e) => setIsActive(!e.target.checked)}
                    />{' '}
                    Скрыть раздел от пользователей
                  </label>
                </div>
              </div>
              <div className="dir-modal-actions">
                <button
                  type="button"
                  className="erp-cmd-btn"
                  onClick={() => setIsModalOpen(false)}
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="bookings-create-btn"
                  disabled={isCreating || isUpdating}
                >
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

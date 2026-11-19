import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  useGetDirectoryDataQuery,
  useSaveDirectoryItemMutation,
  useDeleteDirectoryItemMutation,
} from '../directoriesApi';
import { ErpCommandBar } from '../../../components/ui/ErpCommandBar';
import { ErpErrorBanner } from '../../../components/ui/ErpErrorBanner';
import '../directories.css';

interface SimpleDirectoryTabProps {
  cleanKey: 'department' | 'position' | 'service' | 'component';
  title: string;
  itemLabel: string;
  canEdit: boolean;
}

export const SimpleDirectoryTab: React.FC<SimpleDirectoryTabProps> = ({
  cleanKey,
  title,
  itemLabel,
  canEdit,
}) => {
  const { data: items = [], isLoading, refetch } = useGetDirectoryDataQuery(cleanKey);
  const [saveItem, { isLoading: isSaving, error: saveError, reset: resetSave }] =
    useSaveDirectoryItemMutation();
  const [deleteItem] = useDeleteDirectoryItemMutation();

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | 'new' | null>(null);
  const [name, setName] = useState('');

  useEffect(() => {
    setSelectedId(null);
    setSearch('');
  }, [cleanKey]);

  useEffect(() => {
    if (!modalOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setModalOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [modalOpen]);

  const filteredItems = items.filter((item) =>
    (item.name || '').toLowerCase().includes(search.toLowerCase()),
  );

  const openCreate = () => {
    resetSave();
    setEditingId('new');
    setName('');
    setModalOpen(true);
  };

  const openEdit = (targetId?: number) => {
    const idToEdit = targetId ?? selectedId;
    const target = items.find((i) => i.id === idToEdit);
    if (!target) {
      alert('Выделите строку в списке для изменения.');
      return;
    }
    resetSave();
    setEditingId(target.id);
    setName(target.name || '');
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedId) {
      alert('Выделите элемент для удаления.');
      return;
    }
    if (!window.confirm('Объект будет удален из информационной базы. Продолжить?')) {
      return;
    }
    try {
      await deleteItem({ cleanKey, id: selectedId }).unwrap();
      setSelectedId(null);
    } catch {
      alert('Ошибка удаления. Возможно, объект используется в других записях.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    try {
      await saveItem({
        cleanKey,
        id: String(editingId),
        data: { name: name.trim() },
      }).unwrap();
      setModalOpen(false);
    } catch {
      // Ошибка отобразится в ErpErrorBanner
    }
  };

  if (isLoading) {
    return (
      <div className="erp-loading-text dir-loading-text">Загрузка справочника...</div>
    );
  }

  return (
    <div className="dir-embedded-tab">
      {canEdit ? (
        <ErpCommandBar
          onCreate={openCreate}
          onEdit={() => openEdit()}
          onDelete={handleDelete}
          onRefresh={refetch}
          searchPlaceholder="Быстрый поиск по наименованию..."
          searchValue={search}
          onSearchChange={setSearch}
        />
      ) : (
        <div className="dir-readonly-bar">
          <input
            type="text"
            className="erp-search-input dir-readonly-search"
            placeholder="Быстрый поиск по наименованию..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="button" className="erp-cmd-btn" onClick={refetch}>
            🔄 Обновить
          </button>
        </div>
      )}

      <div className="erp-table-wrapper dir-embedded-table-wrap">
        <table className="erp-v8-table">
          <thead>
            <tr>
              <th className="dir-col-code-md">Код</th>
              <th>{itemLabel}</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => {
                const isSelected = selectedId === item.id;
                return (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    onDoubleClick={() => canEdit && openEdit(item.id)}
                    className={isSelected ? 'erp-row-selected' : ''}
                  >
                    <td className="text-center">{item.id}</td>
                    <td className="font-medium">{item.name}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={2} className="erp-empty-table">
                  В справочнике «{title}» нет записей.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalOpen &&
        createPortal(
          <div className="dir-modal-overlay" onClick={() => setModalOpen(false)}>
            <div className="dir-modal-window" onClick={(e) => e.stopPropagation()}>
              <div className="dir-modal-header">
                <span>
                  {editingId === 'new'
                    ? `${title} (Создание)`
                    : `${title} Код: ${editingId} (Редактирование)`}
                </span>
                <button
                  type="button"
                  className="dir-modal-close"
                  onClick={() => setModalOpen(false)}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="dir-modal-body">
                <ErpErrorBanner error={saveError} />

                <div className="erp-form-group">
                  <label className="dir-item-form-label">{itemLabel}:</label>
                  <input
                    type="text"
                    className="dir-modal-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus
                    required
                  />
                </div>

                <div className="dir-modal-actions">
                  <button type="submit" className="erp-btn-primary" disabled={isSaving}>
                    Записать
                  </button>
                  <button
                    type="button"
                    className="erp-cmd-btn"
                    disabled={isSaving}
                    onClick={() => setModalOpen(false)}
                  >
                    Закрыть
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

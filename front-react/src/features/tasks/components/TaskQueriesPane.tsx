import React, { useState } from 'react';
import {
  useAddQueryToTaskMutation,
  useDeleteQueryFromTaskMutation,
  type Task,
} from '../tasksApi';
import { ErpErrorBanner } from '../../../components/ui/ErpErrorBanner';

interface TaskQueriesPaneProps {
  task: Task;
}

export const TaskQueriesPane: React.FC<TaskQueriesPaneProps> = ({ task }) => {
  const [addQuery, { isLoading: isAdding, error: addError }] =
    useAddQueryToTaskMutation();
  const [deleteQuery, { isLoading: isDeleting }] = useDeleteQueryFromTaskMutation();
  const [newQueryName, setNewQueryName] = useState('');

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQueryName.trim()) return;

    try {
      await addQuery({ taskId: task.id, data: { name: newQueryName.trim() } }).unwrap();
      setNewQueryName('');
    } catch (err) {
      console.error('Ошибка добавления запроса к задаче:', err);
    }
  };

  const handleDelete = async (queryId: number) => {
    if (window.confirm('Удалить выбранный запрос из задачи?')) {
      try {
        await deleteQuery({ taskId: task.id, queryId }).unwrap();
      } catch (err) {
        alert('Не удалось удалить запрос');
      }
    }
  };

  return (
    <div
      style={{
        height: '220px',
        borderTop: '2px solid #ccc',
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
        fontSize: '13px',
      }}
    >
      {/* Заголовок подчиненного регистра */}
      <div
        style={{
          background: '#e6e6e6',
          padding: '6px 10px',
          fontWeight: 'bold',
          borderBottom: '1px solid #ccc',
          color: '#333',
        }}
      >
        📋 Запросы к задаче: <span style={{ color: '#2b579a' }}>{task.title}</span>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Левая часть: Таблица запросов */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr
                style={{
                  background: '#f5f5f5',
                  textAlign: 'left',
                  borderBottom: '1px solid #ccc',
                }}
              >
                <th
                  style={{
                    padding: '4px 6px',
                    border: '1px solid #ddd',
                    width: '50px',
                    textAlign: 'center',
                  }}
                >
                  №
                </th>
                <th style={{ padding: '4px 6px', border: '1px solid #ddd' }}>
                  Содержание запроса / Требование
                </th>
                <th
                  style={{
                    padding: '4px 6px',
                    border: '1px solid #ddd',
                    width: '60px',
                    textAlign: 'center',
                  }}
                >
                  Действие
                </th>
              </tr>
            </thead>
            <tbody>
              {task.queries && task.queries.length > 0 ? (
                task.queries.map((q, idx) => (
                  <tr key={q.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td
                      style={{
                        padding: '4px 6px',
                        border: '1px solid #ddd',
                        textAlign: 'center',
                        color: '#666',
                      }}
                    >
                      {idx + 1}
                    </td>
                    <td
                      style={{
                        padding: '4px 6px',
                        border: '1px solid #ddd',
                        fontWeight: '50px',
                      }}
                    >
                      {q.name}
                    </td>
                    <td
                      style={{
                        padding: '4px 6px',
                        border: '1px solid #ddd',
                        textAlign: 'center',
                      }}
                    >
                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={() => handleDelete(q.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#cc0000',
                          cursor: 'pointer',
                          fontSize: '11px',
                        }}
                        title="Удалить запрос"
                      >
                        ❌
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={3}
                    style={{ padding: '15px', textAlign: 'center', color: '#888' }}
                  >
                    У данной задачи нет связанных запросов
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Правая часть: Быстрое добавление новой строки в стиле 1С */}
        <div
          style={{
            width: '320px',
            borderLeft: '1px solid #ccc',
            padding: '10px',
            background: '#fafafa',
          }}
        >
          <form
            onSubmit={handleAddSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
          >
            <label style={{ fontWeight: 'bold', color: '#555' }}>
              Добавить новый запрос:
            </label>
            <input
              type="text"
              placeholder="Текст запроса..."
              disabled={isAdding}
              value={newQueryName}
              onChange={(e) => setNewQueryName(e.target.value)}
              style={{
                padding: '5px',
                border: '1px solid #bbb',
                fontSize: '13px',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={isAdding || !newQueryName.trim()}
              style={{
                background: '#ffcc00',
                border: '1px solid #997a00',
                padding: '5px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              {isAdding ? 'Добавление...' : 'Добавить строку'}
            </button>
            <ErpErrorBanner error={addError} title="Ошибка добавления:" />
          </form>
        </div>
      </div>
    </div>
  );
};

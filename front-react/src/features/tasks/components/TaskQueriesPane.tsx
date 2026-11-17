import React, { useState } from 'react';
import {
  useAddQueryToTaskMutation,
  useDeleteQueryFromTaskMutation,
  type Task,
} from '../tasksApi';
import { ErpErrorBanner } from '../../../components/ui/ErpErrorBanner';
import '../tasks.css';

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
    <div className="task-queries-pane">
      <div className="task-queries-header">
        📋 Запросы к задаче:{' '}
        <span className="task-queries-header-title">{task.title}</span>
      </div>

      <div className="task-queries-content">
        <div className="task-queries-table-wrap">
          <table className="task-queries-table">
            <thead>
              <tr>
                <th className="col-num">№</th>
                <th>Содержание запроса / Требование</th>
                <th className="col-action">Действие</th>
              </tr>
            </thead>
            <tbody>
              {task.queries && task.queries.length > 0 ? (
                task.queries.map((q, idx) => (
                  <tr key={q.id}>
                    <td className="cell-num">{idx + 1}</td>
                    <td className="cell-name">{q.name}</td>
                    <td className="cell-action">
                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={() => handleDelete(q.id)}
                        className="task-queries-delete-btn"
                        title="Удалить запрос"
                      >
                        ❌
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="task-queries-empty">
                    У данной задачи нет связанных запросов
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="task-queries-add-pane">
          <form onSubmit={handleAddSubmit} className="task-queries-add-form">
            <label className="task-queries-add-label">Добавить новый запрос:</label>
            <input
              type="text"
              className="task-queries-add-input"
              placeholder="Текст запроса..."
              disabled={isAdding}
              value={newQueryName}
              onChange={(e) => setNewQueryName(e.target.value)}
            />
            <button
              type="submit"
              disabled={isAdding || !newQueryName.trim()}
              className="task-queries-add-btn"
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

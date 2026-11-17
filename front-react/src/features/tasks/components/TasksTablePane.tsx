import React, { useState, useEffect } from 'react';
import {
  useGetTasksByProfileQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  type TaskFormData,
} from '../tasksApi';
import { ErpCommandBar } from '../../../components/ui/ErpCommandBar';
import { TaskForm } from './TaskForm';
import { TaskQueriesPane } from './TaskQueriesPane';
import '../tasks.css';

interface TasksTablePaneProps {
  profileId: number;
  currentUserId: number;
  employeeName: string;
  onToggleForm: (isOpen: boolean) => void;
}

export const TasksTablePane: React.FC<TasksTablePaneProps> = ({
  profileId,
  employeeName,
  onToggleForm,
}) => {
  const { data: tasks = [], isLoading, refetch } = useGetTasksByProfileQuery(profileId);

  const [createTask, { isLoading: isCreating, error: createError, reset: resetCreate }] =
    useCreateTaskMutation();
  const [updateTask, { isLoading: isUpdating, error: updateError, reset: resetUpdate }] =
    useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();

  const [search, setSearch] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formMode, setFormMode] = useState<'CREATE' | 'EDIT'>('CREATE');

  // Всегда берем актуальный объект задачи из свежего кэша RTK Query (включая обновленные queries)
  const selectedTask = tasks.find((t) => t.id === selectedTaskId) ?? null;

  // Сбрасываем выбранную задачу при смене сотрудника
  useEffect(() => {
    setSelectedTaskId(null);
    setIsEditing(false);
    setSearch('');
  }, [profileId]);

  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(search.toLowerCase()),
  );

  const handleCreateClick = () => {
    resetCreate();
    setFormMode('CREATE');
    setIsEditing(true);
    onToggleForm(true);
  };

  const handleEditClick = () => {
    if (!selectedTask) {
      alert('Выберите задачу из списка для изменения');
      return;
    }
    resetUpdate();
    setFormMode('EDIT');
    setIsEditing(true);
    onToggleForm(true);
  };

  const handleDeleteClick = async () => {
    if (!selectedTask) {
      alert('Выберите задачу из списка для удаления');
      return;
    }
    if (
      window.confirm(`Вы уверены, что хотите удалить задачу "${selectedTask.title}"?`)
    ) {
      try {
        await deleteTask(selectedTask.id).unwrap();
        setSelectedTaskId(null);
      } catch (err) {
        alert('Ошибка при удалении задачи');
      }
    }
  };

  const handleFormSave = async (formData: TaskFormData) => {
    try {
      if (formMode === 'CREATE') {
        await createTask(formData).unwrap();
      } else if (formMode === 'EDIT' && selectedTask) {
        await updateTask({ id: selectedTask.id, data: formData }).unwrap();
      }
      setIsEditing(false);
      onToggleForm(false);
      setSelectedTaskId(null);
    } catch (err) {
      console.warn('Ошибка валидации ДС, форма удержана открытой:', err);
    }
  };

  const handleCancelForm = () => {
    setIsEditing(false);
    onToggleForm(false);
  };

  if (isEditing) {
    return (
      <TaskForm
        task={formMode === 'EDIT' ? selectedTask : null}
        targetProfileId={profileId}
        onSave={handleFormSave}
        onCancel={handleCancelForm}
        isSaving={isCreating || isUpdating}
        saveError={formMode === 'CREATE' ? createError : updateError}
      />
    );
  }

  return (
    <div className="tasks-table-pane">
      <div className="tasks-table-top">
        <div className="tasks-table-header">
          Задачи сотрудника:{' '}
          <span className="tasks-table-header-name">{employeeName}</span> ({tasks.length})
        </div>

        <ErpCommandBar
          onCreate={handleCreateClick}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          onRefresh={() => refetch()}
        />

        <div className="tasks-table-search-box">
          <input
            type="text"
            className="tasks-table-search-input"
            placeholder="Поиск по краткому наименованию задачи..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="tasks-table-scroll">
          {isLoading ? (
            <div className="tasks-table-loading">Загрузка списка задач...</div>
          ) : filteredTasks.length === 0 ? (
            <div className="tasks-table-empty">Нет зарегистрированных задач</div>
          ) : (
            <table className="tasks-grid">
              <thead>
                <tr>
                  <th className="col-date">Дата / Время</th>
                  <th className="col-period">За период</th>
                  <th>Задача</th>
                  <th className="col-service">Услуга</th>
                  <th className="col-component">Компонент</th>
                  <th className="col-profile">Исполнитель</th>
                  <th className="col-author">Автор</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((task) => {
                  const isSelected = selectedTaskId === task.id;
                  const formattedMonth = String(task.month || 1).padStart(2, '0');
                  const periodValue = `${task.year || 1900}.${formattedMonth}`;

                  return (
                    <tr
                      key={task.id}
                      onClick={() => setSelectedTaskId(task.id)}
                      className={`tasks-grid-row ${isSelected ? 'tasks-grid-row--selected' : ''}`}
                    >
                      <td className="cell-date">
                        <div>{task.enterDate}</div>
                        <div className="tasks-grid-time">{task.enterTime}</div>
                      </td>
                      <td className="cell-period">{periodValue}</td>
                      <td>
                        <div className="tasks-grid-title">{task.title}</div>
                        <div className="tasks-grid-desc">{task.description}</div>
                      </td>
                      <td>{task.service?.name || '—'}</td>
                      <td>{task.component?.name || '—'}</td>
                      <td>
                        {task.profile.lastName} {task.profile.firstName}
                      </td>
                      <td>
                        {task.author.lastName} {task.author.firstName}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {selectedTask ? (
        <TaskQueriesPane task={selectedTask} />
      ) : (
        <div className="task-queries-placeholder">
          Для просмотра списка запросов выберите задачу
        </div>
      )}
    </div>
  );
};

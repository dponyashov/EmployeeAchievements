import React, { useState } from 'react';
import {
  useGetTasksByProfileQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  type Task,
  type TaskFormData,
} from '../tasksApi';
import { ErpCommandBar } from '../../../components/ui/ErpCommandBar';
import { TaskForm } from './TaskForm';
import { TaskQueriesPane } from './TaskQueriesPane';

interface TasksTablePaneProps {
  profileId: number;
  currentUserId: number;
  employeeName: string;
  onToggleForm: (isOpen: boolean) => void;
}

export const TasksTablePane: React.FC<TasksTablePaneProps> = ({
  profileId,
  currentUserId,
  employeeName,
  onToggleForm,
}) => {
  const { data: tasks = [], isLoading, refetch } = useGetTasksByProfileQuery(profileId);

  // Переименовываем error во избежание конфликта имен компиляции
  const [createTask, { isLoading: isCreating, error: createError, reset: resetCreate }] =
    useCreateTaskMutation();
  const [updateTask, { isLoading: isUpdating, error: updateError, reset: resetUpdate }] =
    useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();

  const [search, setSearch] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formMode, setFormMode] = useState<'CREATE' | 'EDIT'>('CREATE');

  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(search.toLowerCase()),
  );

  const handleCreateClick = () => {
    resetCreate();
    setFormMode('CREATE');
    setIsEditing(true);
    onToggleForm(true); // Скрыть список сотрудников
  };

  const handleEditClick = () => {
    if (!selectedTask) {
      alert('Выберите задачу из списка для изменения');
      return;
    }
    resetUpdate();
    setFormMode('EDIT');
    setIsEditing(true);
    onToggleForm(true); // Скрыть список сотрудников
  };

  // 🚀 Восстановленная функция удаления задачи
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
        setSelectedTask(null);
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
      onToggleForm(false); // Вернуть список сотрудников
      setSelectedTask(null);
    } catch (err) {
      console.warn('Ошибка валидации ДС, форма удержана открытой:', err);
    }
  };

  const handleCancelForm = () => {
    setIsEditing(false);
    onToggleForm(false); // Вернуть список сотрудников
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
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: '#fff',
        height: '100%',
      }}
    >
      <div
        style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
      >
        <div
          style={{
            padding: '8px',
            background: '#f5f5f5',
            borderBottom: '1px solid #ccc',
            fontWeight: 'bold',
          }}
        >
          Задачи сотрудника: <span style={{ color: '#2b579a' }}>{employeeName}</span> (
          {tasks.length})
        </div>

        <ErpCommandBar
          onCreate={handleCreateClick}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          onRefresh={() => refetch()}
        />

        <div
          style={{
            padding: '6px 10px',
            background: '#fafafa',
            borderBottom: '1px solid #ddd',
          }}
        >
          <input
            type="text"
            placeholder="Поиск по краткому наименованию задачи..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '4px 8px',
              border: '1px solid #bbb',
              boxSizing: 'border-box',
              fontSize: '13px',
              outline: 'none',
            }}
          />
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
          {isLoading ? (
            <div style={{ color: '#666' }}>Загрузка списка задач...</div>
          ) : filteredTasks.length === 0 ? (
            <div style={{ color: '#888', textAlign: 'center', marginTop: '10px' }}>
              Нет зарегистрированных задач
            </div>
          ) : (
            <table
              style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}
            >
              <thead>
                <tr
                  style={{
                    background: '#f5f5f5',
                    textAlign: 'left',
                    borderBottom: '2px solid #ccc',
                  }}
                >
                  <th
                    style={{ padding: '6px', border: '1px solid #ddd', width: '100px' }}
                  >
                    Дата / Время
                  </th>
                  <th
                    style={{
                      padding: '6px',
                      border: '1px solid #ddd',
                      width: '90px',
                      textAlign: 'center',
                    }}
                  >
                    За период
                  </th>
                  <th style={{ padding: '6px', border: '1px solid #ddd' }}>Задача</th>
                  <th
                    style={{ padding: '6px', border: '1px solid #ddd', width: '150px' }}
                  >
                    Услуга
                  </th>
                  <th
                    style={{ padding: '6px', border: '1px solid #ddd', width: '150px' }}
                  >
                    Компонент
                  </th>
                  <th
                    style={{ padding: '6px', border: '1px solid #ddd', width: '150px' }}
                  >
                    Исполнитель
                  </th>
                  <th
                    style={{ padding: '6px', border: '1px solid #ddd', width: '150px' }}
                  >
                    Автор
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((task) => {
                  const isSelected = selectedTask?.id === task.id;
                  const formattedMonth = String(task.month || 1).padStart(2, '0');
                  const periodValue = `${task.year || 1900}.${formattedMonth}`;

                  return (
                    <tr
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      style={{
                        borderBottom: '1px solid #eee',
                        background: isSelected ? '#ffecb3' : 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      <td
                        style={{
                          padding: '6px',
                          border: '1px solid #ddd',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <div>{task.enterDate}</div>
                        <div style={{ fontSize: '11px', color: '#666' }}>
                          {task.enterTime}
                        </div>
                      </td>
                      <td
                        style={{
                          padding: '6px',
                          border: '1px solid #ddd',
                          textAlign: 'center',
                          fontFamily: 'monospace',
                          fontWeight: 'bold',
                          color: '#555',
                        }}
                      >
                        {periodValue}
                      </td>
                      <td style={{ padding: '6px', border: '1px solid #ddd' }}>
                        <div style={{ fontWeight: 'bold' }}>{task.title}</div>
                        <div
                          style={{ fontSize: '11px', color: '#555', marginTop: '2px' }}
                        >
                          {task.description}
                        </div>
                      </td>
                      <td
                        style={{
                          padding: '6px',
                          border: '1px solid #ddd',
                          color: '#444',
                        }}
                      >
                        {task.service?.name || '—'}
                      </td>
                      <td
                        style={{
                          padding: '6px',
                          border: '1px solid #ddd',
                          color: '#444',
                        }}
                      >
                        {task.component?.name || '—'}
                      </td>
                      <td
                        style={{
                          padding: '6px',
                          border: '1px solid #ddd',
                          fontSize: '12px',
                        }}
                      >
                        {task.profile.lastName} {task.profile.firstName}.
                      </td>
                      <td
                        style={{
                          padding: '6px',
                          border: '1px solid #ddd',
                          fontSize: '12px',
                        }}
                      >
                        {task.author.lastName} {task.author.firstName}.
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {selectedTask &&
        (() => {
          const currentActiveTask = tasks.find((t) => t.id === selectedTask.id);
          return <TaskQueriesPane task={currentActiveTask || selectedTask} />;
        })()}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  type Task,
  useGetServicesDirectoryQuery,
  useGetComponentsDirectoryQuery,
  type TaskFormData,
} from '../tasksApi';
import { ErpFormButtons } from '../../../components/ui/ErpFormButtons';
import { ErpCombobox } from '../../../components/ui/ErpCombobox';
import { ErpErrorBanner } from '../../../components/ui/ErpErrorBanner';
import '../tasks.css';

interface TaskFormProps {
  task: Task | null;
  targetProfileId: number;
  onSave: (data: TaskFormData) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
  saveError: any;
}

export const TaskForm: React.FC<TaskFormProps> = ({
  task,
  targetProfileId,
  onSave,
  onCancel,
  isSaving,
  saveError,
}) => {
  const { data: services = [] } = useGetServicesDirectoryQuery();
  const { data: components = [] } = useGetComponentsDirectoryQuery();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [serviceId, setServiceId] = useState<number>(0);
  const [componentId, setComponentId] = useState<number>(0);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setYear(task.year || new Date().getFullYear());
      setMonth(task.month || new Date().getMonth() + 1);
      setServiceId(task.service?.id || 0);
      setComponentId(task.component?.id || 0);
    } else {
      setTitle('');
      setDescription('');
      setYear(new Date().getFullYear());
      setMonth(new Date().getMonth() + 1);
      setServiceId(0);
      setComponentId(0);
    }
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const payload: TaskFormData = {
      title,
      description,
      year: Number(year),
      month: Number(month),
      profileId: targetProfileId,
      serviceId,
      componentId,
    };

    await onSave(payload);
  };

  return (
    <div className="task-form-container">
      <div className="task-form-header">
        {task ? `Редактирование задачи №${task.id}` : 'Создание новой задачи'}
      </div>

      <form onSubmit={handleSubmit} className="task-form-body">
        <div className="task-form-fields">
          <ErpErrorBanner
            error={saveError}
            title="Не удалось записать задачу (ошибка валидации):"
          />

          <div className="task-form-group">
            <label className="task-form-label">Краткое наименование задачи *</label>
            <input
              type="text"
              required
              disabled={isSaving}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="task-form-input"
            />
          </div>

          <div className="task-form-group">
            <label className="task-form-label">Подробное описание бизнес-процесса</label>
            <textarea
              rows={4}
              disabled={isSaving}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="task-form-textarea"
            />
          </div>

          <div className="task-form-row">
            <div className="task-form-group task-form-group--half">
              <label className="task-form-label">Год</label>
              <input
                type="number"
                disabled={isSaving}
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="task-form-input"
              />
            </div>

            <div className="task-form-group task-form-group--half">
              <label className="task-form-label">Месяц (номер)</label>
              <input
                type="number"
                min={1}
                max={12}
                disabled={isSaving}
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="task-form-input"
              />
            </div>
          </div>

          <ErpCombobox
            label="Услуга (НСИ)"
            items={services}
            selectedId={serviceId}
            disabled={isSaving}
            onChange={(id) => setServiceId(id)}
            placeholder="Начните ввод для выбора услуги..."
          />

          <ErpCombobox
            label="Компонент услуги (НСИ)"
            items={components}
            selectedId={componentId}
            disabled={isSaving}
            onChange={(id) => setComponentId(id)}
            placeholder="Начните ввод для выбора компонента..."
          />
        </div>

        <div className="task-form-footer">
          <ErpFormButtons onCancel={onCancel} />
        </div>
      </form>
    </div>
  );
};

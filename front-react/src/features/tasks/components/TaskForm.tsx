import React, { useState, useEffect } from 'react';
import {
  type Task,
  useGetServicesDirectoryQuery,
  useGetComponentsDirectoryQuery,
  type TaskFormData,
} from '../tasksApi';
import { ErpFormButtons } from '../../../components/ui/ErpFormButtons';
import { ErpCombobox } from '../../../components/ui/ErpCombobox';
import { ErpErrorBanner } from '../../../components/ui/ErpErrorBanner'; // 🚀 Импортируем новый UI-компонент

interface TaskFormProps {
  task: Task | null;
  targetProfileId: number; // 🌟 Заменили прошлый currentUserId на целевой ID профиля сотрудника
  onSave: (data: TaskFormData) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
  saveError: any;
}

export const TaskForm: React.FC<TaskFormProps> = ({
  task,
  targetProfileId, // Принимаем целевой ID профиля
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

    console.log('TaskForm.targetProfileId', targetProfileId);

    const payload: TaskFormData = {
      title,
      description,
      year: Number(year),
      month: Number(month),
      profileId: targetProfileId, // 🌟 Теперь подставляется правильный ID сотрудника
      serviceId,
      componentId,
    };

    await onSave(payload);
  };

  return (
    <div
      style={{
        flex: 1,
        padding: '15px',
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          background: '#ffcc00',
          padding: '6px 12px',
          fontWeight: 'bold',
          border: '1px solid #ccc',
          borderBottom: 'none',
          fontSize: '13px',
        }}
      >
        {task ? `Редактирование задачи №${task.id}` : 'Создание новой задачи'}
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          border: '1px solid #ccc',
          padding: '15px',
          background: '#fafafa',
          flex: 1,
          overflowY: 'auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            maxWidth: '600px',
            fontSize: '13px',
          }}
        >
          {/* 🚀 Декларативный вывод ошибок через универсальный UI-компонент над первым полем ввода */}
          <ErpErrorBanner
            error={saveError}
            title="Не удалось записать задачу (ошибка валидации):"
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontWeight: 'bold', color: '#333' }}>
              Краткое наименование задачи *
            </label>
            <input
              type="text"
              required
              disabled={isSaving}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ padding: '5px', border: '1px solid #bbb', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontWeight: 'bold', color: '#333' }}>
              Подробное описание бизнес-процесса
            </label>
            <textarea
              rows={4}
              disabled={isSaving}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                padding: '5px',
                border: '1px solid #bbb',
                outline: 'none',
                resize: 'vertical',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '15px' }}>
            <div
              style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}
            >
              <label style={{ fontWeight: 'bold', color: '#333' }}>Год</label>
              <input
                type="number"
                disabled={isSaving}
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                style={{ padding: '5px', border: '1px solid #bbb' }}
              />
            </div>
            <div
              style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}
            >
              <label style={{ fontWeight: 'bold', color: '#333' }}>Месяц (номер)</label>
              <input
                type="number"
                min={1}
                max={12}
                disabled={isSaving}
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                style={{ padding: '5px', border: '1px solid #bbb' }}
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

        <div
          style={{ marginTop: '20px', borderTop: '1px solid #ccc', paddingTop: '10px' }}
        >
          <ErpFormButtons onCancel={onCancel} />
        </div>
      </form>
    </div>
  );
};

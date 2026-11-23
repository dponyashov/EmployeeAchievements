import React from 'react';
import type { TestSettingsFormProps } from '../../types/testEditor.types';

export const TestSettingsForm: React.FC<TestSettingsFormProps> = ({
  settings,
  onChange,
}) => {
  return (
    <div className="sub-view">
      <div className="dir-section-header">
        <strong>Основные параметры теста</strong>
      </div>

      <div className="bookings-form-row">
        <label>Название теста *</label>
        <input
          type="text"
          className="bookings-form-input"
          value={settings.title}
          onChange={(e) => onChange('title', e.target.value)}
          placeholder="Например: Проверка знаний по охране труда"
        />
      </div>

      <div className="bookings-form-row">
        <label>Описание / инструкция</label>
        <textarea
          className="bookings-form-input"
          rows={2}
          value={settings.description}
          onChange={(e) => onChange('description', e.target.value)}
          placeholder="Краткое описание или пояснение для сотрудников"
        />
      </div>

      <div className="bookings-form-row">
        <label>Вопросов в одной попытке *</label>
        <input
          type="number"
          min={1}
          max={200}
          className="bookings-form-input"
          value={settings.questionsLimit}
          onChange={(e) =>
            onChange('questionsLimit', Math.max(1, Number(e.target.value) || 1))
          }
        />
      </div>

      <div className="bookings-form-row">
        <label>Проходной балл (% верных для «Сдал») *</label>
        <input
          type="number"
          min={1}
          max={100}
          className="bookings-form-input"
          value={settings.passScorePercent}
          onChange={(e) =>
            onChange(
              'passScorePercent',
              Math.min(100, Math.max(1, Number(e.target.value) || 80)),
            )
          }
        />
      </div>

      <div className="bookings-form-row">
        <label>Ограничение по времени</label>
        <div className="bookings-toolbar-right">
          <label>
            <input
              type="checkbox"
              checked={settings.hasTimeLimit}
              onChange={(e) => onChange('hasTimeLimit', e.target.checked)}
            />{' '}
            Ограничить время прохождения
          </label>
          {settings.hasTimeLimit && (
            <input
              type="number"
              min={1}
              max={300}
              className="bookings-form-input"
              value={settings.timeLimitMinutes}
              onChange={(e) =>
                onChange('timeLimitMinutes', Math.max(1, Number(e.target.value) || 15))
              }
            />
          )}
          {settings.hasTimeLimit && <span>мин.</span>}
        </div>
      </div>

      <div className="bookings-form-row">
        <label>Обучающий режим</label>
        <label>
          <input
            type="checkbox"
            checked={settings.allowTraining}
            onChange={(e) => onChange('allowTraining', e.target.checked)}
          />{' '}
          Разрешить обучающее тестирование (без фиксации результатов)
        </label>
      </div>

      <div className="bookings-form-row">
        <label>Видимость теста</label>
        <label>
          <input
            type="checkbox"
            checked={settings.isHidden}
            onChange={(e) => onChange('isHidden', e.target.checked)}
          />{' '}
          Скрыть тест от пользователей
        </label>
      </div>
    </div>
  );
};

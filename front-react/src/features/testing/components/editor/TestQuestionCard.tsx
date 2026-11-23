import React from 'react';
import type { TestQuestionCardProps } from '../../types/testEditor.types';

export const TestQuestionCard: React.FC<TestQuestionCardProps> = ({
  question,
  index,
  canRemoveQuestion,
  onChangeText,
  onRemoveQuestion,
  onAddOption,
  onChangeOption,
  onRemoveOption,
}) => {
  return (
    <div className="testing-editor-question-card">
      <div className="dir-section-header">
        <strong>Вопрос №{index + 1}</strong>
        {canRemoveQuestion && (
          <button
            type="button"
            className="erp-cmd-btn"
            onClick={() => onRemoveQuestion(index)}
          >
            🗑️ Удалить вопрос
          </button>
        )}
      </div>

      <div className="bookings-form-row">
        <label>Формулировка вопроса *</label>
        <textarea
          className="bookings-form-input"
          rows={2}
          value={question.questionText}
          onChange={(e) => onChangeText(index, e.target.value)}
          placeholder="Введите текст вопроса..."
        />
      </div>

      <div className="dir-item-form-label">Варианты ответов:</div>

      {question.options.map((opt, oIndex) => (
        <div key={oIndex} className="testing-editor-option-row">
          <input
            type="text"
            className="bookings-form-input text-center"
            value={opt.code}
            maxLength={5}
            onChange={(e) =>
              onChangeOption(index, oIndex, 'code', e.target.value.toLowerCase())
            }
            placeholder="Код"
            title="Символьный код ответа (a, b, c...)"
          />

          <input
            type="text"
            className="bookings-form-input"
            value={opt.optionText}
            onChange={(e) => onChangeOption(index, oIndex, 'optionText', e.target.value)}
            placeholder={`Текст варианта №${oIndex + 1}`}
          />

          <label>
            <input
              type="checkbox"
              checked={opt.isCorrect}
              onChange={(e) =>
                onChangeOption(index, oIndex, 'isCorrect', e.target.checked)
              }
            />{' '}
            Верный
          </label>

          {question.options.length > 2 ? (
            <button
              type="button"
              className="erp-cmd-btn"
              onClick={() => onRemoveOption(index, oIndex)}
              title="Удалить вариант ответа"
            >
              ✕
            </button>
          ) : (
            <span />
          )}
        </div>
      ))}

      <div className="bookings-toolbar-right">
        <button type="button" className="erp-cmd-btn" onClick={() => onAddOption(index)}>
          ➕ Добавить вариант ответа
        </button>
      </div>
    </div>
  );
};

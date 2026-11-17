import React from 'react';
import './ui.css';

interface ErpFormButtonsProps {
  onSave?: () => void;
  onCancel: () => void;
  saveText?: string;
  cancelText?: string;
  disabled?: boolean;
}

export const ErpFormButtons: React.FC<ErpFormButtonsProps> = ({
  onSave,
  onCancel,
  saveText = 'Записать',
  cancelText = 'Закрыть',
  disabled = false,
}) => {
  return (
    <div className="erp-form-buttons">
      <button
        type="submit"
        className="erp-btn-primary erp-form-btn-save"
        onClick={onSave}
        disabled={disabled}
      >
        {saveText}
      </button>
      <button
        type="button"
        className="erp-cmd-btn"
        onClick={onCancel}
        disabled={disabled}
      >
        {cancelText}
      </button>
    </div>
  );
};

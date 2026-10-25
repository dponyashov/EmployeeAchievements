import React from 'react';

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
    <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
      <button
        type="submit"
        className="erp-btn-primary"
        onClick={onSave}
        disabled={disabled}
        style={{ width: '110px' }}
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

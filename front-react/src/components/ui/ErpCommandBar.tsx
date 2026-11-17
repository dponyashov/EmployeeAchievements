import React from 'react';
import './ui.css';

interface ErpCommandBarProps {
  onCreate: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onRefresh: () => void;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}

export const ErpCommandBar: React.FC<ErpCommandBarProps> = ({
  onCreate,
  onEdit,
  onDelete,
  onRefresh,
  searchPlaceholder,
  searchValue,
  onSearchChange,
}) => {
  return (
    <div className="erp-command-bar-wrapper">
      <div className="erp-command-bar erp-command-bar-row">
        <button className="erp-cmd-btn font-bold" onClick={onCreate}>
          ➕ Создать
        </button>
        <button className="erp-cmd-btn" onClick={onEdit}>
          ✏️ Изменить
        </button>
        <button className="erp-cmd-btn erp-cmd-btn--danger" onClick={onDelete}>
          ❌ Удалить
        </button>
        <button className="erp-cmd-btn" onClick={onRefresh}>
          🔄 Обновить
        </button>
      </div>

      {onSearchChange && (
        <div className="erp-search-row">
          <input
            type="text"
            className="erp-search-input erp-search-input-field"
            placeholder={searchPlaceholder || 'Поиск...'}
            value={searchValue || ''}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      )}
    </div>
  );
};

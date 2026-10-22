import React from 'react';

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
    <div
      className="erp-command-bar-wrapper"
      style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
    >
      {/* Верхний ряд: Кнопки манипуляции данными 1С */}
      <div
        className="erp-command-bar"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          borderBottom: 'none',
          padding: 0,
        }}
      >
        <button className="erp-cmd-btn font-bold" onClick={onCreate}>
          ➕ Создать
        </button>
        <button className="erp-cmd-btn" onClick={onEdit}>
          ✏️ Изменить
        </button>
        <button className="erp-cmd-btn" onClick={onDelete} style={{ color: '#A30000' }}>
          ❌ Удалить
        </button>
        <button className="erp-cmd-btn" onClick={onRefresh}>
          🔄 Обновить
        </button>
      </div>

      {/* Нижний ряд: Строка поиска, вынесенная под кнопки с верхним отступом */}
      {onSearchChange && (
        <div className="erp-search-row" style={{ marginTop: '4px', paddingLeft: '2px' }}>
          <input
            type="text"
            className="erp-search-input"
            style={{
              width: '100%',
              maxWidth: '350px',
              float: 'none',
              margin: 0,
              padding: '4px 6px',
              border: '1px solid #C4C4C4',
              fontSize: '13px',
            }}
            placeholder={searchPlaceholder || 'Поиск...'}
            value={searchValue || ''}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      )}
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import './ui.css';

export interface ErpColumnOption<T extends string = string> {
  key: T;
  label: string;
}

interface ErpColumnSelectorProps<T extends string> {
  columns: ErpColumnOption<T>[];
  visibleColumns: Record<T, boolean>;
  onToggleColumn: (key: T) => void;
  onShowAll: () => void;
  extraActions?: React.ReactNode;
}

export function ErpColumnSelector<T extends string>({
  columns,
  visibleColumns,
  onToggleColumn,
  onShowAll,
  extraActions,
}: ErpColumnSelectorProps<T>) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const visibleCount = columns.filter((col) => visibleColumns[col.key]).length;
  const hiddenCount = columns.length - visibleCount;

  return (
    <div className="erp-col-selector-bar">
      <div className="erp-col-selector-hint">
        {hiddenCount > 0 && (
          <span>
            Скрыто столбцов: <strong>{hiddenCount}</strong> из {columns.length}
          </span>
        )}
      </div>

      <div className="erp-col-selector-actions">
        {extraActions}
        <div ref={menuRef} className="erp-col-selector-menu-wrap">
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className={`erp-col-selector-btn ${
              menuOpen ? 'erp-col-selector-btn--open' : ''
            }`}
          >
            <span>⚙️ Настройка колонок</span>
            {hiddenCount > 0 && (
              <span className="erp-col-selector-badge">
                {visibleCount}/{columns.length}
              </span>
            )}
            <span className="erp-col-selector-arrow">▾</span>
          </button>

          {menuOpen && (
            <div className="erp-col-selector-dropdown">
              <div className="erp-col-selector-dropdown-title">Отображаемые столбцы</div>

              {columns.map((col) => {
                const isChecked = visibleColumns[col.key];
                const isLastVisible = isChecked && visibleCount <= 1;

                return (
                  <label
                    key={col.key}
                    className={`erp-col-selector-option ${
                      isLastVisible ? 'erp-col-selector-option--disabled' : ''
                    }`}
                    title={
                      isLastVisible
                        ? 'Нельзя скрыть последний видимый столбец'
                        : undefined
                    }
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      disabled={isLastVisible}
                      onChange={() => onToggleColumn(col.key)}
                    />
                    <span>{col.label}</span>
                  </label>
                );
              })}

              {hiddenCount > 0 && (
                <button
                  type="button"
                  onClick={onShowAll}
                  className="erp-col-selector-reset-btn"
                >
                  Показать все столбцы
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

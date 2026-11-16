import { useState, useRef, useEffect } from 'react';

export interface ErpColumnOption<T extends string = string> {
  key: T;
  label: string;
}

interface ErpColumnSelectorProps<T extends string> {
  columns: ErpColumnOption<T>[];
  visibleColumns: Record<T, boolean>;
  onToggleColumn: (key: T) => void;
  onShowAll: () => void;
  extraActions?: React.ReactNode; // <-- Дополнительные кнопки рядом с настройкой колонок
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
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '6px',
        fontSize: '12px',
      }}
    >
      <div style={{ color: '#666' }}>
        {hiddenCount > 0 && (
          <span>
            Скрыто столбцов: <strong>{hiddenCount}</strong> из {columns.length}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {extraActions}
        <div ref={menuRef} style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            style={{
              padding: '4px 10px',
              background: menuOpen ? '#e6e6e6' : '#f5f5f5',
              border: '1px solid #aaa',
              cursor: 'pointer',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#333',
            }}
          >
            <span>⚙️ Настройка колонок</span>
            {hiddenCount > 0 && (
              <span
                style={{
                  background: '#ffcc00',
                  border: '1px solid #997a00',
                  padding: '0 5px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                }}
              >
                {visibleCount}/{columns.length}
              </span>
            )}
            <span style={{ fontSize: '10px' }}>▾</span>
          </button>

          {menuOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 2px)',
                right: 0,
                width: '210px',
                background: '#fff',
                border: '1px solid #999',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.18)',
                padding: '8px',
                zIndex: 100,
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              <div
                style={{
                  fontWeight: 'bold',
                  fontSize: '11px',
                  color: '#555',
                  borderBottom: '1px solid #eee',
                  paddingBottom: '4px',
                }}
              >
                Отображаемые столбцы
              </div>

              {columns.map((col) => {
                const isChecked = visibleColumns[col.key];
                const isLastVisible = isChecked && visibleCount <= 1;

                return (
                  <label
                    key={col.key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: isLastVisible ? 'not-allowed' : 'pointer',
                      fontSize: '12px',
                      color: isLastVisible ? '#999' : '#333',
                      userSelect: 'none',
                    }}
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
                  style={{
                    marginTop: '4px',
                    padding: '4px 8px',
                    background: '#ffcc00',
                    border: '1px solid #997a00',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    color: '#333',
                  }}
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

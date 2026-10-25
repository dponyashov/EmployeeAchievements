import React, { useState, useRef, useEffect } from 'react';

interface ErpComboboxItem {
  id: number;
  name: string;
}

interface ErpComboboxProps {
  label: string;
  items: ErpComboboxItem[];
  selectedId: number;
  onChange: (id: number, name: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const ErpCombobox: React.FC<ErpComboboxProps> = ({
  label,
  items,
  selectedId,
  onChange,
  placeholder = 'Начните ввод для поиска...',
  disabled = false,
}) => {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Синхронизируем внутренний текст поиска с выбранным элементом при изменении извне
  useEffect(() => {
    const selectedItem = items.find((item) => item.id === selectedId);
    if (selectedItem) {
      setSearch(selectedItem.name);
    } else if (selectedId === 0) {
      setSearch('');
    }
  }, [selectedId, items]);

  // Закрытие списка при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // Если ничего не выбрано, возвращаем текст к предыдущему валидному значению
        const selectedItem = items.find((item) => item.id === selectedId);
        setSearch(selectedItem ? selectedItem.name : '');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedId, items]);

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        position: 'relative',
      }}
    >
      <label style={{ fontWeight: 'bold', color: '#333' }}>{label}</label>

      <div
        style={{
          display: 'flex',
          border: '1px solid #bbb',
          background: disabled ? '#f0f0f0' : '#fff',
        }}
      >
        <input
          type="text"
          placeholder={placeholder}
          disabled={disabled}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
            if (selectedId !== 0) {
              onChange(0, ''); // Сбрасываем выбор при редактировании строки
            }
          }}
          onFocus={() => !disabled && setIsOpen(true)}
          style={{
            flex: 1,
            padding: '5px',
            border: 'none',
            outline: 'none',
            background: 'transparent',
          }}
        />
        {selectedId > 0 && (
          <span
            style={{
              padding: '5px',
              color: 'green',
              fontSize: '11px',
              alignSelf: 'center',
              userSelect: 'none',
            }}
          >
            ✓
          </span>
        )}
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          style={{
            padding: '0 8px',
            background: '#e6e6e6',
            borderLeft: '1px solid #bbb',
            borderTop: 'none',
            borderRight: 'none',
            borderBottom: 'none',
            cursor: disabled ? 'default' : 'pointer',
          }}
        >
          ▼
        </button>
      </div>

      {/* Выпадающее окно в стиле Платформы 1С */}
      {isOpen && !disabled && filteredItems.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: '#fff',
            border: '1px solid #ccc',
            zIndex: 100,
            maxHeight: '150px',
            overflowY: 'auto',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          {filteredItems.map((item) => {
            const isCurrent = item.id === selectedId;
            return (
              <div
                key={item.id}
                onClick={() => {
                  onChange(item.id, item.name);
                  setSearch(item.name);
                  setIsOpen(false);
                }}
                style={{
                  padding: '6px 10px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #eee',
                  background: isCurrent ? '#ffecb3' : 'transparent',
                  fontWeight: isCurrent ? 'bold' : 'normal',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#ffecb3')}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = isCurrent
                    ? '#ffecb3'
                    : 'transparent')
                }
              >
                {item.name}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

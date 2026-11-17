import React, { useState, useRef, useEffect } from 'react';
import './ui.css';

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

  useEffect(() => {
    const selectedItem = items.find((item) => item.id === selectedId);
    if (selectedItem) {
      setSearch(selectedItem.name);
    } else if (selectedId === 0) {
      setSearch('');
    }
  }, [selectedId, items]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
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
    <div ref={containerRef} className="erp-combobox">
      <label className="erp-combobox-label">{label}</label>

      <div
        className={`erp-combobox-control ${
          disabled ? 'erp-combobox-control--disabled' : ''
        }`}
      >
        <input
          type="text"
          className="erp-combobox-input"
          placeholder={placeholder}
          disabled={disabled}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
            if (selectedId !== 0) {
              onChange(0, '');
            }
          }}
          onFocus={() => !disabled && setIsOpen(true)}
        />
        {selectedId > 0 && <span className="erp-combobox-check">✓</span>}
        <button
          type="button"
          className="erp-combobox-toggle"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
        >
          ▼
        </button>
      </div>

      {isOpen && !disabled && filteredItems.length > 0 && (
        <div className="erp-combobox-dropdown">
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
                className={`erp-combobox-option ${
                  isCurrent ? 'erp-combobox-option--selected' : ''
                }`}
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

// src/features/directories/components/DepartmentComponents.tsx
import React, { useState, useEffect } from 'react';
import { ErpFormButtons } from '../../../components/ui/ErpFormButtons';
import { ErpCommandBar } from '../../../components/ui/ErpCommandBar';

interface DepartmentListProps {
  data: any[];
  selectedId: number | null;
  onSelectRow: (id: number) => void;
  onDoubleClickRow: (id: number) => void;
  onCreate: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onRefresh: () => void;
}

// 1. КОМПОНЕНТ СПИСКА ОТДЕЛОВ С УПРАВЛЕНИЕМ И КОМАНДНОЙ ПАНЕЛЬЮ
export const DepartmentList: React.FC<DepartmentListProps> = ({
  data,
  selectedId,
  onSelectRow,
  onDoubleClickRow,
  onCreate,
  onEdit,
  onDelete,
  onRefresh,
}) => (
  <div className="erp-directory-container">
    <div className="erp-directory-header">
      <h2>Справочник "Структурные подразделения (Отделы)"</h2>
    </div>

    {/* Командная панель в едином стиле */}
    <ErpCommandBar
      onCreate={onCreate}
      onEdit={onEdit}
      onDelete={onDelete}
      onRefresh={onRefresh}
    />

    {/* Табличная часть динамического списка */}
    <div className="erp-table-wrapper">
      <table className="erp-v8-table">
        <thead>
          <tr>
            <th style={{ width: '100px' }}>Код отдела</th>
            <th>Наименование подразделения</th>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((item) => {
              const isSelected = selectedId === item.id;
              return (
                <tr
                  key={item.id}
                  onClick={() => onSelectRow(item.id)}
                  onDoubleClick={() => onDoubleClickRow(item.id)}
                  className={isSelected ? 'erp-row-selected' : ''}
                  style={{ backgroundColor: isSelected ? '#C1D9FF' : undefined }}
                >
                  <td className="text-center">{item.id}</td>
                  <td className="font-medium">{item.name}</td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={2} className="erp-empty-table">
                В информационной базе нет зарегистрированных отделов.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

// 2. КОМПОНЕНТ ФОРМЫ ЭЛЕМЕНТА ОТДЕЛА С ПОДДЕРЖКОЙ ЖИВОГО ЗАПОЛНЕНИЯ ИЗ REST (PATCH)
export const DepartmentForm: React.FC<{
  item?: any;
  onSave: (data: any) => void;
  onCancel: () => void;
}> = ({ item, onSave, onCancel }) => {
  const [name, setName] = useState('');

  // Наполняем input, когда асинхронный JSON от REST-сервиса долетает до клиента
  useEffect(() => {
    if (item && item.name) {
      setName(item.name);
    }
  }, [item]);

  return (
    <div className="sub-view">
      <h3
        style={{
          margin: '0 0 15px 0',
          fontWeight: 'normal',
          borderBottom: '1px solid #D3D3D3',
          paddingBottom: '5px',
        }}
      >
        Карточка подразделения (Редактирование)
      </h3>
      <div className="erp-form-group">
        <label style={{ color: '#777', marginBottom: '4px' }}>Название отдела:</label>
        <input
          style={{
            padding: '5px',
            width: '350px',
            border: '1px solid #C4C4C4',
            outline: 'none',
          }}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <ErpFormButtons onSave={() => onSave({ name })} onCancel={onCancel} />
    </div>
  );
};

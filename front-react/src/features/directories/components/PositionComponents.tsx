import React, { useState, useEffect } from 'react';
import { ErpCommandBar } from '../../../components/ui/ErpCommandBar';
import { ErpFormButtons } from '../../../components/ui/ErpFormButtons';

interface PositionListProps {
  data: any[];
  selectedId: number | null;
  onSelectRow: (id: number) => void;
  onDoubleClickRow: (id: number) => void;
  onCreate: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onRefresh: () => void;
}

export const PositionList: React.FC<PositionListProps> = ({
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
      <h2>Справочник "Должности"</h2>
    </div>

    {/* Универсальная Командная панель */}
    <ErpCommandBar
      onCreate={onCreate}
      onEdit={onEdit}
      onDelete={onDelete}
      onRefresh={onRefresh}
    />

    <div className="erp-table-wrapper">
      <table className="erp-v8-table">
        <thead>
          <tr>
            <th style={{ width: '80px' }}>Код</th>
            <th>Наименование должности</th>
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
                  /* Если строка выделена, навешиваем класс подсветки */
                  className={isSelected ? 'erp-row-selected' : ''}
                  style={{ backgroundColor: isSelected ? '#C1D9FF' : undefined }}
                >
                  <td className="text-center">{item.id}</td>
                  <td>{item.name}</td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={2} className="erp-empty-table">
                В информационной базе нет записей.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

// Компонент формы (PositionForm с useEffect остается без изменений из прошлого шага)
export const PositionForm: React.FC<{
  item?: any;
  onSave: (data: any) => void;
  onCancel: () => void;
}> = ({ item, onSave, onCancel }) => {
  const [name, setName] = useState('');
  useEffect(() => {
    if (item?.name) setName(item.name);
  }, [item]);

  return (
    <div className="sub-view">
      <h3>Должность (Элемент)</h3>
      <div className="erp-form-group">
        <label>Наименование:</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ padding: '4px', width: '300px' }}
        />
      </div>
      <div style={{ marginTop: '15px' }}>
        <ErpFormButtons onSave={() => onSave({ name })} onCancel={onCancel} />
      </div>
    </div>
  );
};

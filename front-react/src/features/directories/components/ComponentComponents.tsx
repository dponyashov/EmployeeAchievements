import React, { useState, useEffect } from 'react';
import { ErpCommandBar } from '../../../components/ui/ErpCommandBar';
import { ErpFormButtons } from '../../../components/ui/ErpFormButtons';

interface ComponentListProps {
  data: any[];
  selectedId: number | null;
  onSelectRow: (id: number) => void;
  onDoubleClickRow: (id: number) => void;
  onCreate: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onRefresh: () => void;
}

// 1. КОМПОНЕНТ СПИСКА КОМПОНЕНТОВ С КОМАНДНОЙ ПАНЕЛЬЮ
export const ComponentList: React.FC<ComponentListProps> = ({
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
      <h2>Справочник "Компоненты услуг"</h2>
    </div>

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
            <th style={{ width: '100px' }}>Код элемента</th>
            <th>Наименование компонента</th>
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
              <td colSpan={3} className="erp-empty-table">
                В информационной базе нет зарегистрированных компонентов.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

// 2. ИСПРАВЛЕННЫЙ КОМПОНЕНТ ФОРМЫ КОМПОНЕНТА (Хуки строго на верхнем уровне)
export const ComponentForm: React.FC<{
  item?: any;
  onSave: (data: any) => void;
  onCancel: () => void;
}> = ({ item, onSave, onCancel }) => {
  const [name, setName] = useState('');

  // Логика проверки перенесена внутрь эффекта — теперь порядок хуков никогда не нарушится
  useEffect(() => {
    if (item) {
      setName(item.name || '');
    } else {
      setName('');
    }
  }, [item]);

  return (
    <div className="sub-view" style={{ padding: '20px', background: '#FFF' }}>
      <h3
        style={{
          margin: '0 0 15px 0',
          fontWeight: 'normal',
          borderBottom: '1px solid #D3D3D3',
          paddingBottom: '5px',
        }}
      >
        Элемент спецификации (Редактирование)
      </h3>
      <div className="erp-form-group">
        <label style={{ color: '#777', marginBottom: '4px' }}>
          Наименование компонента:
        </label>
        <input
          style={{
            padding: '5px',
            width: '350px',
            border: '1px solid #C4C4C4',
            outline: 'none',
            marginBottom: '15px',
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

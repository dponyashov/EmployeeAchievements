import React, { useState, useEffect } from 'react';
import { ErpFormButtons } from '../../../components/ui/ErpFormButtons';
import { ErpCommandBar } from '../../../components/ui/ErpCommandBar';

interface ServiceListProps {
  data: any[];
  selectedId: number | null;
  onSelectRow: (id: number) => void;
  onDoubleClickRow: (id: number) => void;
  onCreate: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onRefresh: () => void;
}

// 1. КОМПОНЕНТ СПИСКА УСЛУГ С КОМАНДНОЙ ПАНЕЛЬЮ
export const ServiceList: React.FC<ServiceListProps> = ({
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
      <h2>Справочник "Номенклатура услуг"</h2>
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
            <th style={{ width: '100px' }}>Код услуги</th>
            <th>Наименование услуги</th>
            <th style={{ width: '150px' }}>Тариф (руб.)</th>
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
                  {/* <td>
                    {item.price !== undefined
                      ? Number(item.price).toLocaleString('ru-RU', {
                          minimumFractionDigits: 2,
                        })
                      : '0,00'}
                  </td> */}
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={3} className="erp-empty-table">
                В информационной базе нет зарегистрированных услуг.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

// 2. ИСПРАВЛЕННЫЙ КОМПОНЕНТ ФОРМЫ УСЛУГИ (Хуки строго на верхнем уровне)
export const ServiceForm: React.FC<{
  item?: any;
  onSave: (data: any) => void;
  onCancel: () => void;
}> = ({ item, onSave, onCancel }) => {
  const [name, setName] = useState('');
  // const [price, setPrice] = useState('0');

  // Условие НАХОДИТСЯ ВНУТРИ хука. На верхнем уровне никаких if!
  useEffect(() => {
    if (item) {
      setName(item.name || '');
      // setPrice(item.price?.toString() || '0');
    } else {
      setName('');
      // setPrice('0');
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
        Карточка услуги (Редактирование)
      </h3>
      <div className="erp-form-group">
        <label style={{ color: '#777', marginBottom: '4px' }}>Наименование услуги:</label>
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
      <div style={{ marginTop: '20px' }}>
        <ErpFormButtons onSave={() => onSave({ name })} onCancel={onCancel} />
      </div>
    </div>
  );
};

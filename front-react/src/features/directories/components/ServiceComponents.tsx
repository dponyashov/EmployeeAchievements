import React, { useState, useEffect } from 'react';
import { ErpFormButtons } from '../../../components/ui/ErpFormButtons';
import { ErpCommandBar } from '../../../components/ui/ErpCommandBar';
import '../directories.css';

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
      <h2>Справочник "Услуг"</h2>
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
            <th className="dir-col-code-md">Код услуги</th>
            <th>Наименование услуги</th>
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
                >
                  <td className="text-center">{item.id}</td>
                  <td className="font-medium">{item.name}</td>
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

export const ServiceForm: React.FC<{
  item?: any;
  onSave: (data: any) => void;
  onCancel: () => void;
}> = ({ item, onSave, onCancel }) => {
  const [name, setName] = useState('');

  useEffect(() => {
    if (item) {
      setName(item.name || '');
    } else {
      setName('');
    }
  }, [item]);

  return (
    <div className="sub-view dir-item-form">
      <h3 className="dir-item-form-title">Карточка услуги (Редактирование)</h3>
      <div className="erp-form-group">
        <label className="dir-item-form-label">Наименование услуги:</label>
        <input
          className="dir-item-form-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="dir-item-form-actions--lg">
        <ErpFormButtons onSave={() => onSave({ name })} onCancel={onCancel} />
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { ErpCommandBar } from '../../../components/ui/ErpCommandBar';
import { ErpFormButtons } from '../../../components/ui/ErpFormButtons';
import '../directories.css';

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
            <th className="dir-col-code-sm">Код</th>
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
                  className={isSelected ? 'erp-row-selected' : ''}
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
          className="dir-item-form-input dir-item-form-input--compact"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="dir-item-form-actions">
        <ErpFormButtons onSave={() => onSave({ name })} onCancel={onCancel} />
      </div>
    </div>
  );
};

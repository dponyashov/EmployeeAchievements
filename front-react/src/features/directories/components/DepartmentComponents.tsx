import React, { useState, useEffect } from 'react';
import { ErpFormButtons } from '../../../components/ui/ErpFormButtons';
import { ErpCommandBar } from '../../../components/ui/ErpCommandBar';
import '../directories.css';

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
            <th className="dir-col-code-md">Код отдела</th>
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

export const DepartmentForm: React.FC<{
  item?: any;
  onSave: (data: any) => void;
  onCancel: () => void;
}> = ({ item, onSave, onCancel }) => {
  const [name, setName] = useState('');

  useEffect(() => {
    if (item && item.name) {
      setName(item.name);
    }
  }, [item]);

  return (
    <div className="sub-view">
      <h3 className="dir-item-form-title">Карточка подразделения (Редактирование)</h3>
      <div className="erp-form-group">
        <label className="dir-item-form-label">Название отдела:</label>
        <input
          className="dir-item-form-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <ErpFormButtons onSave={() => onSave({ name })} onCancel={onCancel} />
    </div>
  );
};

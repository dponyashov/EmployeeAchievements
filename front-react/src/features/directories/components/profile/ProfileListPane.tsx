// src/features/directories/components/profile/ProfileListPane.tsx
import React from 'react';
import { ErpCommandBar } from '../../../../components/ui/ErpCommandBar';

interface ProfileListPaneProps {
  filteredData: any[];
  selectedId: number | null;
  searchLastName: string;
  onSearchChange: (value: string) => void;
  onSelectRow: (id: number) => void;
  onCreateNew: () => void;
  onStartEdit: () => void;
  onDelete: () => void;
  onRefresh: () => void;
}

export const ProfileListPane: React.FC<ProfileListPaneProps> = ({
  filteredData,
  selectedId,
  searchLastName,
  onSearchChange,
  onSelectRow,
  onCreateNew,
  onStartEdit,
  onDelete,
  onRefresh,
}) => {
  return (
    /* Увеличим ширину левой панели до 55%, так как добавилась новая колонка */
    <div className="erp-pane-left" style={{ width: '55%' }}>
      <ErpCommandBar
        onCreate={onCreateNew}
        onEdit={onStartEdit}
        onDelete={onDelete}
        onRefresh={onRefresh}
        searchPlaceholder="Быстрый отбор по фамилии..."
        searchValue={searchLastName}
        onSearchChange={onSearchChange}
      />

      <div className="erp-table-wrapper" style={{ border: '1px solid #D3D3D3' }}>
        <table className="erp-v8-table">
          <thead>
            <tr>
              <th style={{ width: '50px' }}>Код</th>
              <th>Сотрудник</th>
              {/* ➕ Добавлена новая колонка в шапку таблицы */}
              <th style={{ width: '220px' }}>Электронная почта</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((emp) => {
              const isSelected = selectedId === emp.id;
              return (
                <tr
                  key={emp.id}
                  onClick={() => onSelectRow(emp.id)}
                  className={isSelected ? 'erp-row-selected' : ''}
                  style={{ backgroundColor: isSelected ? '#C1D9FF' : undefined }}
                >
                  <td className="text-center">{emp.id}</td>
                  <td className="font-medium">{`${emp.lastName || ''} ${emp.firstName || ''}`}</td>
                  {/* ➕ Выводим живые данные email в строке таблицы */}
                  <td style={{ color: '#555' }}>{emp.email || '—'}</td>
                </tr>
              );
            })}
            {filteredData.length === 0 && (
              <tr>
                <td colSpan={3} className="erp-empty-table">
                  Сотрудники не найдены.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

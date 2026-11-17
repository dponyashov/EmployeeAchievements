import React from 'react';
import { ErpCommandBar } from '../../../../components/ui/ErpCommandBar';
import '../../directories.css';

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
    <div className="erp-pane-left profile-pane-left">
      <ErpCommandBar
        onCreate={onCreateNew}
        onEdit={onStartEdit}
        onDelete={onDelete}
        onRefresh={onRefresh}
        searchPlaceholder="Быстрый отбор по фамилии..."
        searchValue={searchLastName}
        onSearchChange={onSearchChange}
      />

      <div className="erp-table-wrapper profile-table-wrapper">
        <table className="erp-v8-table">
          <thead>
            <tr>
              <th className="profile-col-code">Код</th>
              <th>Сотрудник</th>
              <th className="profile-col-email">Электронная почта</th>
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
                >
                  <td className="text-center">{emp.id}</td>
                  <td className="font-medium">{`${emp.lastName || ''} ${emp.firstName || ''}`}</td>
                  <td className="profile-cell-email">{emp.email || '—'}</td>
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

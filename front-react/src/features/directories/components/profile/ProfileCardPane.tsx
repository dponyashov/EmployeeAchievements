import React from 'react';
import { ErpFormButtons } from '../../../../components/ui/ErpFormButtons';
import '../../directories.css';

interface ProfileCardPaneProps {
  editingId: number | 'new' | null;
  selectedEmployee: any;
  positions: any[] | undefined;
  departments: any[] | undefined;
  isSaving: boolean;
  formLastName: string;
  formFirstName: string;
  formEmail: string;
  formPositionId: string;
  formDepartmentId: string;
  onLastNameChange: (v: string) => void;
  onFirstNameChange: (v: string) => void;
  onEmailChange: (v: string) => void;
  onPositionChange: (v: string) => void;
  onDepartmentChange: (v: string) => void;
  onSave: (e: React.FormEvent) => void;
  onCancel: () => void;
  onStartEdit: () => void;
}

export const ProfileCardPane: React.FC<ProfileCardPaneProps> = ({
  editingId,
  selectedEmployee,
  positions,
  departments,
  isSaving,
  formLastName,
  formFirstName,
  formEmail,
  formPositionId,
  formDepartmentId,
  onLastNameChange,
  onFirstNameChange,
  onEmailChange,
  onPositionChange,
  onDepartmentChange,
  onSave,
  onCancel,
  onStartEdit,
}) => {
  return (
    <div className="erp-pane-right">
      {editingId !== null ? (
        <form
          onSubmit={onSave}
          className={`erp-v8-form-grid ${isSaving ? 'profile-form--saving' : ''}`}
        >
          <h3 className="profile-form-title">
            {editingId === 'new'
              ? 'Новый сотрудник (Создание)'
              : `Сотрудник Код: ${editingId} (Редактирование)`}
          </h3>

          <div className="erp-form-group">
            <label>Фамилия:</label>
            <input
              type="text"
              value={formLastName}
              onChange={(e) => onLastNameChange(e.target.value)}
              required
            />
          </div>

          <div className="erp-form-group">
            <label>Имя Отчество:</label>
            <input
              type="text"
              value={formFirstName}
              onChange={(e) => onFirstNameChange(e.target.value)}
              required
            />
          </div>

          <div className="erp-form-group">
            <label>Адрес электронной почты (Email):</label>
            <input
              type="email"
              value={formEmail}
              onChange={(e) => onEmailChange(e.target.value)}
              required
            />
          </div>

          <div className="erp-form-group">
            <label>Должность (из справочника):</label>
            <select
              value={formPositionId}
              onChange={(e) => onPositionChange(e.target.value)}
              required
            >
              <option value="">-- Выберите должность --</option>
              {positions?.map((pos) => (
                <option key={pos.id} value={pos.id}>
                  {pos.name}
                </option>
              ))}
            </select>
          </div>

          <div className="erp-form-group">
            <label>Подразделение / Отдел:</label>
            <select
              value={formDepartmentId}
              onChange={(e) => onDepartmentChange(e.target.value)}
              required
            >
              <option value="">-- Выберите отдел --</option>
              {departments?.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <ErpFormButtons onCancel={onCancel} disabled={isSaving} />
        </form>
      ) : selectedEmployee ? (
        <div className="profile-view-card">
          <h3 className="profile-view-title">
            {selectedEmployee.lastName} {selectedEmployee.firstName}
          </h3>
          <table className="profile-view-table">
            <tbody>
              <tr className="profile-view-row">
                <td className="profile-view-label">ID учетной записи:</td>
                <td>
                  <strong>{selectedEmployee.id}</strong>
                </td>
              </tr>
              <tr className="profile-view-row">
                <td className="profile-view-label">Email:</td>
                <td>{selectedEmployee.email}</td>
              </tr>
              <tr className="profile-view-row">
                <td className="profile-view-label">Должность:</td>
                <td>
                  <span className="erp-tile-badge">
                    {selectedEmployee.position?.name || 'Не указана'}
                  </span>
                </td>
              </tr>
              <tr className="profile-view-row">
                <td className="profile-view-label">Подразделение:</td>
                <td>{selectedEmployee.department?.name || 'Вне штата'}</td>
              </tr>
            </tbody>
          </table>
          <button className="erp-cmd-btn profile-view-edit-btn" onClick={onStartEdit}>
            ✏️ Редактировать данные
          </button>
        </div>
      ) : (
        <div className="profile-empty-pane">
          <div className="profile-empty-icon">👤</div>
          <div>
            Выделите сотрудника в левой панели журнала для просмотра личной карточки
          </div>
        </div>
      )}
    </div>
  );
};

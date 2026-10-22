// src/features/directories/components/profile/ProfileCardPane.tsx
import React from 'react';
import { ErpFormButtons } from '../../../../components/ui/ErpFormButtons';

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
        /* РЕЖИМ РЕДАКТИРОВАНИЯ / СОЗДАНИЯ */
        <form
          onSubmit={onSave}
          className="erp-v8-form-grid"
          style={{ opacity: isSaving ? 0.6 : 1 }}
        >
          <h3
            style={{
              marginTop: 0,
              fontWeight: 'normal',
              borderBottom: '1px solid #DDD',
              paddingBottom: '5px',
            }}
          >
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

          {/* <ErpFormButtons onSave={() => {}} onCancel={onCancel} disabled={isSaving} /> */}
          <ErpFormButtons onCancel={onCancel} disabled={isSaving} />
        </form>
      ) : selectedEmployee ? (
        /* РЕЖИМ ПРОСМОТРА АНКЕТЫ */
        <div
          style={{
            background: '#FFF',
            border: '1px solid #D3D3D3',
            padding: '20px',
            maxWidth: '500px',
          }}
        >
          <h3 style={{ marginTop: 0, color: 'var(--1c-active-blue)' }}>
            {selectedEmployee.lastName} {selectedEmployee.firstName}
          </h3>
          <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
            <tbody>
              <tr style={{ borderBottom: '1px solid #EEE' }}>
                <td style={{ padding: '8px 0', color: '#777' }}>ID учетной записи:</td>
                <td>
                  <strong>{selectedEmployee.id}</strong>
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid #EEE' }}>
                <td style={{ padding: '8px 0', color: '#777' }}>Email:</td>
                <td>{selectedEmployee.email}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #EEE' }}>
                <td style={{ padding: '8px 0', color: '#777' }}>Должность:</td>
                <td>
                  <span className="erp-tile-badge">
                    {selectedEmployee.position?.name || 'Не указана'}
                  </span>
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid #EEE' }}>
                <td style={{ padding: '8px 0', color: '#777' }}>Подразделение:</td>
                <td>{selectedEmployee.department?.name || 'Вне штата'}</td>
              </tr>
            </tbody>
          </table>
          <button
            className="erp-cmd-btn"
            onClick={onStartEdit}
            style={{ marginTop: '15px' }}
          >
            ✏️ Редактировать данные
          </button>
        </div>
      ) : (
        /* ДЕФОЛТНОЕ ОКНО */
        <div style={{ textAlign: 'center', color: '#999', paddingTop: '100px' }}>
          <div style={{ fontSize: '40px' }}>👤</div>
          <div>
            Выделите сотрудника в левой панели журнала для просмотра личной карточки НСИ
          </div>
        </div>
      )}
    </div>
  );
};

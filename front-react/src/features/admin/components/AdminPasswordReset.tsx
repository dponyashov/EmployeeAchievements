import React, { useState, useEffect } from 'react';
import { useChangeUserPasswordMutation } from '../adminAuthApi';
import '../admin.css';

interface AdminPasswordResetProps {
  userId: number;
  onSuccess?: () => void;
}

export const AdminPasswordReset: React.FC<AdminPasswordResetProps> = ({
  userId,
  onSuccess,
}) => {
  const [changePassword, { error: passwordError, isLoading: isPasswordSaving }] =
    useChangeUserPasswordMutation();
  const [newPassword, setNewPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    setNewPassword('');
    setPasswordSuccess(false);
  }, [userId]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) return;

    setPasswordSuccess(false);
    try {
      await changePassword({ userId, data: { password: newPassword } }).unwrap();
      setNewPassword('');
      setPasswordSuccess(true);
      onSuccess?.();
    } catch (err) {
      // Ошибка обрабатывается RTK Query
    }
  };

  const renderPasswordError = () => {
    if (!passwordError) return null;
    let messages: string[] = [];

    try {
      const errData = (passwordError as any)?.data;
      if (errData) {
        if (Array.isArray(errData.message)) {
          messages = errData.message.map((m: string) =>
            m.replace(/^password:\s*['"]?/, '').replace(/['"]?$/, ''),
          );
        } else if (typeof errData.message === 'string') {
          messages = [errData.message];
        }
      }
      if (messages.length === 0 && (passwordError as any).statusText) {
        messages = [(passwordError as any).statusText];
      }
    } catch (e) {
      console.error(e);
    }

    if (messages.length === 0) {
      messages = ['Не удалось изменить пароль. Некорректный формат данных.'];
    }

    return (
      <div className="admin-pwd-error">
        {messages.map((m, i) => (
          <div key={i}>• {m}</div>
        ))}
      </div>
    );
  };

  return (
    <div className="admin-pwd-section">
      <div className="admin-pwd-title">Сброс пароля</div>
      <form onSubmit={handlePasswordChange} className="admin-pwd-form" autoComplete="off">
        <div className="admin-pwd-input-wrap">
          <input
            type="password"
            name="reset-user-password"
            autoComplete="new-password"
            className="admin-pwd-input"
            placeholder="Новый пароль"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          {renderPasswordError()}
          {passwordSuccess && <div className="admin-pwd-success">✓ Пароль изменен</div>}
        </div>
        <button
          type="submit"
          disabled={isPasswordSaving || !newPassword.trim()}
          className="admin-pwd-submit"
        >
          Изменить пароль
        </button>
      </form>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useChangeUserPasswordMutation } from '../adminAuthApi';

interface AdminPasswordResetProps {
  userId: number;
}

export const AdminPasswordReset: React.FC<AdminPasswordResetProps> = ({ userId }) => {
  const [changePassword, { error: passwordError, isLoading: isPasswordSaving }] =
    useChangeUserPasswordMutation();
  const [newPassword, setNewPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Сбрасываем статус при переключении пользователя
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
      <div
        style={{
          background: '#fff0f0',
          border: '1px solid #cc0000',
          padding: '6px',
          marginTop: '5px',
          fontSize: '12px',
          color: '#cc0000',
        }}
      >
        {messages.map((m, i) => (
          <div key={i}>• {m}</div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ padding: '15px', borderBottom: '1px solid #ccc', background: '#fff' }}>
      <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#555' }}>
        Сброс пароля
      </div>
      <form
        onSubmit={handlePasswordChange}
        style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}
      >
        <div style={{ width: '250px' }}>
          <input
            type="password"
            placeholder="Новый пароль"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={{ width: '100%', padding: '4px', border: '1px solid #bbb' }}
          />
          {renderPasswordError()}
          {passwordSuccess && (
            <div style={{ color: 'green', fontSize: '11px', marginTop: '4px' }}>
              ✓ Пароль изменен
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={isPasswordSaving || !newPassword.trim()}
          style={{
            padding: '4px 15px',
            background: '#ffcc00',
            border: '1px solid #997a00',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          Изменить пароль
        </button>
      </form>
    </div>
  );
};

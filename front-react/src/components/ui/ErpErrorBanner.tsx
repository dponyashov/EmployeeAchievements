import React from 'react';
import { parseErpError } from '../../utils/parseErpError';

interface ErpErrorBannerProps {
  error: any;
  title?: string;
}

export const ErpErrorBanner: React.FC<ErpErrorBannerProps> = ({
  error,
  title = 'Не удалось сохранить данные:',
}) => {
  // Если ошибки нет — компонент невидим на форме (стандартное поведение )
  if (!error) return null;

  let messages: string[] = [];

  const deepFindMessages = (obj: any): string[] | null => {
    if (!obj) return null;
    if (typeof obj === 'string') return [obj];
    if (typeof obj !== 'object') return null;

    if (Array.isArray(obj.message)) return obj.message;
    if (typeof obj.message === 'string') return [obj.message];
    if (typeof obj.error === 'string') return [obj.error];

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const result = deepFindMessages(obj[key]);
        if (result) return result;
      }
    }
    return null;
  };

  const foundMessages = deepFindMessages(error);
  if (foundMessages && foundMessages.length > 0) {
    messages = foundMessages;
  }

  if (messages.length === 0) {
    try {
      if (typeof parseErpError === 'function') {
        messages = parseErpError(error);
      }
    } catch (e) {
      console.error(e);
    }
  }

  if (messages.length === 0) {
    if (error.statusText || error.status) {
      messages = [`Ошибка: ${error.statusText || error.status}`];
    } else {
      messages = ['Некорректные реквизиты формы.'];
    }
  }

  const formattedMessages = messages.map((m) =>
    typeof m === 'string'
      ? m.replace(/^password:\s*['"]?/, '').replace(/['"]?$/, '')
      : JSON.stringify(m),
  );

  return (
    <div
      style={{
        background: '#fff0f0',
        border: '1px solid #cc0000',
        padding: '10px',
        marginBottom: '15px',
        fontSize: '12px',
        color: '#cc0000',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{title}</div>
      {formattedMessages.map((msg, idx) => (
        <div key={idx}>• {msg}</div>
      ))}
    </div>
  );
};

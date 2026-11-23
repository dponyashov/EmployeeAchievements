import React, { useMemo } from 'react';
import { useAppSelector } from '../../app/store';
import './news.css';

export const NewsHostPage: React.FC = () => {
  const appTitle = import.meta.env.VITE_APP_TITLE;
  document.title = `Новости — ${appTitle}`;

  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const baseNewsUrl = (import.meta.env.VITE_NEWS_APP_URL || '').trim();

  const iframeSrc = useMemo(() => {
    if (!baseNewsUrl || !accessToken) return '';

    try {
      const resolvedUrl = new URL(baseNewsUrl, window.location.origin);
      resolvedUrl.searchParams.set('token', accessToken);
      return resolvedUrl.toString();
    } catch {
      const separator = baseNewsUrl.includes('?') ? '&' : '?';
      return `${baseNewsUrl}${separator}token=${encodeURIComponent(accessToken)}`;
    }
  }, [baseNewsUrl, accessToken]);

  if (!baseNewsUrl) {
    return (
      <div className="news-host-error">
        Не настроен адрес подсистемы новостей (<code>VITE_NEWS_APP_URL</code> в файле{' '}
        <code>.env</code>). Укажите адрес запущенного приложения новостей и перезапустите
        сборку.
      </div>
    );
  }

  if (!accessToken) {
    return (
      <div className="news-host-error">
        Не удалось передать токен авторизации в подсистему новостей. Обновите сессию.
      </div>
    );
  }

  return (
    <div className="news-host-container">
      <iframe
        key={accessToken}
        src={iframeSrc}
        title="Подсистема новостей"
        className="news-host-iframe"
      />
    </div>
  );
};

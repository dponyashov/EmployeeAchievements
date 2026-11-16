// src/App.tsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useRefreshSessionMutation } from './features/auth/authApi';
import { setCredentials, finishInitialization } from './features/auth/authSlice';
import { erpRouter } from './routes/router';
import type { RootState } from './app/store';
import { executeSilentRefresh } from './api/baseQuery';

const App: React.FC = () => {
  const dispatch = useDispatch();
  const { isInitializing, accessToken, isAuthenticated } = useSelector(
    (state: RootState) => state.auth,
  );
  const [refreshSession] = useRefreshSessionMutation();

  // 1. Первичная инициализация при загрузке / F5
  useEffect(() => {
    const autoRefresh = async () => {
      try {
        const response = (await refreshSession().unwrap()) as any;
        if (response?.tokenAccess && response?.user) {
          dispatch(
            setCredentials({
              serverUser: response.user,
              tokenAccess: response.tokenAccess,
            }),
          );
        } else {
          dispatch(finishInitialization());
        }
      } catch (e) {
        dispatch(finishInitialization());
      }
    };

    autoRefresh();
  }, [refreshSession, dispatch]);

  // 2. Проактивное обновление Access Token до истечения срока действия и при возврате на вкладку
  useEffect(() => {
    if (!isAuthenticated || !accessToken) return;

    let refreshTimer: ReturnType<typeof setTimeout> | null = null;

    const silentRefresh = async () => {
      try {
        await executeSilentRefresh(dispatch);
      } catch {
        // Если рефреш не удался, обработка произойдет централизованно
      }
    };

    try {
      const decoded = jwtDecode<{ exp?: number }>(accessToken);
      if (decoded.exp) {
        const expiresInMs = decoded.exp * 1000 - Date.now();
        // Обновляем за 60 секунд до истечения (или сразу, если осталось меньше минуты)
        const timeoutMs = Math.max(expiresInMs - 60_000, 1000);
        refreshTimer = setTimeout(silentRefresh, timeoutMs);
      }
    } catch (e) {
      console.error('Ошибка чтения exp из JWT:', e);
    }

    // При возврате на вкладку после долгого простоя проверяем свежесть токена
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        try {
          const decoded = jwtDecode<{ exp?: number }>(accessToken);
          // Если до истечения токена осталось меньше 2 минут или он уже истек — обновляем
          if (decoded.exp && decoded.exp * 1000 - Date.now() < 120_000) {
            silentRefresh();
          }
        } catch {
          silentRefresh();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (refreshTimer) clearTimeout(refreshTimer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, accessToken, refreshSession, dispatch]);

  if (isInitializing) {
    return (
      <div
        style={{
          display: 'flex',
          height: '100vh',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#F2F2F2',
        }}
      >
        <div style={{ fontFamily: 'Segoe UI', color: '#333' }}>
          <strong>ДС</strong> — Запуск подсистемы авторизации...
        </div>
      </div>
    );
  }

  return <RouterProvider router={erpRouter} />;
};

export default App;

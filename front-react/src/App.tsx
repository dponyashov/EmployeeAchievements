import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RouterProvider } from 'react-router-dom'; // Импортируем провайдер
import { useRefreshSessionMutation } from './features/auth/authApi';
import { setCredentials, finishInitialization } from './features/auth/authSlice';
import { erpRouter } from './routes/router'; // Импортируем новый роутер
import type { RootState } from './app/store';

const App: React.FC = () => {
  const dispatch = useDispatch();
  const { isInitializing } = useSelector((state: RootState) => state.auth);
  const [refreshSession] = useRefreshSessionMutation();

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

  // Передаем новый роутер в провайдер
  return <RouterProvider router={erpRouter} />;
};

export default App;

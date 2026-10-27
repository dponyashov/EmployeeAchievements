import React, { useState, useEffect } from 'react';
import { useLoginMutation, useRegisterMutation } from '../features/auth/authApi';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setCredentials } from '../features/auth/authSlice';
import './AuthLayout.css';
import type { RootState } from '../app/store';

interface AuthLayoutProps {
  isLoginInit: boolean;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ isLoginInit }) => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const [isLoginView, setIsLoginView] = useState(isLoginInit);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Состояние для хранения текста ошибки с сервера
  const [serverError, setServerError] = useState<string | null>(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [login, { isLoading: isLoginLoading }] = useLoginMutation();
  const [register, { isLoading: isRegLoading }] = useRegisterMutation();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/'); // Если залогинен, на окно входа попасть нельзя
    }
  }, [isAuthenticated, navigate]);

  // При переключении между вкладками Вход / Регистрация сбрасываем прошлые ошибки
  useEffect(() => {
    setIsLoginView(isLoginInit);
    setServerError(null);
  }, [isLoginInit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null); // Сбрасываем ошибку перед новым запросом

    try {
      if (isLoginView) {
        const response = (await login({ userName: username, password }).unwrap()) as any;
        const { tokenAccess, user } = response;

        if (tokenAccess && user) {
          dispatch(setCredentials({ serverUser: user, tokenAccess }));
          navigate('/');
        } else {
          setServerError('Сервер вернул некорректный формат данных.');
        }
      } else {
        await register({ userName: username, password }).unwrap();
        alert('Регистрация успешна! Войдите в подсистему.');
        navigate('/login');
      }
    } catch (err: any) {
      // Алгоритм безопасного извлечения массива ошибок из RTK Query / Axios
      const serverData = err?.data;

      if (serverData && Array.isArray(serverData.message)) {
        // Объединяем сообщения, если сервер прислал их несколько
        setServerError(serverData.message.join('. '));
      } else if (serverData && typeof serverData.message === 'string') {
        setServerError(serverData.message);
      } else {
        setServerError('Произошла непредвиденная ошибка при обращении к серверу.');
      }
      console.error('Полная структура ошибки:', err);
    }
  };

  return (
    <div className="erp-auth-container">
      <div className="erp-auth-window">
        <div className="erp-auth-header">
          {isLoginView ? 'ДС — Авторизация' : 'ДС — Регистрация нового пользователя'}
        </div>

        <form onSubmit={handleSubmit} className="erp-auth-body">
          {/* Аутентичный блок вывода предупреждений */}
          {serverError && (
            <div className="erp-error-banner">
              <span className="erp-error-icon">⚠️</span>
              <div className="erp-error-text">
                <strong>Внимание:</strong> {serverError}
              </div>
            </div>
          )}

          <div className="erp-form-group">
            <label>Имя пользователя (Email):</label>
            {!isLoginView && (
              <input
                type="email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            )}
            {isLoginView && (
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            )}
          </div>
          <div className="erp-form-group">
            <label>Пароль:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="erp-btn-primary"
            disabled={isLoginLoading || isRegLoading}
          >
            {isLoginView ? 'Вход' : 'Зарегистрироваться'}
          </button>
        </form>

        <div className="erp-auth-footer-links">
          {isLoginView ? (
            <span onClick={() => navigate('/register')}>Создать нового пользователя</span>
          ) : (
            <span onClick={() => navigate('/login')}>Вернуться к окну входа</span>
          )}
        </div>
      </div>
    </div>
  );
};

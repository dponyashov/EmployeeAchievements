import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode'; // Импортируем декодер

interface UserInfo {
  id: number;
  email: string;
  name: string; // Сюда объединим firstName и lastName
  position: string; // Должность: "Начальник"
  department: string; // Подразделение: "ВСиР ФС"
  roles: string[]; // Роли, извлеченные из токена
}

interface AuthState {
  user: UserInfo | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean; // <-- Добавляем этот флаг
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isInitializing: true, // <-- Начинаем с true
};

// Интерфейс для расшифровки структуры вашего JWT
interface JwtPayload {
  roles: string[];
  sub: string;
  exp: number;
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ serverUser: any; tokenAccess: string }>,
    ) => {
      const { serverUser, tokenAccess } = action.payload;

      // 1. Декодируем роли (код остается прежним)
      let decodedRoles: string[] = [];
      try {
        const decoded = jwtDecode<JwtPayload>(tokenAccess);
        decodedRoles = decoded.roles || [];
      } catch (e) {
        console.error('Ошибка декодирования JWT токена:', e);
      }

      // 2. Алгоритм формирования отображаемого имени
      let displayName = '';
      if (serverUser.lastName || serverUser.firstName) {
        // Если заполнено хотя бы одно из полей, собираем их (удаляя лишние пробелы)
        displayName = `${serverUser.lastName || ''} ${serverUser.firstName || ''}`.trim();
      } else {
        // Если оба поля равны null или пустые, используем email
        displayName = serverUser.email;
      }

      // 3. Записываем обработанные данные в состояние
      state.user = {
        id: serverUser.id,
        email: serverUser.email,
        name: displayName, // Применили отформатированное имя или email
        position: serverUser.position?.name || '',
        department: serverUser.department?.name || '',
        roles: decodedRoles,
      };

      state.accessToken = action.payload.tokenAccess;
      state.isAuthenticated = true;
      state.isInitializing = false; // Проверка успешно завершена
    },
    logOut: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isInitializing = false; // Проверка завершена (неудачно)
    },
    finishInitialization: (state) => {
      state.isInitializing = false; // Принудительное завершение
    },
  },
});

export const { setCredentials, logOut, finishInitialization } = authSlice.actions;
export default authSlice.reducer;

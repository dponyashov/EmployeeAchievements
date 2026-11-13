import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode'; // Импортируем декодер

// 1. В интерфейсе UserInfo добавьте employeeId:
interface UserInfo {
  id: number;
  email: string;
  name: string;
  position: string;
  department: string;
  roles: string[];
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
      // 2. В редьюсере setCredentials запишите employeeId:
      state.user = {
        id: serverUser.id,
        email: serverUser.email,
        name: displayName,
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
    updateUserProfile: (
      state,
      action: PayloadAction<{
        firstName: string;
        lastName: string;
        email: string;
        position?: string;
        department?: string;
      }>,
    ) => {
      if (!state.user) return;
      const { firstName, lastName, email, position, department } = action.payload;

      const displayName =
        lastName || firstName ? `${lastName || ''} ${firstName || ''}`.trim() : email;

      state.user.name = displayName;
      state.user.email = email;
      if (position !== undefined) state.user.position = position;
      if (department !== undefined) state.user.department = department;
    },
  },
});

export const { setCredentials, logOut, finishInitialization, updateUserProfile } =
  authSlice.actions;
export default authSlice.reducer;

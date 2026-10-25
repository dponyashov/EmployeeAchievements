// src/app/store.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import { authApi } from '../features/auth/authApi';
import { counterpartiesApi } from '../features/directories/counterpartiesApi'; // <-- Импорт
import { injectStoreToAxios } from '../api/axios';
import { directoriesApi } from '../features/directories/directoriesApi';
import { adminAuthApi } from '../features/admin/adminAuthApi';
import { tasksApi } from '../features/tasks/tasksApi';
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import { reportsApi } from '../features/reports/reportsApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [counterpartiesApi.reducerPath]: counterpartiesApi.reducer, // <-- Регистрируем редюсер
    [directoriesApi.reducerPath]: directoriesApi.reducer,
    [adminAuthApi.reducerPath]: adminAuthApi.reducer,
    [tasksApi.reducerPath]: tasksApi.reducer,
    [reportsApi.reducerPath]: reportsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      counterpartiesApi.middleware,
      directoriesApi.middleware,
      adminAuthApi.middleware,
      tasksApi.middleware,
      reportsApi.middleware,
    ),
});

injectStoreToAxios(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Кастомные хуки для безопасной типизации по всему проекту
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

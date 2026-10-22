// src/app/store.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import { authApi } from '../features/auth/authApi';
import { counterpartiesApi } from '../features/directories/counterpartiesApi'; // <-- Импорт
import { injectStoreToAxios } from '../api/axios';
import { directoriesApi } from '../features/directories/directoriesApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [counterpartiesApi.reducerPath]: counterpartiesApi.reducer, // <-- Регистрируем редюсер
    [directoriesApi.reducerPath]: directoriesApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(counterpartiesApi.middleware) // <-- Регистрируем middleware
      .concat(directoriesApi.middleware),
});

injectStoreToAxios(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

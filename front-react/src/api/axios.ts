// src/api/axios.ts
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BACK_URL || 'http://localhost:8080/api';

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const injectStoreToAxios = (store: any) => {
  axiosInstance.interceptors.request.use((config) => {
    const url = config.url || '';
    // Для эндпоинтов авторизации и рефреша НЕ отправляем старый просроченный Access Token
    const isAuthEndpoint =
      url.includes('/auth/refresh') ||
      url.includes('/auth/login') ||
      url.includes('/auth/registry');

    if (isAuthEndpoint) {
      if (config.headers) {
        delete config.headers.Authorization;
      }
      return config;
    }

    const token = store.getState().auth.accessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
};

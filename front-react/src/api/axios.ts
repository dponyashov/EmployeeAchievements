import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BACK_URL;

export const axiosInstance = axios.create({
  baseURL: BASE_URL, // Укажите ваш API URL
  withCredentials: true, // Критично для HttpOnly Cookie
  headers: {
    'Content-Type': 'application/json',
  },
});

// Перехватчик для подстановки Access Token из Redux Store в процессе выполнения
export const injectStoreToAxios = (store: any) => {
  axiosInstance.interceptors.request.use((config) => {
    const token = store.getState().auth.accessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
};

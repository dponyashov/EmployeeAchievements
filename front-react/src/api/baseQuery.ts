// src/api/baseQuery.ts
import type { BaseQueryFn } from '@reduxjs/toolkit/query';
import type { AxiosRequestConfig, AxiosError } from 'axios';
import { axiosInstance } from './axios';
import { logOut, setCredentials } from '../features/auth/authSlice';

export const axiosBaseQuery =
  (): BaseQueryFn<{
    url: string;
    method?: AxiosRequestConfig['method'];
    data?: AxiosRequestConfig['data'];
    params?: AxiosRequestConfig['params'];
    headers?: AxiosRequestConfig['headers'];
  }> =>
  async ({ url, method = 'GET', data, params, headers }, api) => {
    try {
      const result = await axiosInstance({ url, method, data, params, headers });
      return { data: result.data };
    } catch (axiosError) {
      const err = axiosError as AxiosError;

      // ВАЖНО: Если ошибка 401 произошла НА САМОМ эндпоинте рефреша,
      // то не нужно пытаться запустить рефреш повторно или вызывать logOut!
      if (url === '/auth/refresh') {
        return {
          error: { status: err.response?.status, data: err.response?.data },
        };
      }

      // Для всех остальных обычных запросов (справочники, отчеты) оставляем логику рефреша
      if (err.response?.status === 401) {
        try {
          const refreshResult = await axiosInstance({
            url: '/auth/refresh',
            method: 'POST',
          });
          const { tokenAccess, user } = refreshResult.data as any;

          api.dispatch(setCredentials({ serverUser: user, tokenAccess }));

          const retryResult = await axiosInstance({
            url,
            method,
            data,
            params,
            headers: { ...headers, Authorization: `Bearer ${tokenAccess}` },
          });
          return { data: retryResult.data };
        } catch (refreshErr) {
          api.dispatch(logOut());
          return { error: refreshErr };
        }
      }

      return { error: { status: err.response?.status, data: err.response?.data } };
    }
  };

// src/api/baseQuery.ts
import type { BaseQueryFn } from '@reduxjs/toolkit/query';
import type { AxiosRequestConfig, AxiosError } from 'axios';
import { axiosInstance } from './axios';
import { logOut, setCredentials } from '../features/auth/authSlice';

let refreshPromise: Promise<string> | null = null;

// Единая точка обновления токена для всего приложения (и для 401, и для таймера в App.tsx)
export const executeSilentRefresh = (dispatch: any): Promise<string> => {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshResult = await axiosInstance({
        url: '/auth/refresh',
        method: 'POST',
      });
      const { tokenAccess, user } = refreshResult.data as any;

      if (!tokenAccess) {
        throw new Error('Отсутствует tokenAccess в ответе /auth/refresh');
      }

      dispatch(setCredentials({ serverUser: user, tokenAccess }));
      return tokenAccess as string;
    })().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
};

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

      if (url === '/auth/refresh' || url === '/auth/login') {
        return {
          error: { status: err.response?.status, data: err.response?.data },
        };
      }

      if (err.response?.status === 401) {
        try {
          const newAccessToken = await executeSilentRefresh(api.dispatch);

          const retryResult = await axiosInstance({
            url,
            method,
            data,
            params,
            headers: { ...headers, Authorization: `Bearer ${newAccessToken}` },
          });
          return { data: retryResult.data };
        } catch (refreshErr) {
          const status = (refreshErr as AxiosError)?.response?.status;
          if (status === 401 || status === 403) {
            api.dispatch(logOut());
          }
          return {
            error: {
              status: status || 401,
              data: (refreshErr as AxiosError)?.response?.data,
            },
          };
        }
      }

      return { error: { status: err.response?.status, data: err.response?.data } };
    }
  };

import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '../../api/baseQuery';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({ url: '/auth/login', method: 'POST', data: credentials }),
    }),
    register: builder.mutation({
      query: (credentials) => ({
        url: '/auth/registry',
        method: 'POST',
        data: credentials,
      }),
    }),
    logout: builder.mutation({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
    }),
    // Добавляем эндпоинт для инициализирующего рефреша
    refreshSession: builder.mutation<any, void>({
      query: () => ({ url: '/auth/refresh', method: 'POST' }),
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation, useRefreshSessionMutation } =
  authApi;

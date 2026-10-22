// src/features/directories/counterpartiesApi.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '../../api/baseQuery';

// Описываем структуру контрагента, приходящую от вашего сервера
export interface Counterparty {
  id: number;
  inn: string;
  kpp: string;
  fullName: string;
  shortName: string;
  isClient: boolean;
  isSupplier: boolean;
}

export const counterpartiesApi = createApi({
  reducerPath: 'counterpartiesApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Counterparty'], // Теги позволяют автоматически обновлять список при создании/удалении
  endpoints: (builder) => ({
    // 1. Получение списка контрагентов
    getCounterparties: builder.query<Counterparty[], void>({
      query: () => ({
        url: '/directories/counterparties',
        method: 'GET',
      }),
      providesTags: ['Counterparty'],
    }),
    // 2. Пример мутации: Создание нового контрагента
    createCounterparty: builder.mutation<Counterparty, Partial<Counterparty>>({
      query: (body) => ({
        url: '/directories/counterparties',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['Counterparty'], // Инвалидирует кэш, заставляя getCounterparties перезапросить данные
    }),
  }),
});

export const { useGetCounterpartiesQuery, useCreateCounterpartyMutation } =
  counterpartiesApi;

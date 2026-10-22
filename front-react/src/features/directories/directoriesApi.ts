// src/features/directories/directoriesApi.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '../../api/baseQuery';

export interface DirectoryMeta {
  name: string;
  url: string;
}

export interface ProfileItem {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  position: { id: number; name: string } | null;
  department: { id: number; name: string } | null;
}

export const directoriesApi = createApi({
  reducerPath: 'directoriesApi',
  baseQuery: axiosBaseQuery(),
  // Объявляем тип тега для отслеживания кэша справочников
  tagTypes: ['DirectoryList'],
  endpoints: (builder) => ({
    getDirectoriesMeta: builder.query<DirectoryMeta[], void>({
      query: () => ({ url: '/directory', method: 'GET' }),
    }),

    // Получение списка: подписываем кэш на тег конкретного справочника
    getDirectoryData: builder.query<any[], string>({
      query: (cleanKey) => ({ url: `/directory/${cleanKey}`, method: 'GET' }),
      providesTags: (result, error, cleanKey) => [
        { type: 'DirectoryList', id: cleanKey },
      ],
    }),

    getDirectoryItem: builder.query<any, { cleanKey: string; id: string }>({
      query: ({ cleanKey, id }) => ({
        url: `/directory/${cleanKey}/${id}`,
        method: 'GET',
      }),
    }),

    // Создание и изменение: при успехе сбрасываем кэш конкретного справочника
    saveDirectoryItem: builder.mutation<any, { cleanKey: string; id: string; data: any }>(
      {
        query: ({ cleanKey, id, data }) => ({
          url: id === 'new' ? `/directory/${cleanKey}` : `/directory/${cleanKey}/${id}`,
          // Меняем метод на PATCH для частичного обновления уже существующих данных
          method: id === 'new' ? 'POST' : 'PATCH',
          data,
        }),
        invalidatesTags: (result, error, { cleanKey }) => [
          { type: 'DirectoryList', id: cleanKey },
        ],
      },
    ),

    // 🚀 НОВЫЙ МЕТОД: Удаление элемента справочника
    deleteDirectoryItem: builder.mutation<any, { cleanKey: string; id: number }>({
      query: ({ cleanKey, id }) => ({
        url: `/directory/${cleanKey}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { cleanKey }) => [
        { type: 'DirectoryList', id: cleanKey },
      ],
    }),
    // 1. Мутация сохранения сотрудника в плоском формате (вместо PUT используем PATCH)
    saveProfileItem: builder.mutation<any, { id: number | 'new'; data: any }>({
      query: ({ id, data }) => ({
        url: id === 'new' ? '/directory/profile' : `/directory/profile/${id}`,
        method: id === 'new' ? 'POST' : 'PATCH',
        data,
      }),
      invalidatesTags: (result, error) => [{ type: 'DirectoryList', id: 'profile' }],
    }),

    // 2. Вспомогательный запрос для выпадающего списка Должностей
    getPositionsForSelect: builder.query<any[], void>({
      query: () => ({ url: '/directory/position', method: 'GET' }),
    }),

    // 3. Вспомогательный запрос для выпадающего списка Отделов
    getDepartmentsForSelect: builder.query<any[], void>({
      query: () => ({ url: '/directory/department', method: 'GET' }),
    }),
  }),
});

export const {
  useGetDirectoriesMetaQuery,
  useGetDirectoryDataQuery,
  useGetDirectoryItemQuery,
  useSaveDirectoryItemMutation,
  useDeleteDirectoryItemMutation, // Экспортируем новый хук удаления
  useGetPositionsForSelectQuery,
  useGetDepartmentsForSelectQuery,
  useSaveProfileItemMutation,
} = directoriesApi;

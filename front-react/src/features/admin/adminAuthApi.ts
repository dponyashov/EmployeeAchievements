import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '../../api/baseQuery';

export interface Role {
  id: number;
  name: string;
  description: string;
}

export interface User {
  id: number;
  userName: string;
  roles: Role[] | null;
}

export const adminAuthApi = createApi({
  reducerPath: 'adminAuthApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['AdminUser', 'AdminRole'],
  endpoints: (builder) => ({
    getAdminUsers: builder.query<User[], void>({
      query: () => ({ url: 'auth/user', method: 'GET' }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'AdminUser' as const, id })),
              { type: 'AdminUser', id: 'LIST' },
            ]
          : [{ type: 'AdminUser', id: 'LIST' }],
    }),
    getAdminRoles: builder.query<Role[], void>({
      query: () => ({ url: 'auth/role', method: 'GET' }),
      providesTags: ['AdminRole'],
    }),
    getUserRoles: builder.query<Role[], number>({
      query: (userId) => ({ url: `auth/user/${userId}/roles`, method: 'GET' }),
      async onQueryStarted(userId, { dispatch, queryFulfilled }) {
        try {
          const { data: fetchedRoles } = await queryFulfilled;
          dispatch(
            adminAuthApi.util.updateQueryData(
              'getAdminUsers',
              undefined,
              (draftUsers) => {
                const user = draftUsers.find((u) => u.id === userId);
                if (user) {
                  user.roles = fetchedRoles;
                }
              },
            ),
          );
        } catch {}
      },
    }),
    changeUserPassword: builder.mutation<
      void,
      { userId: number; data: { password: string } }
    >({
      query: ({ userId, data }) => ({
        url: `auth/user/${userId}/change-password`,
        method: 'POST',
        data,
      }),
    }),
    // Добавление роли с ручным обновлением кэша без инвалидации
    addUserRole: builder.mutation<
      void,
      { userId: number; roleId: number; roleObject: Role }
    >({
      query: ({ userId, roleId }) => ({
        url: `auth/user/${userId}/roles/${roleId}/add`,
        method: 'POST',
      }),
      async onQueryStarted({ userId, roleObject }, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled; // Ждем успешного ответа сервера
          dispatch(
            adminAuthApi.util.updateQueryData(
              'getAdminUsers',
              undefined,
              (draftUsers) => {
                const user = draftUsers.find((u) => u.id === userId);
                if (user) {
                  if (!user.roles) user.roles = [];
                  // Проверяем, чтобы не дублировать
                  if (!user.roles.some((r) => r.id === roleObject.id)) {
                    user.roles.push(roleObject);
                  }
                }
              },
            ),
          );
        } catch {}
      },
    }),
    // Удаление роли с ручным обновлением кэша без инвалидации
    deleteUserRole: builder.mutation<void, { userId: number; roleId: number }>({
      query: ({ userId, roleId }) => ({
        url: `auth/user/${userId}/roles/${roleId}/delete`,
        method: 'DELETE',
      }),
      async onQueryStarted({ userId, roleId }, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled; // Ждем успешного ответа сервера
          dispatch(
            adminAuthApi.util.updateQueryData(
              'getAdminUsers',
              undefined,
              (draftUsers) => {
                const user = draftUsers.find((u) => u.id === userId);
                if (user && user.roles) {
                  user.roles = user.roles.filter((r) => r.id !== roleId);
                }
              },
            ),
          );
        } catch {}
      },
    }),
  }),
});

export const {
  useGetAdminUsersQuery,
  useGetAdminRolesQuery,
  useLazyGetUserRolesQuery,
  useChangeUserPasswordMutation,
  useAddUserRoleMutation,
  useDeleteUserRoleMutation,
} = adminAuthApi;

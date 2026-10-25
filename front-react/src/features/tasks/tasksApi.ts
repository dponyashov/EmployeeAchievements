import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '../../api/baseQuery';

export interface PositionOrDepartment {
  id: number;
  name: string;
}

export interface EmployeeProfile {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  position: PositionOrDepartment | null;
  department: PositionOrDepartment | null;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  year: number;
  month: number;
  enterDate: string;
  enterTime: string;
  profile: EmployeeProfile;
  service: PositionOrDepartment | null;
  component: PositionOrDepartment | null;
  author: EmployeeProfile;
  queries: { id: number; name: string }[];
}

// Интерфейс данных формы для POST / PATCH запросов
export interface TaskFormData {
  title: string;
  description: string;
  year: number;
  month: number;
  profileId: number;
  serviceId: number;
  componentId: number;
}

export interface DirectoryItem {
  id: number;
  name: string;
}

export const tasksApi = createApi({
  reducerPath: 'tasksApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['UserTask', 'DepartmentEmployee'],
  endpoints: (builder) => ({
    getCurrentUserProfile: builder.query<EmployeeProfile, number>({
      query: (id) => ({ url: `/auth/user/${id}/profile`, method: 'GET' }),
    }),
    getDepartmentEmployees: builder.query<EmployeeProfile[], number>({
      query: (deptId) => ({
        url: `directory/profile/${deptId}/department`,
        method: 'GET',
      }),
      providesTags: ['DepartmentEmployee'],
    }),
    getTasksByProfile: builder.query<Task[], number>({
      query: (profileId) => ({ url: `/task/${profileId}/profile`, method: 'GET' }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'UserTask' as const, id })),
              { type: 'UserTask', id: 'LIST' },
            ]
          : [{ type: 'UserTask', id: 'LIST' }],
    }),
    // ➕ МУТАЦИИ ДЛЯ УПРАВЛЕНИЯ ЗАДАЧАМИ (CRUD)
    createTask: builder.mutation<void, TaskFormData>({
      query: (data) => ({ url: '/task', method: 'POST', data }),
      invalidatesTags: [{ type: 'UserTask', id: 'LIST' }],
    }),
    updateTask: builder.mutation<void, { id: number; data: TaskFormData }>({
      query: ({ id, data }) => ({ url: `/task/${id}`, method: 'PATCH', data }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: 'UserTask', id },
        { type: 'UserTask', id: 'LIST' },
      ],
    }),
    deleteTask: builder.mutation<void, number>({
      query: (id) => ({ url: `/task/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'UserTask', id: 'LIST' }],
    }),
    // ➕ ДОПОЛНИТЕЛЬНЫЕ СПРАВОЧНИКИ ДЛЯ ВЫБОРА В ФОРМЕ
    getServicesDirectory: builder.query<DirectoryItem[], void>({
      query: () => ({ url: '/directory/service', method: 'GET' }),
    }),
    getComponentsDirectory: builder.query<DirectoryItem[], void>({
      query: () => ({ url: '/directory/component', method: 'GET' }),
    }),
    addQueryToTask: builder.mutation<void, { taskId: number; data: { name: string } }>({
      query: ({ taskId, data }) => ({
        url: `/task/${taskId}/query`,
        method: 'POST',
        data,
      }),
      invalidatesTags: (_res, _err, { taskId }) => [{ type: 'UserTask', id: taskId }],
    }),

    deleteQueryFromTask: builder.mutation<void, { taskId: number; queryId: number }>({
      query: ({ taskId, queryId }) => ({
        url: `/task/${taskId}/query/${queryId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_res, _err, { taskId }) => [{ type: 'UserTask', id: taskId }],
    }),
  }),
});

export const {
  useGetCurrentUserProfileQuery,
  useLazyGetDepartmentEmployeesQuery,
  useGetTasksByProfileQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useGetServicesDirectoryQuery,
  useGetComponentsDirectoryQuery,
  useAddQueryToTaskMutation,
  useDeleteQueryFromTaskMutation,
} = tasksApi;

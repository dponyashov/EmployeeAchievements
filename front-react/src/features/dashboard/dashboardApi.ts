import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '../../api/baseQuery';

export interface DashboardSettings {
  columnsCount: number;
  rowsCount: number;
  tiles: string[];
}

export const dashboardApi = createApi({
  reducerPath: 'dashboardApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['DashboardSettings'],
  endpoints: (builder) => ({
    getDashboardSettings: builder.query<DashboardSettings, void>({
      query: () => ({ url: '/dashboard/settings', method: 'GET' }),
      providesTags: ['DashboardSettings'],
    }),
    saveDashboardSettings: builder.mutation<DashboardSettings, DashboardSettings>({
      query: (data) => ({
        url: '/dashboard/settings',
        method: 'PUT',
        data,
      }),
      invalidatesTags: ['DashboardSettings'],
    }),
  }),
});

export const { useGetDashboardSettingsQuery, useSaveDashboardSettingsMutation } =
  dashboardApi;

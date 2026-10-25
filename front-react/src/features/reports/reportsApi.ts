import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '../../api/baseQuery';

export interface ReportTaskRow {
  id: number;
  title: string;
  description: string;
  year: number;
  month: number;
  enterDate: string;
  enterTime: string;
  profile: { id: number; firstName: string; lastName: string };
  service: { id: number; name: string } | null;
  component: { id: number; name: string } | null;
  author: { id: number; firstName: string; lastName: string };
}

export interface ReportResponse {
  content: ReportTaskRow[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface ReportQueryParams {
  title?: string;
  years?: number[];
  months?: number[];
  profileIds?: number[];
  serviceIds?: number[];
  componentIds?: number[];
  sort?: string[]; // ['year,asc', 'month,desc']
  page?: number;
  size?: number;
}

export const reportsApi = createApi({
  reducerPath: 'reportsApi',
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    getReportData: builder.query<ReportResponse, ReportQueryParams>({
      query: (params) => {
        // Кастомная сборка строки запроса по вашему стандарту
        const queryParts: string[] = [];

        if (params.title) queryParts.push(`title=${encodeURIComponent(params.title)}`);
        if (params.years && params.years.length > 0)
          queryParts.push(`years=${params.years.join(',')}`);
        if (params.months && params.months.length > 0)
          queryParts.push(`months=${params.months.join(',')}`);
        if (params.profileIds && params.profileIds.length > 0)
          queryParts.push(`profileIds=${params.profileIds.join(',')}`);
        if (params.serviceIds && params.serviceIds.length > 0)
          queryParts.push(`serviceIds=${params.serviceIds.join(',')}`);
        if (params.componentIds && params.componentIds.length > 0)
          queryParts.push(`componentIds=${params.componentIds.join(',')}`);

        if (params.sort && params.sort.length > 0) {
          params.sort.forEach((s) => queryParts.push(`sort=${s}`));
        }

        queryParts.push(`page=${params.page ?? 0}`);
        queryParts.push(`size=${params.size ?? 10}`);

        const queryString = queryParts.join('&');
        return {
          url: `/report?${queryString}`,
          method: 'GET',
        };
      },
    }),
    getProfilesDirectory: builder.query<
      { id: number; firstName: string; lastName: string }[],
      void
    >({
      query: () => ({ url: '/auth/user', method: 'GET' }), // Или используйте ваш эндпоинт directory/profile
    }),
  }),
});

export const { useGetReportDataQuery, useGetProfilesDirectoryQuery } = reportsApi;

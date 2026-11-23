import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '../../api/baseQuery';

export interface TestSectionItem {
  id: number;
  title: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  testsCount: number;
}

export interface TestSummaryItem {
  id: number;
  sectionId: number;
  title: string;
  description?: string;
  questionsLimit: number;
  bankQuestionsCount: number;
  hasTimeLimit: boolean;
  timeLimitMinutes?: number | null;
  isHidden: boolean;
  userAttemptsCount: number;
  canStartNow: boolean;
  hasInProgressAttempt: boolean;
  lastScorePercent?: number | null;
}

export interface TestOptionUpsert {
  id?: number;
  code: string;
  optionText: string;
  isCorrect: boolean;
}

export interface TestQuestionUpsert {
  id?: number;
  questionText: string;
  sortOrder: number;
  options: TestOptionUpsert[];
}

export interface TestAdminDetail {
  id: number;
  sectionId: number;
  title: string;
  description?: string;
  questionsLimit: number;
  hasTimeLimit: boolean;
  timeLimitMinutes?: number | null;
  isHidden: boolean;
  questions: TestQuestionUpsert[];
}

export interface AttemptOptionView {
  id: number;
  code: string;
  optionText: string;
}

export interface AttemptQuestionView {
  attemptAnswerId: number;
  questionId: number;
  questionOrder: number;
  questionText: string;
  isMultipleChoice: boolean;
  options: AttemptOptionView[];
  isAnswered: boolean;
  selectedCodes: string[];
  answeredAt?: string | null;
}

export interface TestAttemptSession {
  attemptId: number;
  testId: number;
  testTitle: string;
  attemptNumber: number;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED';
  startedAt: string;
  finishedAt?: string | null;
  hasTimeLimit: boolean;
  timeLimitMinutes?: number | null;
  remainingSeconds?: number | null;
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  scorePercent: number;
  questions: AttemptQuestionView[];
}

export interface TestEmployeeControlRow {
  profileId: number;
  fullName: string;
  departmentName: string;
  positionName: string;
  attemptsCount: number;
  unusedExtraGrantsCount: number;
  bestScorePercent: number;
  lastScorePercent: number;
  lastStatus: string;
  lastAttemptDate: string;
}

export interface TestQuestionStat {
  questionId: number;
  sortOrder: number;
  questionText: string;
  timesAsked: number;
  correctAnswersCount: number;
  correctPercent: number;
}

export interface TestControlOverview {
  testId: number;
  testTitle: string;
  sectionTitle: string;
  questionsLimit: number;
  totalParticipants: number;
  completedAttemptsTotal: number;
  averageScorePercent: number;
  employees: TestEmployeeControlRow[];
  questionStats: TestQuestionStat[];
}

export interface AttemptProtocolAnswer {
  questionOrder: number;
  questionText: string;
  selectedCodes: string;
  correctCodes: string;
  isAnswered: boolean;
  isCorrect: boolean;
  answeredAt?: string | null;
}

export interface AttemptProtocol {
  attemptId: number;
  attemptNumber: number;
  status: string;
  startedAt: string;
  finishedAt?: string | null;
  testTitle: string;
  sectionTitle: string;
  employeeFullName: string;
  departmentName: string;
  positionName: string;
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  scorePercent: number;
  answers: AttemptProtocolAnswer[];
}

export const testingApi = createApi({
  reducerPath: 'testingApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['TestSections', 'SectionTests', 'TestAdmin', 'TestControl'],
  endpoints: (builder) => ({
    // Разделы
    getTestSections: builder.query<TestSectionItem[], void>({
      query: () => ({ url: '/testing/sections', method: 'GET' }),
      keepUnusedDataFor: 0,
      providesTags: ['TestSections'],
    }),
    createTestSection: builder.mutation<TestSectionItem, Partial<TestSectionItem>>({
      query: (body) => ({ url: '/testing/sections', method: 'POST', data: body }),
      invalidatesTags: ['TestSections'],
    }),
    updateTestSection: builder.mutation<
      TestSectionItem,
      { id: number; data: Partial<TestSectionItem> }
    >({
      query: ({ id, data }) => ({
        url: `/testing/sections/${id}`,
        method: 'PATCH',
        data,
      }),
      invalidatesTags: ['TestSections'],
    }),
    deleteTestSection: builder.mutation<boolean, number>({
      query: (id) => ({ url: `/testing/sections/${id}`, method: 'DELETE' }),
      invalidatesTags: ['TestSections'],
    }),

    // Тесты раздела и редактор
    getTestsBySection: builder.query<TestSummaryItem[], number>({
      query: (sectionId) => ({
        url: `/testing/sections/${sectionId}/tests`,
        method: 'GET',
      }),
      providesTags: (_res, _err, sectionId) => [{ type: 'SectionTests', id: sectionId }],
    }),
    getTestAdminDetail: builder.query<TestAdminDetail, number>({
      query: (testId) => ({ url: `/testing/tests/${testId}/admin`, method: 'GET' }),
      providesTags: (_res, _err, testId) => [{ type: 'TestAdmin', id: testId }],
    }),
    createTest: builder.mutation<TestAdminDetail, Partial<TestAdminDetail>>({
      query: (body) => ({ url: '/testing/tests', method: 'POST', data: body }),
      invalidatesTags: ['SectionTests', 'TestSections'],
    }),
    updateTest: builder.mutation<
      TestAdminDetail,
      { testId: number; data: Partial<TestAdminDetail> }
    >({
      query: ({ testId, data }) => ({
        url: `/testing/tests/${testId}`,
        method: 'PATCH',
        data,
      }),
      invalidatesTags: (_res, _err, { testId }) => [
        'SectionTests',
        { type: 'TestAdmin', id: testId },
      ],
    }),
    deleteTest: builder.mutation<boolean, number>({
      query: (testId) => ({ url: `/testing/tests/${testId}`, method: 'DELETE' }),
      invalidatesTags: ['SectionTests', 'TestSections'],
    }),

    // Прохождение теста
    startTestAttempt: builder.mutation<TestAttemptSession, number>({
      query: (testId) => ({ url: `/testing/tests/${testId}/start`, method: 'POST' }),
      invalidatesTags: ['SectionTests', 'TestControl'],
    }),
    submitTestAnswer: builder.mutation<
      TestAttemptSession,
      { attemptId: number; questionId: number; selectedCodes: string[] }
    >({
      query: ({ attemptId, questionId, selectedCodes }) => ({
        url: `/testing/attempts/${attemptId}/answer`,
        method: 'POST',
        data: { questionId, selectedCodes },
      }),
      invalidatesTags: ['SectionTests', 'TestControl'],
    }),
    finishTestAttempt: builder.mutation<
      TestAttemptSession,
      { attemptId: number; expired?: boolean }
    >({
      query: ({ attemptId, expired = false }) => ({
        url: `/testing/attempts/${attemptId}/finish`,
        method: 'POST',
        params: { expired },
      }),
      invalidatesTags: ['SectionTests', 'TestControl'],
    }),

    // Контроль тестирования
    getTestControlOverview: builder.query<TestControlOverview, number>({
      query: (testId) => ({ url: `/testing/tests/${testId}/control`, method: 'GET' }),
      providesTags: (_res, _err, testId) => [{ type: 'TestControl', id: testId }],
    }),
    getEmployeeProtocols: builder.query<
      AttemptProtocol[],
      { testId: number; profileId: number }
    >({
      query: ({ testId, profileId }) => ({
        url: `/testing/tests/${testId}/control/employees/${profileId}`,
        method: 'GET',
      }),
      providesTags: (_res, _err, { testId }) => [{ type: 'TestControl', id: testId }],
    }),
    grantExtraAttempt: builder.mutation<boolean, { testId: number; profileId: number }>({
      query: ({ testId, profileId }) => ({
        url: `/testing/tests/${testId}/control/employees/${profileId}/grant`,
        method: 'POST',
      }),
      invalidatesTags: (_res, _err, { testId }) => [
        { type: 'TestControl', id: testId },
        'SectionTests',
      ],
    }),
  }),
});

export const {
  useGetTestSectionsQuery,
  useCreateTestSectionMutation,
  useUpdateTestSectionMutation,
  useDeleteTestSectionMutation,
  useGetTestsBySectionQuery,
  useLazyGetTestAdminDetailQuery,
  useCreateTestMutation,
  useUpdateTestMutation,
  useDeleteTestMutation,
  useStartTestAttemptMutation,
  useSubmitTestAnswerMutation,
  useFinishTestAttemptMutation,
  useGetTestControlOverviewQuery,
  useGetEmployeeProtocolsQuery,
  useGrantExtraAttemptMutation,
} = testingApi;

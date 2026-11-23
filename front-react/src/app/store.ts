import { combineReducers, configureStore, type UnknownAction } from '@reduxjs/toolkit';
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import authReducer, { logOut } from '../features/auth/authSlice';
import { authApi } from '../features/auth/authApi';
import { adminAuthApi } from '../features/admin/adminAuthApi';
import { directoriesApi } from '../features/directories/directoriesApi';
import { tasksApi } from '../features/tasks/tasksApi';
import { reportsApi } from '../features/reports/reportsApi';
import { bookingsApi } from '../features/bookings/bookingsApi';
import { testingApi } from '../features/testing/testingApi';

const appReducer = combineReducers({
  auth: authReducer,
  [authApi.reducerPath]: authApi.reducer,
  [adminAuthApi.reducerPath]: adminAuthApi.reducer,
  [directoriesApi.reducerPath]: directoriesApi.reducer,
  [tasksApi.reducerPath]: tasksApi.reducer,
  [reportsApi.reducerPath]: reportsApi.reducer,
  [bookingsApi.reducerPath]: bookingsApi.reducer,
  [testingApi.reducerPath]: testingApi.reducer,
});

const rootReducer = (
  state: ReturnType<typeof appReducer> | undefined,
  action: UnknownAction,
) => {
  if (action.type === logOut.type) {
    state = undefined;
  }
  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      adminAuthApi.middleware,
      directoriesApi.middleware,
      tasksApi.middleware,
      reportsApi.middleware,
      bookingsApi.middleware,
      testingApi.middleware,
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

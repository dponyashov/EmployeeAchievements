import { configureStore, createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import authReducer, { logOut } from '../features/auth/authSlice';
import { authApi } from '../features/auth/authApi';
import { adminAuthApi } from '../features/admin/adminAuthApi';
import { directoriesApi } from '../features/directories/directoriesApi';
import { tasksApi } from '../features/tasks/tasksApi';
import { reportsApi } from '../features/reports/reportsApi';
import { bookingsApi } from '../features/bookings/bookingsApi';
import { testingApi } from '../features/testing/testingApi';
import { injectStoreToAxios } from '../api/axios';

const authResetListener = createListenerMiddleware();

authResetListener.startListening({
  matcher: isAnyOf(logOut, authApi.endpoints.login.matchFulfilled),
  effect: (_action, listenerApi) => {
    listenerApi.dispatch(adminAuthApi.util.resetApiState());
    listenerApi.dispatch(directoriesApi.util.resetApiState());
    listenerApi.dispatch(tasksApi.util.resetApiState());
    listenerApi.dispatch(reportsApi.util.resetApiState());
    listenerApi.dispatch(bookingsApi.util.resetApiState());
    listenerApi.dispatch(testingApi.util.resetApiState());
  },
});

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [adminAuthApi.reducerPath]: adminAuthApi.reducer,
    [directoriesApi.reducerPath]: directoriesApi.reducer,
    [tasksApi.reducerPath]: tasksApi.reducer,
    [reportsApi.reducerPath]: reportsApi.reducer,
    [bookingsApi.reducerPath]: bookingsApi.reducer,
    [testingApi.reducerPath]: testingApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .prepend(authResetListener.middleware)
      .concat(
        authApi.middleware,
        adminAuthApi.middleware,
        directoriesApi.middleware,
        tasksApi.middleware,
        reportsApi.middleware,
        bookingsApi.middleware,
        testingApi.middleware,
      ),
});

injectStoreToAxios(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

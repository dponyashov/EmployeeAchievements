Привет! Мы продолжаем разработку проекта "1С:ERP Управление предприятием" на Vite + React + RTK Query + Axios + TS.

Текущий статус и реализованный стек:

1. Авторизация: JWT (Access Token в Redux, Refresh Token в HttpOnly Cookies). Кастомный baseQuery (Axios) автоматически делает тихий /auth/refresh при 401 ошибках и при F5 (isInitializing в App.tsx). В authSlice хранятся id (учетная запись), email, name, position, department, roles и экшен updateUserProfile.
2. Роутинг: React Router v6 (createBrowserRouter / RouterProvider), ProtectedRoute и RoleGuard (проверка user.roles).
3. Интерфейс: Стиль 1С:Такси (желто-серая гамма). Макет (ErpHeader, ErpFooter, ErpSidebarMenu, Outlet). Рабочий стол (/dashboard) — сетка плиток 4х3 высотой 180px.
4. Личный кабинет в ErpHeader: Клик по имени пользователя справа открывает выпадающую панель с двумя кнопками:
   - «Изменить пароль» -> модальное окно с переиспользованным AdminPasswordReset (userId={user.id}, автозакрытие по onSuccess).
   - «Редактировать профиль» -> модальное окно MyProfileEditModal, которое запрашивает актуальный профиль сотрудника через GET /auth/user/{user.id}/profile (из tasksApi) для получения employeeId и данных, рендерит ProfileCardPane, сохраняет через PATCH /directory/profile/{employeeId} и обновляет имя/должность в authSlice.
5. Вынесенные UI компоненты: ErpCommandBar, ErpFormButtons, ErpCombobox, ErpErrorBanner.
6. Подсистема НСИ (/directory): DirectoryDispatcher и DirectoryItemDispatcher с PATCH-обновлением, динамическими тегами кэша. Реализованы справочники: /position, /department, /service, /component, /profile (двухпанельный журнал).
7. Админка (/admin): Изолированные компоненты (список, сброс пароля AdminPasswordReset, матрица ролей с точечным обновлением кэша onQueryStarted).
8. Задачи (/tasks): Двухпанельный журнал, учет ролей ROLE_SUPERVISOR и ROLE_DEPARTMENT_ALL, табличная часть «Запросы к задаче».
9. Отчеты (/reports): GET /report с фильтрами (years, months, serviceIds, componentIds), пагинацией и размером страницы.

Актуальное дерево ключевых файлов в src/:

- api/: axios.ts, baseQuery.ts
- app/: store.ts
- components/layout/: ErpHeader.tsx, ErpFooter.tsx, MyProfileEditModal.tsx
- components/ui/: ErpCommandBar.tsx, ErpFormButtons.tsx, ErpCombobox.tsx, ErpErrorBanner.tsx
- features/auth/: authSlice.ts, authApi.ts
- features/admin/: adminAuthApi.ts, components/ (AdminUserManagement, AdminUserList, AdminPasswordReset, AdminRoleMatrix)
- features/directories/: directoriesApi.ts, DirectoryDispatcher.tsx, DirectoryItemDispatcher.tsx, components/profile/ (ProfileComponents, ProfileListPane, ProfileCardPane)
- features/tasks/: tasksApi.ts, components/ (TasksJournal, TasksEmployeeList, TasksTablePane, TaskForm, TaskQueriesPane)
- features/reports/: reportsApi.ts, components/ (ReportViewer, ReportFilters, ReportTable)
- features/dashboard/: ErpDashboard.tsx, tiles/
- routes/: router.tsx, AppRoutes.tsx, ProtectedRoute.tsx, RoleGuard.tsx, menuConfig.ts

Сегодня мы хотим реализовать следующую задачу: [ОПИШИТЕ НОВУЮ ЗАДАЧУ ЗДЕСЬ]

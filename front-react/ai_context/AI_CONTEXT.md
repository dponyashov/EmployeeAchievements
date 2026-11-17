# AI_CONTEXT.md — Проект «1С:ERP Управление предприятием» (Frontend)

## 1. Технологический стек и сборка

- **Core:** Vite + React + TypeScript
- **State & Data Fetching:** Redux Toolkit + RTK Query + Axios (кастомный `axiosBaseQuery`)
- **Routing:** React Router v6 (`createBrowserRouter` / `RouterProvider`)
- **Экспорт документов:** `xlsx` (SheetJS) для Excel, `jspdf` + `jspdf-autotable` (с локальным шрифтом `public/fonts/DejaVuSans.ttf`) для PDF
- **Сборка и деплой:** Docker (в корне проекта настроен `.npmrc` с `legacy-peer-deps=true` для совместимости `eslint@10` / `typescript@6` и `typescript-eslint@8` при `npm ci`)

---

## 2. Архитектура авторизации и безопасности

- **Механизм токенов:**
  - `Access Token` хранится в Redux (`state.auth.accessToken`).
  - `Refresh Token` хранится в `HttpOnly Cookie` (`withCredentials: true` в `axiosInstance`).
- **Защита от разлогинивания при простое и гонке запросов:**
  - `src/api/axios.ts` (`injectStoreToAxios`): подставляет `Authorization: Bearer <token>` во все запросы, **кроме** эндпоинтов `/auth/refresh`, `/auth/login`, `/auth/registry`.
  - `src/api/baseQuery.ts` (`executeSilentRefresh`): единый промис-мьютекс (`refreshPromise`) для `POST /auth/refresh`. Предотвращает гонку параллельных 401-запросов и вызывает `logOut()` только при явном ответе `401`/`403` от `/auth/refresh`.
  - `src/App.tsx`:
    1. Инициализация сессии при загрузке/F5 (`isInitializing`).
    2. Проактивное фоновое обновление токена по таймеру за 60 секунд до истечения `exp` из JWT и при возврате на вкладку (`visibilitychange`).
- **Роутинг и права доступа (`src/routes/`):**
  - Стили роутинга вынесены в `src/routes/routes.css`.
  - Абсолютные пути, защищенные через `ProtectedRoute` и `RoleGuard` (проверка ролей `ROLE_ADMIN`, `ROLE_USER`, `ROLE_REPORT`, `ROLE_SUPERVISOR`, `ROLE_DEPARTMENT_ALL`).

---

## 3. Дизайн-система, макет и общие UI-компоненты

- **Стиль:** «1С:Такси» (желто-серая гамма, шапка `#FFCC00`). Все инлайн-стили вынесены из TSX в модульные CSS-файлы по подсистемам.
- **Макет (`src/layouts/` и `src/components/layout/`):**
  - `MainLayout.tsx` + очищенный `MainLayout.css` (боковое меню + рабочая зона `Outlet`).
  - `AuthLayout.tsx` + `AuthLayout.css` (авторизация и регистрация).
  - `ErpHeader.tsx`, `ErpFooter.tsx`, `MyProfileEditModal.tsx` + `src/components/layout/layout.css` (шапка с `overflow: visible !important`, выпадающая панель пользователя, модальные окна через `createPortal(..., document.body)`).
- **Общие UI-компоненты (`src/components/ui/` + `ui.css`):**
  - `ErpCommandBar.tsx` — командная панель списков (Создать, Изменить, Удалить, Обновить + строка поиска).
  - `ErpFormButtons.tsx` — кнопки сохранения/отмены форм (`type="submit"`).
  - `ErpCombobox.tsx` — выпадающий список с поиском.
  - `ErpErrorBanner.tsx` — баннер ошибок с рекурсивным разбором `400 Bad Request` (`parseErpError.ts`).
  - `ErpPagination.tsx` — панель пагинации («Всего записей», «Назад / Вперед», «Страница X из Y»).
  - `ErpColumnSelector.tsx` — переключатель видимости столбцов с чекбоксами, защитой от скрытия последнего столбца, кнопкой «Показать все» и слотом `extraActions`.

---

## 4. Реализованные подсистемы

### 4.1. Рабочий стол (`src/features/dashboard/` + `dashboard.css`)

- `ErpDashboard.tsx` и плитки `AdminTile`, `DirectoriesTile`, `EmployeesTile`, `TasksTile`, `ReportsTile`.
- Сетка плиток 4x3 высотой `180px` (`grid-auto-rows: 180px`, `display: contents` на обертках, синхронизация с `menuConfig.ts`).
- `TasksTile.tsx` учитывает три уровня ролей при подсчёте задач: `ROLE_DEPARTMENT_ALL` (все сотрудники через `useLazyGetAllEmployeesQuery`), `ROLE_SUPERVISOR` (сотрудники отдела) и обычный пользователь (только личные задачи).

### 4.2. Личный кабинет пользователя в шапке (`ErpHeader.tsx`)

- Выпадающая панель под именем пользователя с двумя действиями:
  1. **«Изменить пароль»** — портальное модальное окно с переиспользованным `AdminPasswordReset` (`userId={user.id}`, `autoComplete="new-password"`, закрытие по `onSuccess`).
  2. **«Редактировать профиль»** — портальное модальное окно `MyProfileEditModal.tsx` (запрос `GET /auth/user/{user.id}/profile`, сохранение через `PATCH /directory/profile/{employeeId}` и обновление `authSlice` через `updateUserProfile`).

### 4.3. Подсистема НСИ / Справочники (`src/features/directories/` + `directories.css`)

- Управляется метаданными с сервера (`GET /directory`).
- `DirectoryDispatcher`, `DirectoryItemDispatcher` с `PATCH`-обновлением и тегами кэша `DirectoryList`.
- Справочники: `PositionComponents` (`/position`), `DepartmentComponents` (`/department`), `ServiceComponents` (`/service`), `ComponentComponents` (`/component`), `ProfileComponents` + `ProfileListPane` + `ProfileCardPane` (`/profile`).

### 4.4. Администрирование (`src/features/admin/` + `admin.css`)

- `AdminUserManagement`, `AdminUserList`, `AdminPasswordReset` (с отключенным автозаполнением пароля), `AdminRoleMatrix` (ленивый дозапрос `GET /auth/user/{id}/roles` и оптимистичное обновление кэша в `onQueryStarted`).

### 4.5. Мои задачи (`src/features/tasks/` + `tasks.css`)

- Двухпанельный журнал (`TasksJournal`, `TasksEmployeeList`, `TasksTablePane`, `TaskForm`, `TaskQueriesPane`).
- Поддержка ролей `ROLE_SUPERVISOR` и `ROLE_DEPARTMENT_ALL`.
- В `TasksTablePane` хранится `selectedTaskId: number | null` (актуальный объект задачи берется из свежего кэша `tasks`, что обеспечивает мгновенное обновление списка запросов после добавления/удаления; при смене сотрудника `selectedTaskId` сбрасывается, а при отсутствии выбранной задачи отображается заглушка).

### 4.6. Отчеты и анализ (`src/features/reports/` + `reports.css`)

- `ReportViewer`, `ReportFilters`, `ReportTable`, `ReportExportModal`.
- Колонки отчета (включая **«Запросы»** в конце таблицы, без лишних завершающих точек у значений) настраиваются через `ErpColumnSelector` с сохранением в `localStorage` (`erp_report_visible_columns`).
- **Выгрузка всех страниц сразу:** через `useLazyGetReportDataQuery` запрашиваются все записи (`size: totalElements`) с учетом только видимых столбцов:
  - `utils/exportReportToExcel.ts` — экспорт в `.xlsx` (`Отчет_YYYY-MM-DD_HH-mm-ss.xlsx`).
  - `utils/exportReportToPdf.ts` — экспорт в альбомный `.pdf` (`Отчет_YYYY-MM-DD_HH-mm-ss.pdf`) с локальным кириллическим шрифтом `/fonts/DejaVuSans.ttf`.

---

## 5. Структура файлов проекта (`src/`)

- `api/`: `axios.ts`, `baseQuery.ts`
- `app/`: `store.ts`
- `components/layout/`: `ErpHeader.tsx`, `ErpFooter.tsx`, `MyProfileEditModal.tsx`, `layout.css`
- `components/ui/`: `ErpCommandBar.tsx`, `ErpFormButtons.tsx`, `ErpCombobox.tsx`, `ErpErrorBanner.tsx`, `ErpPagination.tsx`, `ErpColumnSelector.tsx`, `ui.css`
- `features/admin/`: `adminAuthApi.ts`, `admin.css`, `components/` (`AdminUserManagement.tsx`, `AdminUserList.tsx`, `AdminPasswordReset.tsx`, `AdminRoleMatrix.tsx`)
- `features/auth/`: `authSlice.ts`, `authApi.ts`
- `features/dashboard/`: `ErpDashboard.tsx`, `dashboard.css`, `tiles/` (`AdminTile.tsx`, `DirectoriesTile.tsx`, `EmployeesTile.tsx`, `ReportsTile.tsx`, `TasksTile.tsx`)
- `features/directories/`: `directoriesApi.ts`, `DirectoryDispatcher.tsx`, `DirectoryItemDispatcher.tsx`, `directories.css`, `components/` (`PositionComponents.tsx`, `DepartmentComponents.tsx`, `ServiceComponents.tsx`, `ComponentComponents.tsx`, `profile/`)
- `features/reports/`: `reportsApi.ts`, `reports.css`, `components/` (`ReportViewer.tsx`, `ReportFilters.tsx`, `ReportTable.tsx`, `ReportExportModal.tsx`), `utils/` (`exportReportToExcel.ts`, `exportReportToPdf.ts`)
- `features/tasks/`: `tasksApi.ts`, `tasks.css`, `components/` (`TasksJournal.tsx`, `TasksEmployeeList.tsx`, `TasksTablePane.tsx`, `TaskForm.tsx`, `TaskQueriesPane.tsx`)
- `layouts/`: `MainLayout.tsx`, `MainLayout.css`, `AuthLayout.tsx`, `AuthLayout.css`
- `routes/`: `router.tsx`, `AppRoutes.tsx`, `ProtectedRoute.tsx`, `RoleGuard.tsx`, `menuConfig.ts`, `routes.css`

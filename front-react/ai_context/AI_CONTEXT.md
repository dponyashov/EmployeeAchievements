# AI_CONTEXT.md — Проект «1С:ERP Управление предприятием» (Frontend & Integration)

## 1. Технологический стек и сборка

- **Core:** Vite + React + TypeScript
- **State & Data Fetching:** Redux Toolkit + RTK Query + Axios (кастомный `axiosBaseQuery`, префикс `/api`)
- **Backend & DB:** Java 21 + Spring Boot (`back-java`) + PostgreSQL 17 + Flyway (`V01`..`V04`)
- **Routing:** React Router v6 (`createBrowserRouter` / `RouterProvider`)
- **Экспорт документов:** `xlsx` (SheetJS) для Excel, `jspdf` + `jspdf-autotable` (с локальным шрифтом `public/fonts/DejaVuSans.ttf`) для PDF
- **Сборка и деплой:** Docker (`docker-compose.yml`, Nginx-прокси `/api/` -> `backend-java:8080`). Переменные `VITE_*` прокидываются на этапе сборки через `build.args` в `docker-compose.yml` и `ARG`/`ENV` в `Dockerfile` (`VITE_BACK_URL`, `VITE_APP_TITLE`, `VITE_NEWS_APP_URL`). В корне настроен `.npmrc` с `legacy-peer-deps=true`.

---

## 2. Архитектура авторизации, JWT и SSO

- **Механизм токенов:**
  - `Access Token` хранится в Redux (`state.auth.accessToken`).
  - `Refresh Token` хранится в `HttpOnly Cookie` (`withCredentials: true` в `axiosInstance`).
  - **Формат ключа подписи (Backend):** в обоих Java-бэкендах (`back-java` и `news-keeper-back`) используется единый криптографический стандарт **Base64-декодирования** секрета (`Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret))` / `Base64.getDecoder().decode(secret)`) с общим `JWT_ACCESS_SECRET`.
- **Защита от разлогинивания при простое и гонке запросов:**
  - `src/api/axios.ts` (`injectStoreToAxios`): подставляет `Authorization: Bearer <token>` во все запросы, **кроме** `/auth/refresh`, `/auth/login`, `/auth/registry`.
  - `src/api/baseQuery.ts` (`executeSilentRefresh`): единый промис-мьютекс (`refreshPromise`) для `POST /auth/refresh`. Предотвращает гонку параллельных 401-запросов и вызывает `logOut()` только при явном ответе `401`/`403` от `/auth/refresh`.
  - `src/App.tsx`:
    1. Инициализация сессии при загрузке/F5 (`isInitializing`).
    2. Проактивное фоновое обновление токена по таймеру за 60 секунд до истечения `exp` из JWT и при возврате на вкладку (`visibilitychange`).
- **Роутинг и права доступа (`src/routes/` + `routes.css`):**
  - Защита маршрутов через `ProtectedRoute` и `RoleGuard` (`ROLE_ADMIN`, `ROLE_USER`, `ROLE_SERVICE`, `ROLE_REPORT`, `ROLE_SUPERVISOR`, `ROLE_DEPARTMENT_ALL`, `ROLE_NEWSMAKER`).

---

## 3. Дизайн-система, макет и общие UI-компоненты

- **Стиль:** «1С:Такси» (желто-серая гамма, шапка `#FFCC00`). Все инлайн-стили полностью вынесены из TSX в модульные CSS-файлы по подсистемам.
- **Макет (`src/layouts/` и `src/components/layout/`):**
  - `MainLayout.tsx` + очищенный `MainLayout.css` (боковое меню + рабочая зона `Outlet`).
  - `AuthLayout.tsx` + `AuthLayout.css` (авторизация и регистрация).
  - `ErpHeader.tsx`, `ErpFooter.tsx` (`.erp-footer` высотой `25px`), `MyProfileEditModal.tsx` + `src/components/layout/layout.css` (шапка с `overflow: visible !important`, выпадающая панель пользователя, модальные окна через `createPortal(..., document.body)`).
- **Общие UI-компоненты (`src/components/ui/` + `ui.css`):**
  - `ErpCommandBar.tsx` — командная панель списков (Создать, Изменить, Удалить, Обновить + поиск).
  - `ErpFormButtons.tsx` — кнопки сохранения/отмены форм (`type="submit"`).
  - `ErpCombobox.tsx` — выпадающий список с поиском.
  - `ErpErrorBanner.tsx` — баннер ошибок с рекурсивным разбором `400 Bad Request` (`parseErpError.ts`).
  - `ErpPagination.tsx` — панель пагинации («Всего записей», «Назад / Вперед», «Страница X из Y»).
  - `ErpColumnSelector.tsx` — переключатель видимости столбцов с чекбоксами, защитой от скрытия последнего столбца, кнопкой «Показать все» и слотом `extraActions`.

---

## 4. Реализованные подсистемы

### 4.1. Рабочий стол (`src/features/dashboard/` + `dashboard.css`)

- `ErpDashboard.tsx` и плитки: `AdminTile`, `DirectoriesTile`, `EmployeesTile`, `TasksTile`, `ReportsTile`, `NewsTile`, `BookingsTile`.
- Сетка плиток 4x3 высотой `180px` (`grid-auto-rows: 180px`, `display: contents` на обертках, синхронизация с `menuConfig.ts`).
- `TasksTile.tsx` учитывает три уровня ролей при подсчете задач: `ROLE_DEPARTMENT_ALL` (все сотрудники через `useLazyGetAllEmployeesQuery`), `ROLE_SUPERVISOR` (сотрудники отдела) и обычный пользователь (личные задачи).

### 4.2. Бронирование помещений / Переговорные (`src/features/bookings/` + `bookings.css`)

- **Бэкенд (`back-java`):** миграция Flyway `V04__create_meeting_rooms.sql` (`t_meeting_rooms`, `t_room_bookings`), сущности `MeetingRoomEntity` и `RoomBookingEntity`, контроллеры `MeetingRoomController` (`/api/directory/room`) и `RoomBookingController` (`/api/booking`).
- **Бизнес-логика:** проверка пересечения временных интервалов по комнате и дате; редактировать/отменять бронь может её автор или пользователь с ролями `ROLE_ADMIN`, `ROLE_SUPERVISOR`, `ROLE_DEPARTMENT_ALL`.
- **Фронтенд (`BookingsPage.tsx`):**
  - Три вкладки-переключателя: **«🗓️ Шахматка»** (`BookingsTimelineView.tsx`, почасовая сетка `08:00–20:00` с объединением `colSpan` и подсветкой своих/чужих броней), **«📋 Журнал»** (`BookingsJournalTable.tsx` + `ErpCommandBar`), **«🚪 Помещения»** (`RoomsDirectoryTab.tsx` для управления списком комнат ролями `ROLE_ADMIN`, `ROLE_SERVICE`, `ROLE_DEPARTMENT_ALL`).
  - Портальное модальное окно `BookingFormModal.tsx` с быстрым заполнением при клике на свободный слот шахматки.

### 4.3. Подсистема «Новости» (`src/features/news/` + `news.css`)

- Внешнее React-приложение (`news-keeper-front` + `news-keeper-back`), встраиваемое как микрофронтенд через `<iframe>` в `NewsHostPage.tsx` (маршрут `/news`, доступ для `ROLE_USER`, `ROLE_NEWSMAKER`, `ROLE_ADMIN`).
- **Бесшовный вход (SSO):** `NewsHostPage.tsx` передает актуальный `accessToken` из Redux через query-параметр `?token=...` в URL `VITE_NEWS_APP_URL`. При обновлении токена в ERP (`key={accessToken}`) `iframe` автоматически получает свежий токен.

### 4.4. Личный кабинет пользователя в шапке (`ErpHeader.tsx`)

- Выпадающая панель под именем пользователя с двумя портальными модальными окнами:
  1. **«Изменить пароль»** — `AdminPasswordReset` (`userId={user.id}`, `autoComplete="new-password"`, закрытие по `onSuccess`).
  2. **«Редактировать профиль»** — `MyProfileEditModal.tsx` (`GET /auth/user/{user.id}/profile`, сохранение через `PATCH /directory/profile/{employeeId}` и обновление `authSlice`).

### 4.5. Подсистема НСИ / Справочники (`src/features/directories/` + `directories.css`)

- Управляется метаданными с сервера (`GET /directory`).
- `DirectoryDispatcher`, `DirectoryItemDispatcher` с `PATCH`-обновлением и тегами кэша `DirectoryList`.
- Справочники: `PositionComponents` (`/position`), `DepartmentComponents` (`/department`), `ServiceComponents` (`/service`), `ComponentComponents` (`/component`), `ProfileComponents` + `ProfileListPane` + `ProfileCardPane` (`/profile`).

### 4.6. Администрирование (`src/features/admin/` + `admin.css`)

- `AdminUserManagement`, `AdminUserList`, `AdminPasswordReset` (с отключенным автозаполнением пароля), `AdminRoleMatrix` (ленивый дозапрос `GET /auth/user/{id}/roles` и оптимистичное обновление кэша в `onQueryStarted`).

### 4.7. Мои задачи (`src/features/tasks/` + `tasks.css`)

- Двухпанельный журнал (`TasksJournal`, `TasksEmployeeList`, `TasksTablePane`, `TaskForm`, `TaskQueriesPane`).
- Поддержка ролей `ROLE_SUPERVISOR` и `ROLE_DEPARTMENT_ALL`.
- В `TasksTablePane` хранится `selectedTaskId: number | null` (актуальный объект задачи берется из свежего кэша `tasks` для мгновенного обновления списка запросов).

### 4.8. Отчеты и анализ (`src/features/reports/` + `reports.css`)

- `ReportViewer`, `ReportFilters`, `ReportTable`, `ReportExportModal`.
- Колонки отчета (включая **«Запросы»**) настраиваются через `ErpColumnSelector` с сохранением в `localStorage` (`erp_report_visible_columns`).
- **Выгрузка всех страниц сразу:** через `useLazyGetReportDataQuery` (`size: totalElements`) с учетом только видимых столбцов:
  - `utils/exportReportToExcel.ts` — экспорт в `.xlsx`.
  - `utils/exportReportToPdf.ts` — экспорт в альбомный `.pdf` с локальным шрифтом `/fonts/DejaVuSans.ttf`.

---

## 5. Структура файлов проекта (`src/`)

- `api/`: `axios.ts`, `baseQuery.ts`
- `app/`: `store.ts`
- `components/layout/`: `ErpHeader.tsx`, `ErpFooter.tsx`, `MyProfileEditModal.tsx`, `layout.css`
- `components/ui/`: `ErpCommandBar.tsx`, `ErpFormButtons.tsx`, `ErpCombobox.tsx`, `ErpErrorBanner.tsx`, `ErpPagination.tsx`, `ErpColumnSelector.tsx`, `ui.css`
- `features/admin/`: `adminAuthApi.ts`, `admin.css`, `components/` (`AdminUserManagement.tsx`, `AdminUserList.tsx`, `AdminPasswordReset.tsx`, `AdminRoleMatrix.tsx`)
- `features/auth/`: `authSlice.ts`, `authApi.ts`
- `features/bookings/`: `bookingsApi.ts`, `bookings.css`, `components/` (`BookingsPage.tsx`, `BookingsTimelineView.tsx`, `BookingsJournalTable.tsx`, `BookingFormModal.tsx`, `RoomsDirectoryTab.tsx`)
- `features/dashboard/`: `ErpDashboard.tsx`, `dashboard.css`, `tiles/` (`AdminTile.tsx`, `BookingsTile.tsx`, `DirectoriesTile.tsx`, `EmployeesTile.tsx`, `NewsTile.tsx`, `ReportsTile.tsx`, `TasksTile.tsx`)
- `features/directories/`: `directoriesApi.ts`, `DirectoryDispatcher.tsx`, `DirectoryItemDispatcher.tsx`, `directories.css`, `components/` (`PositionComponents.tsx`, `DepartmentComponents.tsx`, `ServiceComponents.tsx`, `ComponentComponents.tsx`, `profile/`)
- `features/news/`: `NewsHostPage.tsx`, `news.css`
- `features/reports/`: `reportsApi.ts`, `reports.css`, `components/` (`ReportViewer.tsx`, `ReportFilters.tsx`, `ReportTable.tsx`, `ReportExportModal.tsx`), `utils/` (`exportReportToExcel.ts`, `exportReportToPdf.ts`)
- `features/tasks/`: `tasksApi.ts`, `tasks.css`, `components/` (`TasksJournal.tsx`, `TasksEmployeeList.tsx`, `TasksTablePane.tsx`, `TaskForm.tsx`, `TaskQueriesPane.tsx`)
- `layouts/`: `MainLayout.tsx`, `MainLayout.css`, `AuthLayout.tsx`, `AuthLayout.css`
- `routes/`: `router.tsx`, `AppRoutes.tsx`, `ProtectedRoute.tsx`, `RoleGuard.tsx`, `menuConfig.ts`, `routes.css`

# AI_CONTEXT.md — Проект «1С:ERP Управление предприятием» (Frontend & Backend Integration)

## 1. Технологический стек, сборка и инфраструктура

- **Frontend Core:** Vite + React + TypeScript
- **State & Data Fetching:** Redux Toolkit + RTK Query + Axios (кастомный `axiosBaseQuery`, префикс `/api`)
- **Backend & DB:** Java 21 + Spring Boot (`back-java`) + PostgreSQL 17 + Flyway (`V01`..`V05`)
- **Routing:** React Router v6 (`createBrowserRouter` / `RouterProvider`). Состояние активных вкладок в подсистемах сохраняется в URL query-параметре `?tab=...` через `useSearchParams` (устойчиво к обновлению страницы `F5`).
- **Экспорт документов:** `xlsx` (SheetJS) для Excel, `jspdf` + `jspdf-autotable` (с локальным шрифтом `public/fonts/DejaVuSans.ttf`) для PDF.
- **Сборка и деплой (Docker & Nginx):**
  - В корне фронтенда настроен `.npmrc` с `legacy-peer-deps=true`.
  - Переменные `VITE_*` прокидываются на этапе сборки через `build.args` в `docker-compose.yml` и `ARG`/`ENV` в `docker/front/Dockerfile`:
    - `VITE_BACK_URL=${BACK_URL}`
    - `VITE_APP_TITLE=${FRONT_TITLE}`
    - `VITE_NEWS_APP_URL=${NEWS_APP_URL}` (корневой URL фронтенда новостей **без** `/api/v1`, например `http://192.168.31`).
  - **Сетевая доступность (UFW):** на сервере должны быть открыты порты фронтенда и бэкенда новостей (`sudo ufw allow 5174/tcp`, `sudo ufw allow 8085/tcp`), чтобы браузеры клиентов в локальной сети могли загружать `iframe` новостей и выполнять API-запросы.

---

## 2. Архитектура безопасности, JWT, SSO и шифрования ПДн

- **Механизм токенов (JWT):**
  - `Access Token` хранится в Redux (`state.auth.accessToken`).
  - `Refresh Token` хранится в `HttpOnly Cookie` (`withCredentials: true` в `axiosInstance`).
  - **Формат ключа подписи (Backend):** в обоих Java-бэкендах (`back-java` и `news-keeper-back`) используется единый криптографический стандарт **Base64-декодирования** секрета (`Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret))` / `Base64.getDecoder().decode(secret)`) с общим `JWT_ACCESS_SECRET` (32-байтовый ключ, сгенерированный через `openssl rand -base64 32`).
- **Защита от разлогинивания при простое и гонке запросов:**
  - `src/api/axios.ts` (`injectStoreToAxios`): подставляет `Authorization: Bearer <token>` во все запросы, **кроме** `/auth/refresh`, `/auth/login`, `/auth/registry`.
  - `src/api/baseQuery.ts` (`executeSilentRefresh`): единый промис-мьютекс (`refreshPromise`) для `POST /auth/refresh`. Предотвращает гонку параллельных 401-запросов и вызывает `logOut()` только при явном ответе `401`/`403` от `/auth/refresh`.
  - `src/App.tsx`: инициализация сессии при загрузке/F5 (`isInitializing`) и проактивное фоновое обновление токена за 60 секунд до истечения `exp` из JWT и при возврате на вкладку (`visibilitychange`).
- **Шифрование персональных данных в БД (`back-java`):**
  - `EncryptedStringConverter` (`ru.ponyashov.employee_achievements.security.crypto`): JPA `AttributeConverter` с алгоритмом **AES-256-GCM** (случайный 12-байтовый IV на каждое сохранение, префикс `ENC:v1:` + Base64, ключ из `PROFILE_ENCRYPTION_KEY` с фолбэком на `JWT_ACCESS_SECRET`). Поддерживает обратную совместимость при чтении старых открытых строк.
  - Применяется к полям `firstName`, `lastName` и `phone` в `ProfileEntity` (колонки `VARCHAR(512)` по миграции `V05__add_phone_and_expand_profile_columns.sql`).
  - `ProfileEncryptionMigrator` (`ApplicationRunner`): при старте приложения автоматически шифрует через `JdbcTemplate` любые оставшиеся открытые (не начинающиеся с `ENC:v1:`) значения в таблице `t_profiles`.
- **Роутинг и права доступа (`src/routes/` + `routes.css`):**
  - Защита маршрутов через `ProtectedRoute` и `RoleGuard` (`ROLE_ADMIN`, `ROLE_USER`, `ROLE_SERVICE`, `ROLE_REPORT`, `ROLE_SUPERVISOR`, `ROLE_DEPARTMENT_ALL`, `ROLE_NEWSMAKER`).

---

## 3. Дизайн-система, единые CSS-переменные и макет

- **Стиль и токены (`src/index.css`):** «1С:Такси» (желто-серая гамма, шапка `#FFCC00`). Все 12 CSS-файлов проекта унифицированы и используют централизованную палитру CSS-переменных в `:root` (`--1c-yellow`, `--1c-yellow-hover`, `--1c-yellow-border`, `--1c-yellow-header-border`, `--1c-yellow-soft`, `--1c-yellow-selected`, `--1c-yellow-tint`, `--1c-white`, `--1c-bg-gray`, `--1c-bg-panel`, `--1c-bg-subtle`, `--1c-bg-sidebar`, `--1c-bg-header-cell`, `--1c-bg-control`, `--1c-border`, `--1c-border-medium`, `--1c-border-strong`, `--1c-border-dark`, `--1c-border-light`, `--1c-border-row`, `--1c-text-dark`, `--1c-text-secondary`, `--1c-text-muted`, `--1c-text-disabled`, `--1c-active-blue`, `--1c-link-dark`, `--1c-row-selected`, `--1c-slot-blue-*`, `--1c-error-*`, `--1c-success-*`, `--1c-overlay-bg`, `--1c-shadow-*`). Инлайн-стили в TSX не используются.
- **Макет и навигация (`src/layouts/` и `src/components/layout/`):**
  - `MainLayout.tsx` + `MainLayout.css`: сворачиваемая левая панель разделов (`.erp-sidebar-menu` / `.erp-sidebar-menu--collapsed`, плавная анимация `width: 220px <-> 0px`, сохранение состояния в `localStorage` под ключом `erp_sidebar_collapsed`) и рабочая область `Outlet`.
  - `ErpHeader.tsx` + `layout.css`: квадратная кнопка-«бутерброд» (`32×32 px`, `.erp-burger-btn` с плавной трансформацией полосок в крестик при открытой панели разделов), выпадающая панель пользователя с портальными модальными окнами (`createPortal(..., document.body)`), безопасный выход с `dispatch(logOut())` в `finally`.
  - `ErpFooter.tsx` + `layout.css` (`.erp-footer` высотой `25px`).
  - `AuthLayout.tsx` + `AuthLayout.css` (авторизация и регистрация).
- **Общие UI-компоненты (`src/components/ui/` + `ui.css`):**
  - `ErpCommandBar.tsx`, `ErpFormButtons.tsx`, `ErpCombobox.tsx`, `ErpErrorBanner.tsx` (рекурсивный разбор ошибок через `parseErpError.ts`), `ErpPagination.tsx`, `ErpColumnSelector.tsx`.

---

## 4. Реализованные подсистемы

### 4.1. Рабочий стол (`src/features/dashboard/` + `dashboard.css`)

- `ErpDashboard.tsx` и плитки: `AdminTile`, `EmployeesTile`, `TasksTile`, `ReportsTile`, `NewsTile`, `BookingsTile` (отдельная плитка и пункт меню общих справочников удалены — справочники встроены вкладками в профильные разделы).
- Сетка плиток 4x3 высотой `180px` (`grid-auto-rows: 180px`, `display: contents` на обертках, синхронизация с `menuConfig.ts`).
- `TasksTile.tsx` учитывает три уровня ролей при подсчете задач: `ROLE_DEPARTMENT_ALL` (все сотрудники через `useLazyGetAllEmployeesQuery`), `ROLE_SUPERVISOR` (сотрудники отдела) и обычный пользователь (личные задачи).

### 4.2. Сотрудники, кадры и встроенные справочники (`src/features/directories/` + `directories.css`)

- Прямой маршрут `/directories/profile` -> `EmployeesPage.tsx` -> `ProfileComponents.tsx`.
- Вкладки через `?tab=` (`employees` | `departments` | `positions`):
  - **«👥 Сотрудники»** (`ProfileListPane.tsx` + `ProfileCardPane.tsx`): отображение и редактирование ФИО, Email, **телефона (`phone`)**, должности и отдела; двойной фильтр в списке (по фамилии + поиск по номеру телефона с нормализацией цифр). При выборе строки в списке режим создания (`editingId = 'new'`) корректно сбрасывается.
  - **«🏢 Отделы»** и **«💼 Должности»** (`SimpleDirectoryTab.tsx`): просмотр для всех открывших раздел, редактирование/создание/удаление для ролей `ROLE_SERVICE`, `ROLE_ADMIN`.

### 4.3. Мои задачи и встроенные справочники (`src/features/tasks/` + `tasks.css`)

- Вкладки через `?tab=` (`tasks` | `services` | `components`):
  - **«✅ Задачи»**: двухпанельный журнал (`TasksEmployeeList`, `TasksTablePane`, `TaskForm`, `TaskQueriesPane`) с поддержкой ролей `ROLE_SUPERVISOR` и `ROLE_DEPARTMENT_ALL`. В `TasksTablePane` хранится `selectedTaskId: number | null` для мгновенного обновления списка запросов из свежего кэша.
  - **«🛠️ Услуги»** и **«🧩 Компоненты»** (`SimpleDirectoryTab.tsx`): права на редактирование у `ROLE_SERVICE`, `ROLE_ADMIN`.

### 4.4. Бронирование помещений / Переговорные (`src/features/bookings/` + `bookings.css`)

- **Бэкенд (`back-java`):** миграция Flyway `V04__create_meeting_rooms.sql` (`t_meeting_rooms`, `t_room_bookings`), сущности `MeetingRoomEntity` и `RoomBookingEntity`, контроллеры `MeetingRoomController` (`/api/directory/room`) и `RoomBookingController` (`/api/booking`).
- **Бизнес-логика:** проверка пересечения временных интервалов по комнате и дате; редактировать/отменять бронь может её автор или пользователь с ролями `ROLE_ADMIN`, `ROLE_SUPERVISOR`, `ROLE_DEPARTMENT_ALL`.
- **Фронтенд (`BookingsPage.tsx`):** вкладки через `?tab=` (`timeline` | `journal` | `rooms`): **«🗓️ Шахматка»** (`BookingsTimelineView.tsx`, сетка `08:00–20:00` с `colSpan`), **«📋 Журнал»** (`BookingsJournalTable.tsx`), **«🚪 Помещения»** (`RoomsDirectoryTab.tsx` для ролей `ROLE_ADMIN`, `ROLE_SERVICE`, `ROLE_DEPARTMENT_ALL`) и портальное модальное окно `BookingFormModal.tsx`.

### 4.5. Подсистема «Новости» (`src/features/news/` + `news.css`)

- Внешнее React-приложение (`news-keeper-front` + `news-keeper-back`), встраиваемое как микрофронтенд через `<iframe>` в `NewsHostPage.tsx` (маршрут `/news`, доступ для `ROLE_USER`, `ROLE_NEWSMAKER`, `ROLE_ADMIN`).
- **Бесшовный вход (SSO):** `NewsHostPage.tsx` передает актуальный `accessToken` из Redux через query-параметр `?token=...` в URL `VITE_NEWS_APP_URL`. При обновлении токена в ERP (`key={accessToken}`) `iframe` автоматически получает свежий токен.

### 4.6. Личный кабинет пользователя в шапке (`ErpHeader.tsx`)

- Выпадающая панель под именем пользователя с двумя портальными модальными окнами:
  1. **«Изменить пароль»** — `AdminPasswordReset` (`userId={user.id}`, `autoComplete="new-password"`, закрытие по `onSuccess`).
  2. **«Редактировать профиль»** — `MyProfileEditModal.tsx` (`GET /auth/user/{user.id}/profile`, сохранение ФИО, телефона и Email через `PATCH /directory/profile/{employeeId}` и обновление `authSlice`).

### 4.7. Администрирование (`src/features/admin/` + `admin.css`)

- `AdminUserManagement`, `AdminUserList`, `AdminPasswordReset` (с отключенным автозаполнением пароля), `AdminRoleMatrix` (ленивый дозапрос `GET /auth/user/{id}/roles` и оптимистичное обновление кэша в `onQueryStarted`).

### 4.8. Отчеты и анализ (`src/features/reports/` + `reports.css`)

- `ReportViewer`, `ReportFilters`, `ReportTable`, `ReportExportModal`.
- Колонки отчета (включая **«Запросы»**) настраиваются через `ErpColumnSelector` с сохранением в `localStorage` (`erp_report_visible_columns`).
- **Выгрузка всех страниц сразу:** через `useLazyGetReportDataQuery` (`size: totalElements`) с учетом только видимых столбцов (`exportReportToExcel.ts` -> `.xlsx`, `exportReportToPdf.ts` -> `.pdf` с локальным шрифтом `/fonts/DejaVuSans.ttf`).

---

## 5. Структура файлов проекта (`src/`)

- `api/`: `axios.ts`, `baseQuery.ts`
- `app/`: `store.ts`
- `components/layout/`: `ErpHeader.tsx`, `ErpFooter.tsx`, `MyProfileEditModal.tsx`, `layout.css`
- `components/ui/`: `ErpCommandBar.tsx`, `ErpFormButtons.tsx`, `ErpCombobox.tsx`, `ErpErrorBanner.tsx`, `ErpPagination.tsx`, `ErpColumnSelector.tsx`, `ui.css`
- `features/admin/`: `adminAuthApi.ts`, `admin.css`, `components/` (`AdminUserManagement.tsx`, `AdminUserList.tsx`, `AdminPasswordReset.tsx`, `AdminRoleMatrix.tsx`)
- `features/auth/`: `authSlice.ts`, `authApi.ts`
- `features/bookings/`: `bookingsApi.ts`, `bookings.css`, `components/` (`BookingsPage.tsx`, `BookingsTimelineView.tsx`, `BookingsJournalTable.tsx`, `BookingFormModal.tsx`, `RoomsDirectoryTab.tsx`)
- `features/dashboard/`: `ErpDashboard.tsx`, `dashboard.css`, `tiles/` (`AdminTile.tsx`, `BookingsTile.tsx`, `EmployeesTile.tsx`, `NewsTile.tsx`, `ReportsTile.tsx`, `TasksTile.tsx`)
- `features/directories/`: `directoriesApi.ts`, `directories.css`, `components/` (`SimpleDirectoryTab.tsx`, `profile/EmployeesPage.tsx`, `profile/ProfileComponents.tsx`, `profile/ProfileListPane.tsx`, `profile/ProfileCardPane.tsx`)
- `features/news/`: `NewsHostPage.tsx`, `news.css`
- `features/reports/`: `reportsApi.ts`, `reports.css`, `components/` (`ReportViewer.tsx`, `ReportFilters.tsx`, `ReportTable.tsx`, `ReportExportModal.tsx`), `utils/` (`exportReportToExcel.ts`, `exportReportToPdf.ts`)
- `features/tasks/`: `tasksApi.ts`, `tasks.css`, `components/` (`TasksJournal.tsx`, `TasksEmployeeList.tsx`, `TasksTablePane.tsx`, `TaskForm.tsx`, `TaskQueriesPane.tsx`)
- `layouts/`: `MainLayout.tsx`, `MainLayout.css`, `AuthLayout.tsx`, `AuthLayout.css`
- `routes/`: `router.tsx`, `AppRoutes.tsx`, `ProtectedRoute.tsx`, `RoleGuard.tsx`, `menuConfig.ts`, `routes.css`

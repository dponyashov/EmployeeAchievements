# AI_CONTEXT.md — Проект «1С:ERP Управление предприятием» (Frontend & Backend Integration)

## 1. Технологический стек, сборка и инфраструктура

- **Frontend Core:** Vite + React + TypeScript
- **State & Data Fetching:** Redux Toolkit + RTK Query + Axios (кастомный `axiosBaseQuery`, префикс `/api`)
- **Backend & DB:** Java 21 + Spring Boot (`back-java`) + PostgreSQL 17 + Flyway (`V01`..`V07`)
- **Routing:** React Router v6 (`createBrowserRouter` в `src/routes/router.tsx`). Состояние активных вкладок и выбранных разделов в подсистемах сохраняется в URL query-параметрах (`?tab=...`, `?sectionId=...`) через `useSearchParams` (устойчиво к обновлению страницы `F5`).
- **Импорт и экспорт документов:** `xlsx` (SheetJS) для выгрузки отчетов/протоколов в Excel (`.xlsx`) и парсинга вопросов тестов из `.xlsx`/`.xls`/`.csv` (с автоопределением кодировок `UTF-8` и `Windows-1251`); `jspdf` + `jspdf-autotable` (с локальным шрифтом `public/fonts/DejaVuSans.ttf`) для генерации PDF-отчетов и справок.
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
- **Инициализация Axios и очистка кэша RTK Query при смене пользователя (`src/app/store.ts`):**
  - Привязка Redux Store к перехватчику запросов выполняется непосредственно при создании стора через `injectStoreToAxios(store)` в `src/app/store.ts`.
  - Для очистки данных предыдущей сессии без сброса самого стора и без перезагрузки страницы (`F5`) используется `authResetListener` (`createListenerMiddleware`), который по событиям `logOut` и `authApi.endpoints.login.matchFulfilled` сбрасывает кэши всех прикладных API-слайсов (`adminAuthApi`, `directoriesApi`, `tasksApi`, `reportsApi`, `bookingsApi`, `testingApi`) через `util.resetApiState()`.
  - Для `getTestSections` в `testingApi.ts` дополнительно задано `keepUnusedDataFor: 0`, чтобы скрытые администратором разделы тестирования не задерживались в памяти при переключении учётных записей.
- **Шифрование персональных данных в БД (`back-java`):**
  - `EncryptedStringConverter` (`ru.ponyashov.employee_achievements.security.crypto`): JPA `AttributeConverter` с алгоритмом **AES-256-GCM** (случайный 12-байтовый IV на каждое сохранение, префикс `ENC:v1:` + Base64, ключ из `PROFILE_ENCRYPTION_KEY` с фолбэком на `JWT_ACCESS_SECRET`). Поддерживает обратную совместимость при чтении старых открытых строк.
  - Применяется к полям `firstName`, `lastName` и `phone` в `ProfileEntity` (колонки `VARCHAR(512)` по миграции `V05__add_phone_and_expand_profile_columns.sql`).
  - `ProfileEncryptionMigrator` (`ApplicationRunner`): при старте приложения автоматически шифрует через `JdbcTemplate` любые оставшиеся открытые (не начинающиеся с `ENC:v1:`) значения в таблице `t_profiles`.
- **Роутинг и права доступа (`src/routes/` + `routes.css`):**
  - Маршрутизация задаётся в `src/routes/router.tsx` (`erpRouter`) и синхронизирована с `src/routes/menuConfig.ts` (использует поле `allowedRoles`).
  - Защита маршрутов через `ProtectedRoute` и `RoleGuard` (`ROLE_ADMIN`, `ROLE_USER`, `ROLE_SERVICE`, `ROLE_REPORT`, `ROLE_SUPERVISOR`, `ROLE_DEPARTMENT_ALL`, `ROLE_NEWSMAKER`, `ROLE_TEST`, `ROLE_TEST_CONTROL`, `ROLE_TEST_ADMIN`).

---

## 3. Дизайн-система, единые CSS-переменные и макет

- **Стиль и токены (`src/index.css`):** «1С:Такси» (желто-серая гамма, шапка `#FFCC00`). Все CSS-файлы проекта унифицированы и используют централизованную палитру CSS-переменных в `:root` (`--1c-yellow`, `--1c-yellow-hover`, `--1c-yellow-border`, `--1c-yellow-header-border`, `--1c-yellow-soft`, `--1c-yellow-selected`, `--1c-yellow-tint`, `--1c-white`, `--1c-bg-gray`, `--1c-bg-panel`, `--1c-bg-subtle`, `--1c-bg-sidebar`, `--1c-bg-header-cell`, `--1c-bg-control`, `--1c-border`, `--1c-border-medium`, `--1c-border-strong`, `--1c-border-dark`, `--1c-border-light`, `--1c-border-row`, `--1c-text-dark`, `--1c-text-secondary`, `--1c-text-muted`, `--1c-text-disabled`, `--1c-active-blue`, `--1c-link-dark`, `--1c-row-selected`, `--1c-slot-blue-*`, `--1c-error-*`, `--1c-success-*`, `--1c-overlay-bg`, `--1c-shadow-*`). Инлайн-стили в TSX не используются.
- **Единый паттерн шапки подсистем (`.testing-page`, `.testing-topbar`, `.testing-tabs`, `.testing-tab-btn`, `.testing-content`):**
  - Применяется в подсистемах **«Задачи сотрудников»** (`AchievementsPage.tsx`), **«Сотрудники и кадры»** (`EmployeesPage.tsx`) и **«Тестирование сотрудников»** (`TestingPage.tsx`).
  - В левой части шапки отображается динамический заголовок с иконкой активной вкладки (`TAB_TITLES`, синхронизированный с `document.title`), в правой — единая полоса вкладок через `?tab=...`. Внутренние компоненты не дублируют заголовки и панели вкладок.
- **Макет и навигация (`src/layouts/` и `src/components/layout/`):**
  - `MainLayout.tsx` + `MainLayout.css`: сворачиваемая левая панель разделов (`.erp-sidebar-menu` / `.erp-sidebar-menu--collapsed`, плавная анимация `width: 220px <-> 0px`, сохранение состояния в `localStorage` под ключом `erp_sidebar_collapsed`) и рабочая область `Outlet`.
  - `ErpHeader.tsx` + `layout.css`: квадратная кнопка-«бутерброд» (`32×32 px`, `.erp-burger-btn` с плавной трансформацией полосок в крестик при открытой панели разделов), выпадающая панель пользователя с портальными модальными окнами (`createPortal(..., document.body)`), безопасный выход с `dispatch(logOut())` в `finally`.
  - `ErpFooter.tsx` + `layout.css` (`.erp-footer` высотой `25px`).
  - `AuthLayout.tsx` + `AuthLayout.css` (авторизация и регистрация).
- **Общие UI-компоненты (`src/components/ui/` + `ui.css`):**
  - `ErpCommandBar.tsx` (принимает `onCreate`, `onEdit`, `onDelete`, `onRefresh`), `ErpFormButtons.tsx`, `ErpCombobox.tsx`, `ErpErrorBanner.tsx` (рекурсивный разбор ошибок через `parseErpError.ts`), `ErpPagination.tsx`, `ErpColumnSelector.tsx`.

---

## 4. Реализованные подсистемы

### 4.1. Рабочий стол (`src/features/dashboard/` + `dashboard.css`)

- `ErpDashboard.tsx` и плитки: `AdminTile`, `EmployeesTile`, `AchievementsTile` (плитка **«✅ Задачи сотрудников»**, объединившая задачи и отчетность), `NewsTile`, `BookingsTile`, `TestingTile`.
- Сетка плиток 4x3 высотой `180px` (`grid-auto-rows: 180px`, `display: contents` на обертках, синхронизация с `menuConfig.ts`).
- `AchievementsTile.tsx` учитывает три уровня ролей при подсчете задач: `ROLE_DEPARTMENT_ALL` / `ROLE_ADMIN` (все сотрудники через `useLazyGetAllEmployeesQuery` из `tasksApi`), `ROLE_SUPERVISOR` (сотрудники отдела) и обычный пользователь (личные задачи).

### 4.2. Сотрудники, кадры и встроенные справочники (`src/features/directories/` + `directories.css`)

- Прямой маршрут `/directories/profile` -> `EmployeesPage.tsx` (единая верхняя шапка с динамическим заголовком и иконкой вкладки `TAB_TITLES`, загружает список через `useGetDirectoryDataQuery('profile')`).
- Вкладки через `?tab=` (`employees` | `departments` | `positions`):
  - **«👥 Сотрудники»** (`ProfileComponents.tsx` -> `ProfileListPane.tsx` + `ProfileCardPane.tsx`, без дублирования заголовка и панели вкладок): отображение и редактирование ФИО, Email, **телефона (`phone`)**, должности и отдела; двойной фильтр в списке (по фамилии + поиск по номеру телефона с нормализацией цифр). При выборе строки в списке режим создания (`editingId = 'new'`) корректно сбрасывается.
  - **«🏢 Отделы»** (`cleanKey="department"`) и **«💼 Должности»** (`cleanKey="position"`) через `SimpleDirectoryTab.tsx`: просмотр для всех открывших раздел, редактирование/создание/удаление для ролей `ROLE_SERVICE`, `ROLE_ADMIN`.

### 4.3. Задачи сотрудников, отчетность и встроенные справочники (`src/features/achievements/` + `src/features/tasks/` + `src/features/reports/`)

- Объединённый раздел **«✅ Задачи сотрудников»** по маршруту `/achievements` (`AchievementsPage.tsx`, старые маршруты `/tasks` и `/reports` настроены как `<Navigate>`-редиректы).
- Единая верхняя панель из 4 вкладок через `?tab=` (`tasks` | `reports` | `services` | `components`) с динамическим заголовком и иконкой для каждой закладки:
  - **«✅ Задачи»** (`TasksJournal.tsx` без внутренней полосы вкладок): двухпанельный журнал (`TasksEmployeeList`, `TasksTablePane`, `TaskForm`, `TaskQueriesPane`) с поддержкой ролей `ROLE_SUPERVISOR` и `ROLE_DEPARTMENT_ALL`. В `TasksTablePane` хранится `selectedTaskId: number | null` для мгновенного обновления списка запросов из свежего кэша.
  - **«📊 Отчетность»** (`ReportViewer.tsx`, доступна для `ROLE_REPORT`, `ROLE_ADMIN`, `ROLE_SUPERVISOR`, `ROLE_DEPARTMENT_ALL`): фильтрация (`ReportFilters`), таблица (`ReportTable`), настройка видимых колонок (включая **«Запросы»**) через `ErpColumnSelector` с сохранением в `localStorage` (`erp_report_visible_columns`) и выгрузка всех страниц сразу через `useLazyGetReportDataQuery` (`size: totalElements`) в Excel (`exportReportToExcel.ts` -> `.xlsx`) и PDF (`exportReportToPdf.ts` -> `.pdf` с локальным шрифтом `/fonts/DejaVuSans.ttf`).
  - **«🛠️ Услуги»** (`cleanKey="service"`, `itemLabel="Наименование услуги"`) и **«🧩 Компоненты»** (`cleanKey="component"`, `itemLabel="Наименование компонента"`) через `SimpleDirectoryTab.tsx`: права на редактирование у `ROLE_SERVICE`, `ROLE_ADMIN`.

### 4.4. Бронирование помещений / Переговорные (`src/features/bookings/` + `bookings.css`)

- **Бэкенд (`back-java`):** миграция Flyway `V04__create_meeting_rooms.sql` (`t_meeting_rooms`, `t_room_bookings`), сущности `MeetingRoomEntity` и `RoomBookingEntity`, контроллеры `MeetingRoomController` (`/api/directory/room`) и `RoomBookingController` (`/api/booking`).
- **Бизнес-логика:** проверка пересечения временных интервалов по комнате и дате; редактировать/отменять бронь может её автор или пользователь с ролями `ROLE_ADMIN`, `ROLE_SUPERVISOR`, `ROLE_DEPARTMENT_ALL`.
- **Фронтенд (`BookingsPage.tsx`):** вкладки через `?tab=` (`timeline` | `journal` | `rooms`): **«🗓️ Шахматка»** (`BookingsTimelineView.tsx`, сетка `08:00–20:00` с `colSpan`), **«📋 Журнал»** (`BookingsJournalTable.tsx`), **«🚪 Помещения»** (`RoomsDirectoryTab.tsx` для ролей `ROLE_ADMIN`, `ROLE_SERVICE`, `ROLE_DEPARTMENT_ALL`) и портальное модальное окно `BookingFormModal.tsx`.

### 4.5. Подсистема «Новости» (`src/features/news/` + `news.css`)

- Внешнее React-приложение (`news-keeper-front` + `news-keeper-back`), встраиемое как микрофронтенд через `<iframe>` в `NewsHostPage.tsx` (маршрут `/news`, доступ для `ROLE_USER`, `ROLE_NEWSMAKER`, `ROLE_ADMIN`).
- **Бесшовный вход (SSO):** `NewsHostPage.tsx` передает актуальный `accessToken` из Redux через query-параметр `?token=...` в URL `VITE_NEWS_APP_URL`. При обновлении токена в ERP (`key={accessToken}`) `iframe` автоматически получает свежий токен.

### 4.6. Личный кабинет пользователя и Администрирование (`ErpHeader.tsx` + `src/features/admin/`)

- **Личный кабинет в шапке (`ErpHeader.tsx`):** выпадающая панель под именем пользователя с двумя портальными модальными окнами: **«Изменить пароль»** (`AdminPasswordReset`) и **«Редактировать профиль»** (`MyProfileEditModal.tsx`, `GET /auth/user/{user.id}/profile`, сохранение через `PATCH /directory/profile/{employeeId}`).
- **Администрирование (`src/features/admin/` + `admin.css`):** `AdminUserManagement`, `AdminUserList`, `AdminPasswordReset` (с отключенным автозаполнением пароля), `AdminRoleMatrix` (ленивый дозапрос `GET /auth/user/{id}/roles` и оптимистичное обновление кэша в `onQueryStarted`).

### 4.7. Тестирование сотрудников (`src/features/testing/` + `testing.css`)

- **Ролевая модель и БД (`back-java`):**
  - Миграция Flyway `V06__create_testing_subsystem.sql`: добавление ролей `ROLE_TEST` (прохождение), `ROLE_TEST_CONTROL` (контроль и статистика), `ROLE_TEST_ADMIN` (полное управление разделами, тестами и контролем) через `INSERT ... SELECT ... WHERE NOT EXISTS` (в `t_roles` нет `UNIQUE`-ограничения на `name`). Таблицы БД: `t_test_sections`, `t_tests`, `t_test_questions`, `t_test_answer_options` (с символьным кодом ответа `a, b, c...`), `t_test_attempts`, `t_test_attempt_answers`, `t_test_extra_grants`.
  - Миграция Flyway `V07__add_testing_training_and_pass_score.sql`: добавление колонок `allow_training` (разрешение обучающего режима), `pass_score_percent` (проходной балл в процентах для оценки «Сдал / Не сдал») в `t_tests` и `is_training` в `t_test_attempts`.
  - Контроллер `TestingController` (`/api/testing/...`) и сервис `TestingService`:
    - При редактировании теста (`saveTest`) существующие вопросы и варианты ответов обновляются по `id`, чтобы не срабатывало `ON DELETE CASCADE` на `t_test_attempt_answers` и не терялась история пройденных попыток.
    - Чтение и сохранение ответов попытки выполняется явно через `TestAttemptAnswerRepository` (без дублирования с каскадом коллекции `attempt.getAnswers()`).
    - Защита скрытых разделов (`isActive = false`): методы `getTestsBySection` и `startOrResumeAttempt` блокируют прямой доступ к тестам скрытого раздела для пользователей без роли `ROLE_TEST_ADMIN` / `ROLE_ADMIN`.
    - Обучающее тестирование (`POST /testing/tests/{testId}/start?training=true`): запускается без ограничения количества попыток (`attemptNumber = 0`, `isTraining = true`), не расходует зачётные попытки/разрешения и отфильтровывается (`!Boolean.TRUE.equals(a.getIsTraining())`) из `getTestsBySection`, `getTestControlOverview` и `getEmployeeProtocols`.
    - Серверный контроль таймера (`checkAndExpireIfNeeded`), блокировка изменения принятых ответов (без авто-завершения попытки на последнем вопросе, чтобы пользователь мог просмотреть подсветку и нажать «Завершить тест»), возврат `correctCodes` в `AttemptQuestionViewDto` только для принятых вопросов, расчёт `isPassed` по `passScorePercent`, проверка повторных зачётных попыток (`completedOrExpiredCount > 0 && unusedGrants.isEmpty()`).
- **Фронтенд (`TestingPage.tsx`, маршрут `/testing`, навигация через `?sectionId=...&tab=...`):**
  - **Уровень 1 (Разделы):** центральная лента разделов (`TestSectionsFeed.tsx`) + вкладка `TestSectionEditorTab.tsx` для `ROLE_TEST_ADMIN` (быстрое переключение видимости из таблицы «🙈 Скрыть» / «👁️ Показать» с передачей полного DTO раздела и чекбокс «Скрыть раздел от пользователей» в модальном окне).
  - **Уровень 2 (Внутри раздела):**
    - **«📝 Тесты раздела»** (`SectionTestsTab.tsx`): карточки тестов с бейджем проходного балла, кнопкой зачётного старта и кнопкой **«🎓 Обучающее тестирование»** (если разрешено в настройках теста).
    - **Экран прохождения теста** (`TestRunnerView.tsx`): обратный отсчёт времени с авто-фиксацией при истечении, счётчик отвеченных вопросов (`Принято ответов: X из Y`), кнопки `◀ Назад`, `✔ Принять ответ`, `Вперёд ▶`, `🏁 Завершить тест`; символьные коды ответов скрыты; после нажатия «Принять ответ» пользователь остаётся на текущем вопросе, а все правильные варианты подсвечиваются зелёным (`testing-option-row--correct`), ошибочно выбранные пользователем — красным (`testing-option-row--wrong`); на экране результатов выводится итог **«✔ СДАЛ» / «✖ НЕ СДАЛ»**.
    - **«⚙️ Редактирование тестов»** (`TestEditorTab.tsx`, типы в `types/testEditor.types.ts`, подкомпоненты `editor/TestSettingsForm.tsx` и `editor/TestQuestionCard.tsx`): настройка лимита вопросов, проходного балла (`%`), таймера, обучающего режима, скрытия теста, конструктор вопросов с символьными кодами и массовый импорт вопросов из `.xlsx`/`.xls`/`.csv` (`importTestQuestions.ts` с шаблоном и автоопределением `UTF-8`/`Windows-1251`).
    - **«📊 Контроль тестирования»** (`TestControlTab.tsx` + `control/TestControlSidebar.tsx`, `TestQuestionStatsCard.tsx`, `TestEmployeesTableCard.tsx`, `TestEmployeeAttemptsCard.tsx`): зафиксированный слева список тестов, общая сводка и две вкладки снизу — **«👥 Сотрудники, проходившие тест»** (двухпанельная раскладка `25%` список сотрудников / `75%` попытки, детализация ответов с кодами, открытие повторной попытки, выгрузка протокола в `.xlsx` и официальной справки в `.pdf` через `exportTestingFiles.ts`) и **«📈 Статистика ответов по вопросам»**.

---

## 5. Структура файлов проекта (`src/`)

- `api/`: `axios.ts`, `baseQuery.ts`
- `app/`: `store.ts` (подключены `testingApi`, `authResetListener` и `injectStoreToAxios`)
- `components/layout/`: `ErpHeader.tsx`, `ErpFooter.tsx`, `MyProfileEditModal.tsx`, `layout.css`
- `components/ui/`: `ErpCommandBar.tsx`, `ErpFormButtons.tsx`, `ErpCombobox.tsx`, `ErpErrorBanner.tsx`, `ErpPagination.tsx`, `ErpColumnSelector.tsx`, `ui.css`
- `features/achievements/`: `AchievementsPage.tsx` (объединённый раздел «✅ Задачи сотрудников» с вкладками Задачи, Отчетность, Услуги, Компоненты)
- `features/admin/`: `adminAuthApi.ts`, `admin.css`, `components/` (`AdminUserManagement.tsx`, `AdminUserList.tsx`, `AdminPasswordReset.tsx`, `AdminRoleMatrix.tsx`)
- `features/auth/`: `authSlice.ts`, `authApi.ts`
- `features/bookings/`: `bookingsApi.ts`, `bookings.css`, `components/` (`BookingsPage.tsx`, `BookingsTimelineView.tsx`, `BookingsJournalTable.tsx`, `BookingFormModal.tsx`, `RoomsDirectoryTab.tsx`)
- `features/dashboard/`: `ErpDashboard.tsx`, `dashboard.css`, `tiles/` (`AchievementsTile.tsx`, `AdminTile.tsx`, `BookingsTile.tsx`, `EmployeesTile.tsx`, `NewsTile.tsx`, `TestingTile.tsx`)
- `features/directories/`: `directoriesApi.ts`, `directories.css`, `components/` (`SimpleDirectoryTab.tsx`, `profile/EmployeesPage.tsx`, `profile/ProfileComponents.tsx`, `profile/ProfileListPane.tsx`, `profile/ProfileCardPane.tsx`)
- `features/news/`: `NewsHostPage.tsx`, `news.css`
- `features/reports/`: `reportsApi.ts`, `reports.css`, `components/` (`ReportViewer.tsx`, `ReportFilters.tsx`, `ReportTable.tsx`, `ReportExportModal.tsx`), `utils/` (`exportReportToExcel.ts`, `exportReportToPdf.ts`)
- `features/tasks/`: `tasksApi.ts`, `tasks.css`, `components/` (`TasksJournal.tsx`, `TasksEmployeeList.tsx`, `TasksTablePane.tsx`, `TaskForm.tsx`, `TaskQueriesPane.tsx`)
- `features/testing/`: `testingApi.ts`, `testing.css`, `types/` (`testEditor.types.ts`), `components/` (`TestingPage.tsx`, `TestSectionsFeed.tsx`, `TestSectionEditorTab.tsx`, `SectionTestsTab.tsx`, `TestRunnerView.tsx`, `TestEditorTab.tsx`, `TestControlTab.tsx`, `editor/TestSettingsForm.tsx`, `editor/TestQuestionCard.tsx`, `control/TestControlSidebar.tsx`, `control/TestQuestionStatsCard.tsx`, `control/TestEmployeesTableCard.tsx`, `control/TestEmployeeAttemptsCard.tsx`), `utils/` (`exportTestingFiles.ts`, `importTestQuestions.ts`)
- `layouts/`: `MainLayout.tsx`, `MainLayout.css`, `AuthLayout.tsx`, `AuthLayout.css`
- `routes/`: `router.tsx`, `AppRoutes.tsx`, `ProtectedRoute.tsx`, `RoleGuard.tsx`, `menuConfig.ts`, `routes.css`

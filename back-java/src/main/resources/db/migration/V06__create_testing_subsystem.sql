-- 1. Добавление новых ролей подсистемы тестирования
INSERT INTO public.t_roles (description, name)
SELECT v.description, v.name
FROM (
    VALUES
        ('Доступ к прохождению тестирования сотрудников', 'ROLE_TEST'),
        ('Контроль результатов тестирования и управление попытками', 'ROLE_TEST_CONTROL'),
        ('Администратор подсистемы тестирования (разделы, тесты, контроль)', 'ROLE_TEST_ADMIN')
) AS v(description, name)
WHERE NOT EXISTS (
    SELECT 1 FROM public.t_roles r WHERE r.name = v.name
);


-- 2. Разделы тестирования
CREATE TABLE IF NOT EXISTS t_test_sections (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(1000),
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- 3. Тесты внутри разделов
CREATE TABLE IF NOT EXISTS t_tests (
    id BIGSERIAL PRIMARY KEY,
    section_id BIGINT NOT NULL REFERENCES t_test_sections(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(1000),
    questions_limit INTEGER NOT NULL DEFAULT 10,
    has_time_limit BOOLEAN NOT NULL DEFAULT FALSE,
    time_limit_minutes INTEGER,
    is_hidden BOOLEAN NOT NULL DEFAULT FALSE
);

-- 4. Вопросы теста
CREATE TABLE IF NOT EXISTS t_test_questions (
    id BIGSERIAL PRIMARY KEY,
    test_id BIGINT NOT NULL REFERENCES t_tests(id) ON DELETE CASCADE,
    question_text VARCHAR(2000) NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
);

-- 5. Варианты ответов на вопрос (с символьным кодом a, b, c...)
CREATE TABLE IF NOT EXISTS t_test_answer_options (
    id BIGSERIAL PRIMARY KEY,
    question_id BIGINT NOT NULL REFERENCES t_test_questions(id) ON DELETE CASCADE,
    code VARCHAR(10) NOT NULL,
    option_text VARCHAR(1000) NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE
);

-- 6. Попытки прохождения тестов сотрудниками
CREATE TABLE IF NOT EXISTS t_test_attempts (
    id BIGSERIAL PRIMARY KEY,
    test_id BIGINT NOT NULL REFERENCES t_tests(id) ON DELETE CASCADE,
    profile_id BIGINT NOT NULL REFERENCES t_profiles(id) ON DELETE CASCADE,
    attempt_number INTEGER NOT NULL DEFAULT 1,
    status VARCHAR(30) NOT NULL, -- IN_PROGRESS, COMPLETED, EXPIRED
    started_at TIMESTAMP NOT NULL,
    finished_at TIMESTAMP,
    total_questions INTEGER NOT NULL DEFAULT 0,
    answered_questions INTEGER NOT NULL DEFAULT 0,
    correct_answers INTEGER NOT NULL DEFAULT 0,
    score_percent DOUBLE PRECISION NOT NULL DEFAULT 0.0
);

-- 7. Зафиксированные ответы сотрудника в рамках попытки
CREATE TABLE IF NOT EXISTS t_test_attempt_answers (
    id BIGSERIAL PRIMARY KEY,
    attempt_id BIGINT NOT NULL REFERENCES t_test_attempts(id) ON DELETE CASCADE,
    question_id BIGINT NOT NULL REFERENCES t_test_questions(id) ON DELETE CASCADE,
    question_order INTEGER NOT NULL DEFAULT 0,
    selected_codes VARCHAR(255), -- например: "a" или "a,c"
    is_answered BOOLEAN NOT NULL DEFAULT FALSE,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    answered_at TIMESTAMP
);

-- 8. Разрешения на повторное тестирование, выданные контролером/администратором
CREATE TABLE IF NOT EXISTS t_test_extra_grants (
    id BIGSERIAL PRIMARY KEY,
    test_id BIGINT NOT NULL REFERENCES t_tests(id) ON DELETE CASCADE,
    profile_id BIGINT NOT NULL REFERENCES t_profiles(id) ON DELETE CASCADE,
    granted_by_id BIGINT REFERENCES t_profiles(id) ON DELETE SET NULL,
    granted_at TIMESTAMP NOT NULL,
    is_used BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_tests_section ON t_tests(section_id);
CREATE INDEX idx_test_attempts_test_profile ON t_test_attempts(test_id, profile_id);
CREATE INDEX idx_test_attempt_answers_attempt ON t_test_attempt_answers(attempt_id);

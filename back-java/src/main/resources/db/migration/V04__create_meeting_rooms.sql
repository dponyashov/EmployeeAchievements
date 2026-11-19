CREATE TABLE IF NOT EXISTS t_meeting_rooms (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    capacity INTEGER NOT NULL DEFAULT 1,
    equipment VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS t_room_bookings (
    id BIGSERIAL PRIMARY KEY,
    room_id BIGINT NOT NULL REFERENCES t_meeting_rooms(id) ON DELETE CASCADE,
    author_id BIGINT NOT NULL REFERENCES t_profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(1000),
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    enter_date DATE NOT NULL,
    enter_time TIME NOT NULL
);

CREATE INDEX idx_room_bookings_date_room ON t_room_bookings(booking_date, room_id);

-- Начальное наполнение переговорных комнат
INSERT INTO t_meeting_rooms (name, capacity, equipment, is_active)
VALUES
    ('Переговорная №1 (Большой зал)', 16, 'ВКС, проектор, маркерная доска', TRUE),
    ('Переговорная №2 (Малая)', 6, 'ТВ-панель, флипчарт', TRUE)
ON CONFLICT (name) DO NOTHING;

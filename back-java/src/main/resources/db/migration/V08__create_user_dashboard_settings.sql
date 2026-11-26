CREATE TABLE IF NOT EXISTS public.t_user_dashboard_settings (
    user_id BIGINT PRIMARY KEY REFERENCES public.t_users(id) ON DELETE CASCADE,
    columns_count INTEGER NOT NULL DEFAULT 4,
    rows_count INTEGER NOT NULL DEFAULT 3,
    tiles_json TEXT NOT NULL DEFAULT '["achievements","employees","bookings","testing","news","admin"]',
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

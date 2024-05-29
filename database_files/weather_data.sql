create table if not exists weather_data (
    id uuid primary key,
    place text not null,
    created_at timestamp not null,
    temperature numeric(5, 2) not null,
    uv_index integer,
    wind_direction integer,
    wind_speed numeric(5, 2)
);

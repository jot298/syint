create table if not exists weather_data (
    id SERIAL primary key,
    place text not null,
    created_at timestamp not null,
    temperature numeric(5, 2) not null,
    uv_index integer,
    wind_direction text not null,
    wind_speed numeric(5, 2)
);

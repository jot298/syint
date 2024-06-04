INSERT INTO weather_data (place, created_at, temperature, uv_index, wind_direction, wind_speed)
SELECT
    place,
    generate_series(
        date_trunc('hour', now() - interval '7 days'),
        date_trunc('hour', now()),
        interval '1 hour'
    ) as created_at,
    ROUND(random() * 35 - 10)::numeric(5, 2) as temperature,
    floor(random() * 10)::integer as uv_index,
    CASE floor(random() * 8)
        WHEN 0 THEN 'N'
        WHEN 1 THEN 'NE'
        WHEN 2 THEN 'E'
        WHEN 3 THEN 'SE'
        WHEN 4 THEN 'S'
        WHEN 5 THEN 'SW'
        WHEN 6 THEN 'W'
        ELSE 'NW'
    END as wind_direction,
    ROUND(random() * 20 + 1)::numeric(5, 2) as wind_speed
FROM
    (
        SELECT 'Vienna' as place
        UNION ALL
        SELECT 'Graz' as place
    ) as places;

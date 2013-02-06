CREATE TABLE `daily_stats` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `sensor_type_id` INTEGER NOT NULL,
  `value` INTEGER NOT NULL,
  `min` INTEGER ,
  `max` INTEGER ,
  `time` INTEGER NOT NULL,
  FOREIGN KEY(sensor_type_id) REFERENCES sensor_types(id)
);


CREATE TABLE `thresholds` (
  `id` INTEGER PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `value` VARCHAR(255) NOT NULL,
  `sensor_type_id` INTEGER NOT NULL,
   FOREIGN KEY(sensor_type_id) REFERENCES sensors_types(id)
);
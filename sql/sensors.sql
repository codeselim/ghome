CREATE TABLE `sensors` (
  `id` INTEGER PRIMARY KEY,
  `hardware_id` INTEGER NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `sensor_type_id` INTEGER NOT NULL,
   FOREIGN KEY(sensor_type_id) REFERENCES sensors_types(id)
);

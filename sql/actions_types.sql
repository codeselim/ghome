CREATE TABLE `actions_types` (
  `id` INTEGER PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `sensor_type_id` INTEGER,
  `message_to_sensor` VARCHAR(255)
);

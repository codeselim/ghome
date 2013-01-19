CREATE TABLE `logs` (
  `id` INTEGER PRIMARY KEY,
  `sensor_id` INTEGER,
  `value` VARCHAR(255),
  `time` DATE
);
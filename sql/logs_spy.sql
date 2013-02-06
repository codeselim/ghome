CREATE TABLE `logs_spy` (
  `id` INTEGER PRIMARY KEY,
  `sensor_id` INTEGER NOT NULL, 
  `value` VARCHAR(255) NOT NULL,
  `time` DATETIME NOT NULL,
   FOREIGN KEY(sensor_id) REFERENCES sensors(id)
);

CREATE INDEX `logs_spy_sensor_id` ON `logs_spy` (sensor_id);

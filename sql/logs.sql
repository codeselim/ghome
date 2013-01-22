CREATE TABLE `logs` (
  `id` INTEGER PRIMARY KEY,
  `sensor_id` INTEGER NOT NULL, 
  `value` VARCHAR(255) NOT NULL,
  `time` TIME NOT NULL,
   FOREIGN KEY(sensor_id) REFERENCES sensors(id)
);

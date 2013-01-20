CREATE TABLE `logs` (
  `id` INTEGER PRIMARY KEY,
  `sensor_id` INTEGER NOT NULL, 
  `value` VARCHAR(255),
  `time` DATE,
   FOREIGN KEY(sensor_id) REFERENCES sensors(id)
);

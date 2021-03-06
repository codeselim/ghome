CREATE TABLE `conditions` (
  `id` INTEGER PRIMARY KEY,
  `value_to_compare` VARCHAR(255) NOT NULL,
  `task_id` INTEGER NOT NULL,
  `type_id` INTEGER NOT NULL,
  `sensor_id` INTEGER,

  FOREIGN KEY(task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY(type_id) REFERENCES condition_types(id) ON DELETE CASCADE,
  FOREIGN KEY(sensor_id) REFERENCES sensors(id) -- No cascade here, else it would create multiple cascade paths for sensors deletion
);

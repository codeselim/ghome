CREATE TABLE `conditions` (
  `id` INTEGER PRIMARY KEY,
  `value_to_compare` VARCHAR(255) NOT NULL,
  `event_type_id` INTEGER NOT NULL,
  `task_id` INTEGER NOT NULL,
  `type_id` INTEGER NOT NULL,
  `sensor_id` INTEGER NOT NULL,

  FOREIGN KEY(event_type_id) REFERENCES event_types(id),
  FOREIGN KEY(task_id) REFERENCES tasks(id),
  FOREIGN KEY(type_id) REFERENCES condition_types(id),
  FOREIGN KEY(sensor_id) REFERENCES sensors(id)
);

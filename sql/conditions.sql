CREATE TABLE `conditions` (
  `id` INTEGER PRIMARY KEY,
  `value_to_compare` VARCHAR(255) NOT NULL,
  `event_type_id` INTEGER,
  `task_id` INTEGER,
  `type_id` INTEGER,
  `sensor_id` INTEGER,

  FOREIGN KEY(event_type_id) REFERENCES event_types(id),
  FOREIGN KEY(task_id) REFERENCES tasks(id),
  FOREIGN KEY(type_id) REFERENCES condition_types(id),
  FOREIGN KEY(sensor_id) REFERENCES sensors(id)
);
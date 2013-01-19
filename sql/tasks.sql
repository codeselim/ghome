CREATE TABLE `tasks` (
  `id` INTEGER PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `action_type_id` INTEGER,
  `target_id` INTEGER,
  `mode_id` INTEGER,
  `max_date` DATE,
  `min_date` DATE,
  `max_hour` TIME,
  `min_hour` TIME,
  FOREIGN KEY(action_type_id) REFERENCES actions_types(id),
  FOREIGN KEY(target_id) REFERENCES sensors(id),
  FOREIGN KEY(mode_id) REFERENCES modes(id)
);
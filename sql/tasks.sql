CREATE TABLE `tasks` (
  `id` INTEGER PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `action_type_id` INTEGER NOT NULL,
  `target_id` INTEGER,
  `event_type_id` INTEGER NOT NULL,
  `mode_id` INTEGER NOT NULL, -- still work to be done on that : do we allow multiple modes? Thus pushing that into the `conditions` table?
  `max_month` INTEGER UNSIGNED NOT NULL , -- 0 <= m <= 11
  `min_month` INTEGER UNSIGNED NOT NULL, -- 0 <= m <= 11
  `max_day` INTEGER UNSIGNED NOT NULL, -- 0 <= d <= 6
  `min_day` INTEGER UNSIGNED NOT NULL, -- 0 <= d <= 6
  `max_hour` INTEGER UNSIGNED NOT NULL, -- 0 <= h < 24
  `min_hour` INTEGER UNSIGNED NOT NULL, -- 0 <= h < 24
  
  FOREIGN KEY(event_type_id) REFERENCES event_types(id),
  FOREIGN KEY(action_type_id) REFERENCES actions_types(id),
  FOREIGN KEY(target_id) REFERENCES sensors(id),
  FOREIGN KEY(mode_id) REFERENCES modes(id)
);

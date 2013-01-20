CREATE TABLE `tasks` (
  `id` INTEGER PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `action_type_id` INTEGER NOT NULL,
  `target_id` INTEGER NOT NULL,
  `mode_id` INTEGER NOT NULL, -- still work to be done on that : do we allow multiple modes? Thus pushing that into the `conditions` table?
  `max_date` CHAR(5) NOT NULL, -- Value of type 'MM-DD'
  `min_date` CHAR(5) NOT NULL, -- Value of type 'MM-DD'
  `max_hour` INTEGER UNSIGNED NOT NULL, -- 0 <= h < 24
  `min_hour` INTEGER UNSIGNED NOT NULL, -- 0 <= h < 24
  FOREIGN KEY(action_type_id) REFERENCES actions_types(id),
  FOREIGN KEY(target_id) REFERENCES sensors(id),
  FOREIGN KEY(mode_id) REFERENCES modes(id)
);

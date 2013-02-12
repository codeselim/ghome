CREATE TABLE `tasks` (
  `id` INTEGER PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `action_type_id` INTEGER NOT NULL,
  `target_id` INTEGER,
  `event_type_id` INTEGER NOT NULL,
  `origin_id` INTEGER NOT NULL,
  `mode_id` INTEGER, -- still work to be done on that : do we allow multiple modes? Thus pushing that into the `conditions` table?
  
  FOREIGN KEY(event_type_id) REFERENCES event_types(id),
  FOREIGN KEY(action_type_id) REFERENCES actions_types(id),
  FOREIGN KEY(target_id) REFERENCES sensors(id),
  FOREIGN KEY(mode_id) REFERENCES modes(id)
);

CREATE TABLE `daily_stats` (
  `id` INTEGER PRIMARY KEY,
  `type_stats` INTEGER NOT NULL,
  `value` INTEGER NOT NULL,
  `day` DATE NOT NULL
  FOREIGN KEY(type_stats) REFERENCES stats_type(id),
);

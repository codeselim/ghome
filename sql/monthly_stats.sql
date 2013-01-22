CREATE TABLE `monthly_stats` (
  `type_stats` INTEGER NOT NULL,
  `value` INTEGER NOT NULL,
  `month` INTEGER NOT NULL
  FOREIGN KEY(type_stats) REFERENCES stats_type(id),
);

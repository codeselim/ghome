CREATE TABLE `condition_types` (
  `id` INTEGER PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  /*L'opérateur vaut -1 si inférieur, 1 si supérieur, 0 si égal ça devrait suffire*/
  `operator` INTEGER
);


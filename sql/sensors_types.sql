CREATE TABLE `sensors_types` (
  `id` INTEGER PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL
);

INSERT INTO sensors_types VALUES (1, "Température");
INSERT INTO sensors_types VALUES (null, "Lumière");
INSERT INTO sensors_types VALUES (null, "Présence");
INSERT INTO sensors_types VALUES (null, "Contact");
--INSERT INTO sensors_types VALUES (null, "Temps");

CREATE TABLE `sensors_types` (
  `id` INTEGER PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL
);

INSERT INTO sensors_types VALUES (1, "Température");
INSERT INTO sensors_types VALUES (2, "Lumière");
INSERT INTO sensors_types VALUES (3, "Présence");
INSERT INTO sensors_types VALUES (4, "Contact");
INSERT INTO sensors_types VALUES (5, "Prise électrique");
INSERT INTO sensors_types VALUES (6, "Volet	");


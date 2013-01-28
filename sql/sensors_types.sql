CREATE TABLE `sensors_types` (
  `id` INTEGER PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL
);

INSERT INTO sensors_types VALUES (null, "temperature");
INSERT INTO sensors_types VALUES (null, "light");
INSERT INTO sensors_types VALUES (null, "presence");
INSERT INTO sensors_types VALUES (null, "contact");
INSERT INTO sensors_types VALUES (null, "electricity");

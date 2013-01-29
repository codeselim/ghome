CREATE TABLE `event_types` (
  `id` INTEGER PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL
);

INSERT INTO event_types VALUES (null, "temperature");
INSERT INTO event_types VALUES (null, "luminosity");
INSERT INTO event_types VALUES (null, "contact");
INSERT INTO event_types VALUES (null, "presence");
INSERT INTO event_types VALUES (null, "day");
INSERT INTO event_types VALUES (null, "hour");
INSERT INTO event_types VALUES (null, "minute");
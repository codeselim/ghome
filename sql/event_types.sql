CREATE TABLE `event_types` (
  `id` INTEGER PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL
);

INSERT INTO event_types VALUES (null, "exceeding of temperature");
INSERT INTO event_types VALUES (null, "deficit of temperature");
INSERT INTO event_types VALUES (null, "exceeding of luminosity");
INSERT INTO event_types VALUES (null, "deficit of luminosity");
INSERT INTO event_types VALUES (null, "contact performed");
INSERT INTO event_types VALUES (null, "contact removed");
INSERT INTO event_types VALUES (null, "presence");
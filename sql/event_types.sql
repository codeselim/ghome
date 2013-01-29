CREATE TABLE `event_types` (
  `id` INTEGER PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL
);

INSERT INTO event_types VALUES (null, "thresholdUp");
INSERT INTO event_types VALUES (null, "thresholdDown");
INSERT INTO event_types VALUES (null, "contactPerformed");
INSERT INTO event_types VALUES (null, "contactRemoved");
INSERT INTO event_types VALUES (null, "day");
INSERT INTO event_types VALUES (null, "hour");
INSERT INTO event_types VALUES (null, "minute");
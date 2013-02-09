CREATE TABLE `event_types` (
  `id` INTEGER PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL
);

INSERT INTO event_types VALUES (1, "Dépassement de seuil en front montant");
INSERT INTO event_types VALUES (2, "Dépassement de seuil en front descendant");
INSERT INTO event_types VALUES (3, "Contact réalisé");
INSERT INTO event_types VALUES (4, "Contact rompu");
INSERT INTO event_types VALUES (5, "Changement de jour");
INSERT INTO event_types VALUES (6, "Changement d'heure");
INSERT INTO event_types VALUES (7, "Changement de minute");
INSERT INTO event_types VALUES (8, "Changement de semaine");
INSERT INTO event_types VALUES (9, "Changement de mois");
INSERT INTO event_types VALUES (10, "Présence détectée");
INSERT INTO event_types VALUES (11, "Absence détectée");
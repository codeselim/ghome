CREATE TABLE `event_types` (
  `id` INTEGER PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL
);

INSERT INTO event_types VALUES (1, "Dépassement de seuil en front montant");
INSERT INTO event_types VALUES (null, "Dépassement de seuil en front descendant");
INSERT INTO event_types VALUES (null, "Contact réalisé");
INSERT INTO event_types VALUES (null, "Contact rompu");
INSERT INTO event_types VALUES (null, "Changement de jour");
INSERT INTO event_types VALUES (null, "Changement d'heure");
INSERT INTO event_types VALUES (null, "Changement de minute");
INSERT INTO event_types VALUES (null, "Changement de semaine");
INSERT INTO event_types VALUES (null, "Changement de mois");
INSERT INTO event_types VALUES (null, "Présence détectée");
INSERT INTO event_types VALUES (null, "Absence détectée");
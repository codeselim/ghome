CREATE TABLE `sensors` (
  `id` INTEGER PRIMARY KEY,
  `hardware_id` INTEGER NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `sensor_type_id` INTEGER NOT NULL,
   FOREIGN KEY(`sensor_type_id`) REFERENCES sensors_types(`id`)
);

--INSERT INTO sensors VALUES (1, null, "Capteur logiciel temps", 5);

CREATE TRIGGER cascade_sensor_deletion AFTER DELETE ON sensors 
  FOR EACH ROW 
  BEGIN
    DELETE FROM conditions WHERE conditions.sensor_id = old.id;
  END;
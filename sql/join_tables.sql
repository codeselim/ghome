CREATE TABLE `event_types_condition_types` (
	`event_type_id` INT NOT NULL,
	`condition_type_id` INT NOT NULL,
	FOREIGN KEY(event_type_id) REFERENCES event_types(`id`),
	FOREIGN KEY(condition_type_id) REFERENCES condition_types(`id`),
	PRIMARY KEY(`event_type_id`, `condition_type_id`)
);

CREATE TABLE `sensor_types_event_types` (
	`sensor_type_id` INT NOT NULL,
	`event_type_id` INT NOT NULL,
	FOREIGN KEY(sensor_type_id) REFERENCES sensors_types(`id`),
	FOREIGN KEY(event_type_id) REFERENCES event_types(`id`),
	PRIMARY KEY(`sensor_type_id`, `event_type_id`)
);

CREATE VIEW `sensor_types_condition_types` AS 
	SELECT sensor_type_id, condition_type_id 
	FROM event_types_condition_types etct 
	INNER JOIN sensor_types_event_types stet ON (etct.event_type_id = stet.event_type_id);


CREATE TABLE `thresholds_sensor_types` (
	`threshold_id` INT NOT NULL,
	`sensor_type_id` INT NOT NULL,
	FOREIGN KEY(threshold_id) REFERENCES thresholds(`id`),
	FOREIGN KEY(sensor_type_id) REFERENCES sensors_types(`id`),
	PRIMARY KEY(`threshold_id`, `sensor_type_id`)
);


-- CREATE TABLE `event_type_condition_types` (
-- 	`` INT NOT NULL,
-- 	`` INT NOT NULL,
-- 	PRIMARY KEY(``, ``)
-- );


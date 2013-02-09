-- Used to link the event type to possibles operators as the first mandatory condition (for instance: ascending threshold -> greater or equal to a threshold)
CREATE TABLE `event_types_condition_types` (
	`event_type_id` INT NOT NULL,
	`condition_type_id` INT NOT NULL,
	FOREIGN KEY(event_type_id) REFERENCES event_types(`id`),
	FOREIGN KEY(condition_type_id) REFERENCES condition_types(`id`),
	PRIMARY KEY(`event_type_id`, `condition_type_id`)
);

-- Used to link sensor_types to event types. That is to say, which event can we use for a given sensor type
CREATE TABLE `sensor_types_event_types` (
	`sensor_type_id` INT NOT NULL,
	`event_type_id` INT NOT NULL,
	FOREIGN KEY(sensor_type_id) REFERENCES sensors_types(`id`),
	FOREIGN KEY(event_type_id) REFERENCES event_types(`id`),
	PRIMARY KEY(`sensor_type_id`, `event_type_id`)
);

-- Used to link sensor types to condition types: That is to say, except the case of the first mandatory condition, which conditions/operators can we use on the value of a given device ?
CREATE VIEW `sensor_types_condition_types` AS 
	SELECT sensor_type_id, condition_type_id 
	FROM event_types_condition_types etct 
	INNER JOIN sensor_types_event_types stet ON (etct.event_type_id = stet.event_type_id);

-- CREATE TABLE `event_type_condition_types` (
-- 	`` INT NOT NULL,
-- 	`` INT NOT NULL,
-- 	PRIMARY KEY(``, ``)
-- );


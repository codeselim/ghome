CREATE VIEW events_launchers_view AS
	SELECT s.* FROM `sensors` s
	WHERE s.sensor_type_id IN (
		SELECT stet.sensor_type_id
		FROM `sensor_types_event_types` stet
	);
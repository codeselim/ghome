CREATE VIEW actions_receivers_view AS
	SELECT s.* FROM sensors s
	WHERE s.sensor_type_id IN (
		SELECT st.sensor_type_id 
		FROM actions_types st
	)
	ORDER BY s.sensor_type_id;
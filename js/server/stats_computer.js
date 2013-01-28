var db ;



/**
 *Function that compute the average of temperature each hour and write the result in the table daily_stats
 *it will be called at the begining of every hour
 *@param
 *@returns
*/
 function temperature_h ( ) {
 	var date = new Date();
	var previous_hour = date.getHours() - 1;
	//insert the average of temperature of the previous hour in the table daily_stats
	query_str = "insert into daily_stats (type_stats,value,day)
				Select  sensors_types.id, avg(logs.value), strftime('%Y-%m-%d %H:00:00', logs.time)
				from logs,sensors_types,sensors
				where sensors.sensor_type_id = sensors_types.id and 
				sensors.sensor_type_id = logs.sensor_id and sensors_types.id = 1 and
				(strftime('%H',logs.time) = ?) and strftime('%Y-%m-%d', logs.time) = date('now');"
	db.query (query_str, [previous_hour],NULL)
 }


/**
 *Function that compute the sum of electric consumption each hour and write the result in the table daily_stats
 *it will be called at the begining of every hour
 *@param
 *@returns
*/
 function consumption_h ( ) {
 	var date = new Date();
	var previous_hour = date.getHours() - 1;
	//insert the average of temperature of the previous hour in the table daily_stats
	query_str = "insert into daily_stats (type_stats,value,day)
				Select  sensors_types.id, sum(logs.value), strftime('%Y-%m-%d %H:00:00', logs.time)
				from logs,sensors_types,sensors
				where sensors.sensor_type_id = sensors_types.id and 
				sensors.sensor_type_id = logs.sensor_id and sensors_types.id = 5 and
				(strftime('%H',logs.time) = ?) and strftime('%Y-%m-%d', logs.time) = date('now');"
	db.query (query_str, [previous_hour],NULL)
 }

 /**
 *Function that compute the average of temperature each day and write the result in the table monthly_stats
 *it will be called at the begining of everyday
 *@param
 *@returns
*/
 function temperature_d ( ) {
 	
	//insert the average of temperature of the previous day in the table monthly_stats
	query_str = "insert into monthly_stats (type_stats,value,day)
				Select  sensors_types.id, avg(logs.value), strftime('%Y-%m-%d , logs.time)
				from logs,sensors_types,sensors
				where sensors.sensor_type_id = sensors_types.id and 
				sensors.sensor_type_id = logs.sensor_id and sensors_types.id = 1 and
				strftime('%Y-%m-%d', logs.time) =  strftime('%Y-%m-%d','now', '-1 day');"
	db.query (query_str, NULL,NULL)
 }


/**
 *Function that compute the sum of electric consumption each day and write the result in the table monthly_stats
 *it will be called at the begining of everyday
 *@param
 *@returns
*/
 function consumption_d ( ) {
 	
	//insert the average of temperature of the previous day in the table monthly_stats
	query_str = "insert into monthly_stats (type_stats,value,day)
				Select  sensors_types.id, sum(logs.value), strftime('%Y-%m-%d , logs.time)
				from logs,sensors_types,sensors
				where sensors.sensor_type_id = sensors_types.id and 
				sensors.sensor_type_id = logs.sensor_id and sensors_types.id = 5 and
				strftime('%Y-%m-%d', logs.time) =  strftime('%Y-%m-%d','now', '-1 day');"
	db.query (query_str, NULL,NULL)
 }



function start ( ) {

}


exports.start = start 

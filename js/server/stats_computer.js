
var tpl = require('./template_engine')
var shared = require('./shared_data')
var SQL_TABLES_DIC = shared.get_shared_data('SQL_TABLES');



function statsRH(req, res, params, responseSender){
	//var d1 = new Date(date1);
 	//var d2 = new Date(date2);
 	//var diff = d2 - d1;
 	// var table = "";
 	// if (diff < 172800000 ) //difference between date2 and date1 is less than 2 days
		// table = "hour_stats"
 	// else if (diff > 172800000 && diff < 3888000000 ) //difference between date2 and date1 is more than 2 days and less than 45 days
		// table = "daily_stats"
 	// else 
		// table = "monthly_stats"
 
 	var query_str = " select time, value,min, max "+
					" from hour_stats "+
					" where time between '2013-02-08 00:00' and '2013-02-09 22:00'  "+
					" and sensor_type_id = 1; "	
	params.db.select_query (query_str, null, 
		function (err, rows){

			var xaxis_data = [];
			var maximum_data = null;
			var moyenne_data = null;
			var minimum_data = null;

			var actions = '{'
			if (rows.length > 0){
				for (var i = 0 ; i < rows.length - 1 ;i++) {
				xaxis_data.push(rows[i].time.trim().toString())
				}
			}
			
			var stats_data = {'chart': {
                 				'renderTo': "container",
                 				'type': "line",
                 				'marginRight': 130,
                 				'marginBottom': 25
             				},
             			'title': {
             				    'text': 'Température',
                				'x': -20 //center
             				},
             			'xAxis': {
                		'categories': xaxis_data
            				},            			
            			'yAxis': {
        	        				'title': {
            	        			'text': 'Temperature (°C)'
 		               				},
                					'plotLines': [{
                    				'value': 0,
                    				'width': 1,
                    				'color': '#808080'
                					}]
            				},
            			 'tooltip': {
                				'formatter': function() {  return '<b>'+this.series.name +'</b><br/>'+this.x+': '+this.y+'°C';   }
            				},
            			'legend': {	
                				'layout': 'vertical',
                				'align': 'right',
                				'verticalAlign': 'top',
                				'x': -10,
                				'y': 100,
                				'borderWidth': 0
            				},
           				'series': [{
                				'name': 'Maximum',
                				'data': [7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6] 
                					}, {
                				'name': 'Moyenne',
                				'data': [-0.2, 0.8, 5.7, 11.3, 17.0, 22.0, 24.8, 24.1, 20.1, 14.1, 8.6, 2.5]
            						}, {
                				'name': 'Minimum',
                				'data': [-0.9, 0.6, 3.5, 8.4, 13.5, 17.0, 18.6, 17.9, 14.3, 9.0, 3.9, 1.0]
            					}]
            		}
		
			var templateData = {
			// 'IN_TEMP'		       : shared.get_shared_data('IN_TEMP')
			// , 'OUT_TEMP'	     : shared.get_shared_data('OUT_TEMP')
			// , 'TEST_DATA'		 : params.postData
			// , 'COLOR_TEMP_IN'  : temp2color(shared.get_shared_data('IN_TEMP'))
			// , 'COLOR_TEMP_OUT' : temp2color(shared.get_shared_data('OUT_TEMP'))
			//STATS_DATA :"chart: { renderTo: 'container', type: 'line', marginRight: 130, marginBottom: 25 },"
			STATS_DATA :  JSON.stringify(stats_data)
			//JSON.parse('{ "chart": {    "renderTo": "container",  "type": "line", "marginRight": 130,  "marginBottom": 25 }}')
			}
			var data = tpl.get_template_result("stats.html", templateData)
			console.log(params['pathname'])
			params['fileUrl'] = 'stats.html'
			responseSender(req, res, params, data)
         })  //end call back
} //END RH



/**
 *Function that computes the average,min and max of temperatures each hour and writes the results in the table hour_stats
 *it will be called at the begining of every hour
 *@param
 *@returns
*/
 function temperature_h ( ) {
 	var sensor_id = shared.get_shared_data('IN_TEMP_SENSOR_ID') //id of the main indoor temperature sensor
 	var date = new Date();
	var previous_hour = date.getHours() - 1;
	//insert the average of temperature of the previous hour in the table hour_stats
	var query_str = "insert into hour_stats (sensor_id,sensor_type_id,value,min,max,time)"+
					"select logs.sensor_id, sensors.sensor_type_id,avg(logs.value),min(logs.value), max(logs.value),  strftime('%Y-%m-%d %H:00:00', logs.time)"+
					"from logs inner join sensors on logs.sensor_id =  sensors.id"+
					"where sensors.sensor_type_id  = 1 and "+
					"sensors.hardware_id =  ? and"+
					"strftime('%Y-%m-%d', logs.time) = date('now') and"+
					"(strftime('%H',logs.time) = '?') ;"			
	db.query (query_str, [sensor_id,previous_hour],NULL)

	var delete_query_str = "delete from logs where id in ("+
					"select logs.id"+
					"from logs inner join sensors on logs.sensor_id =  sensors.id"+
					"where sensors.sensor_type_id  = 1 and "+
					"strftime('%Y-%m-%d', logs.time) = date('now') and"+
					"(strftime('%H',logs.time) = '?') ;"			
	db.query (query_str, [previous_hour],NULL)
 }


/**
 *Function that computes the sum of electric consumption each hour and writes the result in the table hour_stats
 *it will be called at the begining of every hour
 *@param
 *@returns
*/
 function consumption_h ( ) {
 	var date = new Date();
	var previous_hour = date.getHours() - 1;
	//insert the average of temperature of the previous hour in the table hour_stats
	var query_str = "insert into hour_stats (sensor_id,sensor_type_id,value,time)"+
				"Select  logs.sensor_id, sensors.sensor_type_id, sum(logs.value),  strftime('%Y-%m-%d %H:00:00', logs.time)"+
				"from logs inner join sensors on logs.sensor_id =  sensors.id"+
				"where sensors.sensor_type_id  = 5 and"+
				"(strftime('%H',logs.time) = '?') and strftime('%Y-%m-%d', logs.time) = date('now');"
	db.query (query_str, [previous_hour],NULL)

	var delete_query_str = "delete from logs where id in ("+
					"select logs.id"+
					"from logs inner join sensors on logs.sensor_id =  sensors.id"+
					"where sensors.sensor_type_id  = 5 and "+
					"strftime('%Y-%m-%d', logs.time) = date('now') and"+
					"(strftime('%H',logs.time) = '?') ;"			
	db.query (query_str, [previous_hour],NULL)
 }

 /**
 *Function that computes the average,min and max of of temperature each day and writes the result in the table daily_stats
 *it will be called at the begining of everyday
 *@param
 *@returns
*/
 function temperature_d ( ) {
 	//insert the average of temperature of the previous day in the table daily_stats
	var query_str = "insert into daily_stats (sensor_id,sensor_type_id,value,min,max,time)"+
				"Select  sensor_id,sensor_type_id, avg(value),min(min), max(max),  strftime('%Y-%m-%d', time)"+
				"from hour_stats "+
				"where sensor_type_id = 1 and"+
				"strftime('%Y-%m-%d', time) =  strftime('%Y-%m-%d','now', '-1 day');"
	db.query (query_str, NULL,NULL)
 }


/**
 *Function that computes the sum of electric consumption each day and writes the result in the table daily_stats
 *it will be called at the begining of everyday
 *@param
 *@returns
*/
 function consumption_d ( ) {
 	
	//insert the average of temperature of the previous day in the table daily_stats
	var query_str = "insert into daily_stats (sensor_id,sensor_type_id,value,time)"+
				"Select  sensor_id,sensor_type_id, avg(value),  strftime('%Y-%m-%d', time)"+
				"from hour_stats "+
				"where sensor_type_id = 5 and"+
				"strftime('%Y-%m-%d', time) =  strftime('%Y-%m-%d','now', '-1 day');"
	db.query (query_str, NULL,NULL)
 }

  /**
 *Function that computess the average of temperature each day and writes the result in the table monthly_stats
 *it will be called at the begining of the month
 *@param
 *@returns
*/
 function temperature_m ( ) {
 	//insert the average of temperature of the previous month in the table monthly_stats
	var query_str = "insert into monthly_stats (sensor_id,sensor_type_id,value,min,max,time)"+
				"Select  sensor_id,sensor_type_id, avg(value),min(min), max(max),  strftime('%Y-%m-%d', time,'start of month')"+
				"from daily_stats "+
				"where sensor_type_id = 1 and"+
				"strftime('%Y-%m', time) =  strftime('%Y-%m','now', '-1 month');"
	db.query (query_str, NULL,NULL)
 }


/**
 *Function that computess the sum of electric consumption each month and writes the result in the table monthly_stats
 *it will be called at the begining of the month
 *@param
 *@returns
*/
 function consumption_m ( ) {
 	
	//insert the average of temperature of the previous month in the table monthly_stats
	var query_str = "insert into monthly_stats (sensor_id,sensor_type_id,value,time)"+
				"Select  sensor_id,sensor_type_id, avg(value),strftime('%Y-%m-%d', time,'start of month')"+
				"from daily_stats "+
				"where sensor_type_id = 5 and"+
				"strftime('%Y-%m', time) =  strftime('%Y-%m','now', '-1 month');"
	db.query (query_str, NULL,NULL)
 }


/**
 * Gets temperature stats for a certain type of sensor in [date1,date2]
 * dates must be in the following format : YYYY-MM-DD HH:MM:SS
 *@params {string} type_sensor, date1, date2
 *@returns
*/
<<<<<<< HEAD
 function get_temperature_stats (type_sensor, date1, date2) {
 	var d1 = new Date(date1);
 	var d2 = new Date(date2);
 	var diff = d2 - d1;
 	var table = "";
 	if (diff < 172800000 ) //difference between date2 and date1 is less than 2 days
		table = "hour_stats"
 	else if (diff > 172800000 && diff < 3888000000 ) //difference between date2 and date1 is more than 2 days and less than 45 days
		table = "daily_stats"
 	else 
		table = "monthly_stats"
 
 	var query_str = " select time, value,min, max "+
					"from ?"+
					"where time between '?' and '?'"+
					"and sensor_type_id = 1; "	
	db.query (query_str, [table,date1,date2,type_sensor], getData (err, rows))
	if (err != NULL)
		return rows
	else 
		return NULL
 }
=======
 function get_temperature_stats (date1, date2) {
 	
 } //end get_temperature_stats 
>>>>>>> 1ea4a33de2cb7e3f71daa720e6723844a86a5abf

/**
 * Gets electricity stats for a certain type of sensor in [date1,date2]
 * dates must be in the following format : YYYY-MM-DD HH:MM
 *@params {string} type_sensor, date1, date2
 *@returns
*/
 function get_consumption_stats (type_sensor, date1, date2) {
 	var d1 = new Date(date1);
 	var d2 = new Date(date2);
 	var diff = d2 - d1;
 	var table = "";
 	if (diff < 172800000 ) //difference between date2 and date1 is less than 2 days
		table = "hour_stats"
 	else if (diff > 172800000 && diff < 3888000000 ) //difference between date2 and date1 is more than 2 days and less than 45 days
		table = "daily_stats"
 	else 
		table = "monthly_stats"

 	var query_str = "select time, value "+
					" from ? "+
					" where time between '?' and '?' "+
					" and sensor_type_id = 5; "	
	db.query (query_str, [table,date1,date2,type_sensor], getData (err, rows))
	if (err != NULL)
		return rows
	else 
		return NULL
 }


// function getData ( err, rows){
// 	var array = [] ;
// 	for (var r in rows) {
//     	//console.log(r.value);
//     	array.push(rows[r]);
//     }
// }


function start ( ) {

}


exports.start = start 
exports.get_temperature_stats = get_temperature_stats
exports.get_consumption_stats = get_consumption_stats
exports.temperature_h = temperature_h
exports.temperature_d = temperature_d
exports.temperature_m = temperature_m
exports.consumption_h = consumption_h
exports.consumption_d = consumption_d
exports.consumption_m = consumption_m
exports.statsRH = statsRH
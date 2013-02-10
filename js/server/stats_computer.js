var qs = require('querystring')
var tpl = require('./template_engine')
var shared = require('./shared_data')
var SQL_TABLES_DIC = shared.get_shared_data('SQL_TABLES');


function statsRH(req, res, params, responseSender){
	//Gethering POST data
	var postData = qs.parse(params.postData)
	console.log(postData.datefrom+"  "+postData.dateto+" "+postData.typedestatistiques)

	var _datefrom = null
	var _dateto = null
	var _tempstats = null
	var _electstats = null
    postData.datefrom != null ? _datefrom = postData.datefrom : _datefrom = null
    postData.dateto != null ? _dateto = postData.dateto : _dateto = null		
    switch (postData.typedestatistiques){
    	case 'temperature':
    	_tempstats = 1
    	_electstats= 0
    	break
    	case 'electricity':
    	_tempstats = 0
    	_electstats = 1
    	break
    	default:
    	_tempstats = 0 
    	_electstats = 0
    	break
    }

	var d1 = new Date(postData.datefrom);
 	var d2 = new Date(postData.dateto);
 	var diff = d2 - d1;
 	var table = ""
 	var time = ""
 	if (diff < 86400000 ) {//difference between date2 and date1 is less than 24 hours
		table = "hour_stats"
		time = "strftime('%m-%d %Hh', time)"
	}
 	else if (diff > 86400000 && diff < 2160000000 ) {//difference between date2 and date1 is more than 2 days and less than 45 days
		table = "daily_stats"
		time = "strftime('%m-%d', time)"
	}
 	else {
		table = "monthly_stats"
		time = "strftime('%Y-%m', time)"
	}

	switch(postData.typedestatistiques){
		case 'temperature' :
			
		 
		 	var query_str = " select "+time+"time, value,min, max "+
							" from "+table +
							" where time between '"+postData.datefrom+"' and '"+postData.dateto+"'  "+
							" and sensor_type_id = 1; "	
			

			params.db.select_query (query_str, null, 
				function (err, rows){

					var xaxis_data = [];
					var maximum_data = [];
					var average_data = [];
					var minimum_data = [];
					console.log("Temperature rows:",rows)
					console.log(err)
					
					var actions = '{'
					if (rows.length > 0){
						for (var i = 0 ; i < rows.length - 1 ;i++) {
						xaxis_data.push(rows[i].time.trim().toString())
						minimum_data.push(rows[i].min)
						average_data.push(rows[i].value)
						maximum_data.push(rows[i].max)
						}
			}
			
			var stats_data = {'chart': {
                 				'renderTo': "container",
                 				'type': "line",
                 				'marginRight': 130,
                 				'marginBottom': 25
             				},
             			'title': {
             				    'text': 'Evolution de la température ',
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
                				'data': maximum_data
                					}, {
                				'name': 'Moyenne',
                				'data': average_data
            						}, {
                				'name': 'Minimum',
                				'data': minimum_data
            					}]
            		}
		
			var templateData = {
			STATS_DATA :  JSON.stringify(stats_data)
			,DONT_DRAW : 1
			,DATEFROM_VALUE : _datefrom
			,DATETO_VALUE : _dateto
			,TEMP_STAT : _tempstats
			,ELECT_STAT: _electstats
			}
			var data = tpl.get_template_result("stats.html", templateData)
			console.log(params['pathname'])
			params['fileUrl'] = 'stats.html'
			responseSender(req, res, params, data)
         })  //end call back
		break
		
		case 'electricity' :
			var query_str = " select "+time+"time, value "+
							" from "+table +
							" where time between '"+postData.datefrom+"' and '"+postData.dateto+"'  "+
							" and sensor_type_id = 5; "	
			

			params.db.select_query (query_str, null, 
				function (err, rows){

					var xaxis_data = [];
					var average_data = [];
					console.log("aaaaaaaah",rows)
					console.log(err)
					
					var actions = '{'
					if (rows.length > 0){
						for (var i = 0 ; i < rows.length - 1 ;i++) {
						xaxis_data.push(rows[i].time.trim().toString())
						average_data.push(rows[i].value)
						}
			}
			
			var stats_data = {'chart': {
                 				'renderTo': "container",
                 				'type': "line",
                 				'marginRight': 130,
                 				'marginBottom': 25
             				},
             			'title': {
             				    'text': 'Evolution de la consommation d\'électricité ',
                				'x': -20 //center
             				},
             			'xAxis': {
                		'categories': xaxis_data
            				},            			
            			'yAxis': {
        	        				'title': {
            	        			'text': 'Electricité (wH)'
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
                				'name': 'Moyenne',
                				'data': average_data
            					}]
            		}
			
			
			

			var templateData = {
			STATS_DATA :  JSON.stringify(stats_data)
			,DONT_DRAW : 1
			,DATEFROM_VALUE : _datefrom
			,DATETO_VALUE : _dateto
			,TEMP_STAT : _tempstats
			,ELECT_STAT: _electstats
			}
			var data = tpl.get_template_result("stats.html", templateData)
			console.log(params['pathname'])
			params['fileUrl'] = 'stats.html'
			responseSender(req, res, params, data)
         })  //end call back

		break
		
		default:
			var templateData = {
			 DONT_DRAW : 0
			,DATEFROM_VALUE : _datefrom
			,DATETO_VALUE : _dateto
			,TEMP_STAT : _tempstats
			,ELECT_STAT: _electstats
			}
			var data = tpl.get_template_result("stats.html", templateData)
			console.log(params['pathname'])
			params['fileUrl'] = 'stats.html'
			responseSender(req, res, params, data)
		break


	} //END switch

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
					"sensors.hardware_id =  "+sensor_id+" and"+
					"strftime('%Y-%m-%d', logs.time) = date('now') and"+
					"(strftime('%H',logs.time) = '"+previous_hour+"') ;"			
	params.db.select_query (query_str, null,function (err,rows){ console.log(err)})

	var delete_query_str = "delete from logs where id in ("+
					"select logs.id"+
					"from logs inner join sensors on logs.sensor_id =  sensors.id"+
					"where sensors.sensor_type_id  = 1 and "+
					"strftime('%Y-%m-%d', logs.time) = date('now') and"+
					"(strftime('%H',logs.time) = '"+previous_hour+"') ;"			
	params.db.select_query (query_str, null,function (err,rows){ console.log(err)})
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
				"(strftime('%H',logs.time) = '"+previous_hour+"') and strftime('%Y-%m-%d', logs.time) = date('now');"
	params.db.select_query (query_str,null,function (err,rows){ console.log(err)})

	var delete_query_str = "delete from logs where id in ("+
					"select logs.id"+
					"from logs inner join sensors on logs.sensor_id =  sensors.id"+
					"where sensors.sensor_type_id  = 5 and "+
					"strftime('%Y-%m-%d', logs.time) = date('now') and"+
					"(strftime('%H',logs.time) = '"+previous_hour+"') ;"			
	params.db.select_query (query_str,null,function (err,rows){ console.log(err)})
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
	params.db.select_query (query_str, null,function (err,rows){ console.log(err)})
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
	params.db.select_query (query_str, null,function (err,rows){ console.log(err)})
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
	params.db.select_query (query_str, null,function (err,rows){ console.log(err)})
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
	params.db.select_query (query_str, null,function (err,rows){ console.log(err)})
 }


/**
 * Gets temperature stats for a certain type of sensor in [date1,date2]
 * dates must be in the following format : YYYY-MM-DD HH:MM:SS
 *@params {string} type_sensor, date1, date2
 *@returns
*/

 // function get_temperature_stats (type_sensor, date1, date2) {
 // 	var d1 = new Date(date1);
 // 	var d2 = new Date(date2);
 // 	var diff = d2 - d1;
 // 	var table = "";
 // 	if (diff < 172800000 ) //difference between date2 and date1 is less than 2 days
	// 	table = "hour_stats"
 // 	else if (diff > 172800000 && diff < 3888000000 ) //difference between date2 and date1 is more than 2 days and less than 45 days
	// 	table = "daily_stats"
 // 	else 
	// 	table = "monthly_stats"
 
 // 	var query_str = " select time, value,min, max "+
	// 				"from ?"+
	// 				"where time between '?' and '?'"+
	// 				"and sensor_type_id = 1; "	
	// params.db.select_query (query_str, [table,date1,date2,type_sensor], getData (err, rows))
	// if (err != NULL)
	// 	return rows
	// else 
	// 	return NULL
 // }

//  function get_temperature_stats (date1, date2) {
 	
//  } //end get_temperature_stats 


// /**
//  * Gets electricity stats for a certain type of sensor in [date1,date2]
//  * dates must be in the following format : YYYY-MM-DD HH:MM
//  *@params {string} type_sensor, date1, date2
//  *@returns
// */
//  function get_consumption_stats (type_sensor, date1, date2) {
//  	var d1 = new Date(date1);
//  	var d2 = new Date(date2);
//  	var diff = d2 - d1;
//  	var table = "";
//  	if (diff < 172800000 ) //difference between date2 and date1 is less than 2 days
// 		table = "hour_stats"
//  	else if (diff > 172800000 && diff < 3888000000 ) //difference between date2 and date1 is more than 2 days and less than 45 days
// 		table = "daily_stats"
//  	else 
// 		table = "monthly_stats"

//  	var query_str = "select time, value "+
// 					" from ? "+
// 					" where time between '?' and '?' "+
// 					" and sensor_type_id = 5; "	
// 	params.db.select_query (query_str, [table,date1,date2,type_sensor], getData (err, rows))
// 	if (err != NULL)
// 		return rows
// 	else 
// 		return NULL
//  }


// // function getData ( err, rows){
// // 	var array = [] ;
// // 	for (var r in rows) {
// //     	//console.log(r.value);
// //     	array.push(rows[r]);
// //     }
// // }


// function start ( ) {

// }


// exports.start = start 
// exports.get_temperature_stats = get_temperature_stats
// exports.get_consumption_stats = get_consumption_stats
exports.temperature_h = temperature_h
exports.temperature_d = temperature_d
exports.temperature_m = temperature_m
exports.consumption_h = consumption_h
exports.consumption_d = consumption_d
exports.consumption_m = consumption_m
exports.statsRH = statsRH
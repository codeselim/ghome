"use strict"



// var fs = require('fs')
var tpl = require('./template_engine')
var sutils = require('./sensors')
// var ss = require('./sensors_server')
var shared = require('./shared_data')
var t = shared.get_shared_data('SQL_TABLES');

var schedulerRH  = function (req, res, params, responseSender) {
	var tplData = {}
	var q = "SELECT s.sensor_type_id, st.name, t.id AS id, t.name AS device_name " + // Note : t.name is renamed AS device_name just for compatibility with generate_json_devices_list_from_sql_rows() function
		"FROM `" + t.t + "` t " +
		"INNER JOIN `" + t.s + "` s ON (t.target_id = s.id) " +
		"INNER JOIN `" + t.st + "` st ON (st.id = s.sensor_type_id) " +
		"ORDER BY st.name, device_name ASC"
	var p = null
	console.log(q)
	params.db.select_query(q, p, function (err, rows) {
		if (null != err) {
			console.error("An error occured while reading the list of tasks in the DB.", q)
		} else {
			tplData['tasks'] = sutils.generate_json_devices_list_from_sql_rows(rows)
			console.log(tplData)
			var data = tpl.get_template_result("scheduler.html", tplData)
			params.fileUrl = 'scheduler.html'
			responseSender(req, res, params, data)
		}
	})
}

var taskRH  = function (req, res, params, responseSender) {
	switch(params.query.action) {

		case 'get_actions' : //* Returns the actions available for a given device type
		{
			console.log('get_actions: deviceType=' + params.query.deviceType)
			//* Required data: for deviceType, list of actions, and for each: {actionlabel: action id}
			var actions = ''
			params.db.select_query("SELECT at.id, at.name " +
									"FROM `" + t.at + "` at " +
									"WHERE at.sensor_type_id = ? "
			, [params.query.deviceType], function (err, rows){
				if(err) console.log("[scheduler_module reported SQL_ERROR] : "+err);
				var actions = sutils.generate_json_get_actions_by_device_type(rows)
				res.end(actions)
			})
			break
		}

		case 'get_event_types' : //* Returns the events available for a given sensor type
		{
			console.log("SCHMOD: Getting event types from sensor_type")
			console.log(params)
			var data = {}
			//* Required data: for sourceType, list of events, and for each: {evtlabel: evtid}
			var q = "SELECT stet.event_type_id, et.name " + 
					"FROM `" + t['stet'] + "` stet " +
					"INNER JOIN `" + t['et'] + "` et ON (et.id = stet.event_type_id) " +
					"WHERE stet.sensor_type_id = ?"
			var p = [parseInt(params.query.sourceType)]
			params.db.select_query(q, p, function (err, rows) {
				for(var i in rows) {
					data[rows[i]['name']] = rows[i]['event_type_id']
				}
				res.end(JSON.stringify(data))
			})			
			break
		}

		case 'get_condition_types' : //* Returns the condition types for a given event type or sensor type
		{
			var data = {}
			//* Required data: for evtType (resp. sensorType, list of events, and for each: {evtlabel: evtid}
			if (params.query.evtType) { // Getting the conditions types related to a given event_type
				console.log("SCHMOD: Getting conditions types from event_type")
				var q = "SELECT etct.condition_type_id, ct.name " + 
						"FROM `" + t['etct'] + "` etct " +
						"INNER JOIN `" + t['ct'] + "` ct ON (ct.id = etct.condition_type_id) " +
						"WHERE etct.event_type_id = ?"
				var p = [parseInt(params.query.evtType)]
				params.db.select_query(q, p, function (err, rows) {
					for(var i in rows) {
						data[rows[i]['name']] = rows[i]['condition_type_id']
					}
					res.end(JSON.stringify(data))
				})
			} else if (params.query.sensorType) { // Getting the conditions types related to a given sensor_type
				console.log("SCHMOD: Getting conditions types from sensor_type")
				var q = "SELECT stct.condition_type_id, ct.name " + 
						"FROM `" + t['stct'] + "` stct " +
						"INNER JOIN `" + t['ct'] + "` ct ON (ct.id = stct.condition_type_id) " +
						"WHERE stct.sensor_type_id = ?"
				var st = parseInt(params.query.sensorType)
				var p = [st]
				params.db.select_query(q, p, function (err, rows) {
					if (null != err) {
					console.error("SCHMOD: SQL Query failed", err)
					};
					for(var i in rows) {
						data[rows[i]['name']] = rows[i]['condition_type_id']
					}
					res.end(JSON.stringify(data))
				})
			} 
			break
		}

		case 'get_condition_values' : //* Returns the possible values for a given condition type
		{
			var data = {}
			var q = 
			"SELECT input_type " +
			"FROM `" + t['ct'] + "` ct " +
			"WHERE id = ?" 
			var p = [parseInt(params.query.condType)]
			params.db.select_query(q, p, function (err, rows) {
				if (null != err) {
					console.error("SCHMOD: SQL ERROR", err)
				} else {
					data['type'] = rows[0].input_type
					if (data.type == 'list') {
						q = 
						"SELECT th.id AS id, th.name AS name " +
						" FROM `" + t['thst'] + "` thst " +
						" INNER JOIN `" + t['th'] + "` th ON(th.id = thst.threshold_id)" +
						" WHERE thst.sensor_type_id = ?"
						p = [parseInt([params.query.sensorType])]
						data['values'] = {}
						params.db.select_query(q, p, function (err, rows) {
							if (null != err) {
								console.log("SCHMOD: not a list", JSON.stringify(data))
							} else {
								for(var i in rows) {
									data.values[rows[i]['name']] = rows[i]['id']
								}
								console.log("SCHMOD: IS a list", JSON.stringify(data))
								res.end(JSON.stringify(data))
							}
						})
					} else {
						console.log("SCHMOD: NOT a list", JSON.stringify(data))
						res.end(JSON.stringify(data))
					}
				}
			})
			break
		}

		case 'initCache' : //* Returns the html for a condition, preloaded with the sensors list (more?)
		{
			getEvtSources(params.db, function (evtSources) {
				var data = {'conditionTemplate' : tpl.get_template_result("new_device_templates.html", {
					  'conditionTemplate' : true
					, 'evtSourceTypes' : evtSources
				})}
				res.end(JSON.stringify(data))
			})
			break
		}

		case 'submit':
		{
			console.log('-------------------------------------')
			console.log(params.query)
			console.log('-------------------------------------')
			res.end(JSON.stringify({success: Math.random() > 0.5}))
		}
			break

		case 'edit':
		case 'new': //* Returns the devices for the action and the event
		{
			var deviceTypes = ''

			/**
			 *@TODO : get the devices that receive actions and adjust the query as well!! 
			 */
			params.db.select_query( 
				"SELECT st.name AS name, arv.sensor_type_id AS sensor_type_id, arv.id AS id, arv.name AS device_name " +
				"FROM " + t.st + " st " +
				"INNER JOIN `" + t['arv'] + "` arv ON (st.id = arv.sensor_type_id) " +
				"ORDER BY st.name, device_name ASC",
				null, 
				function (err, rows) {
					if(null != err) {
						console.log("[scheduler_module reported SQL_ERROR] : " + err)
					}
					
					var actionDevices = sutils.generate_json_devices_list_from_sql_rows(rows)

					getEvtSources(params.db, function (evtSources) {
						var tplData = {
							 'actionDevices' : actionDevices,
							 'evtSourceTypes' : evtSources
						}

						var html = tpl.get_template_result("task.html", tplData)

						params.fileUrl = 'task.html'
						responseSender(req, res, params, html)
					})
				})
			break
		}
	}
}

/** Gets the event sources from the DB and passes them to the specified callback as first argument
 * @param{dbms.Database} db : The dbms.Database object
 * @param{function} callback : The callback to be called when the computation is over and to pass the data to
 * @return{undefined} undefined
*/
function getEvtSources(db, callback) {
	var evtSources = 
	[
		{
			'label' : 'Sources spéciales', 
			'devices' : [
				{'label' : 'Date', 'id' : -1, 'type' : -1},
				{'label' : 'Météo', 'id' : -2, 'type' : -2}
			]
		}
	]
	db.select_query(
		"SELECT st.name AS name, elv.sensor_type_id AS sensor_type_id, elv.id AS id, elv.name AS device_name " +
		"FROM " + t.st + " st " +
		"INNER JOIN `" + t['elv'] + "` elv ON (st.id = elv.sensor_type_id) " +
		"ORDER BY st.name, device_name ASC",
		null,
		function (err, rows) {
			var es = sutils.generate_json_devices_list_from_sql_rows(rows)
			evtSources = evtSources.concat(es)
			callback(evtSources)
		}
	)
}

exports.schedulerRequestHandler = schedulerRH
exports.taskRequestHandler = taskRH

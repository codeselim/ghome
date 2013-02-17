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


/**
 * @param{Database} db
 * @param{int} sourceType
 * @param{function} callback
*/
function getActionsByDeviceType (db, deviceType, callback) {
	var actions = ''
	db.select_query(
		"SELECT at.id, at.name " +
		"FROM `" + t.at + "` at " +
		"WHERE at.sensor_type_id = ? ",
		[deviceType], 
		function (err, rows){
			if(err) {
				console.log("SCHMOD", err);
			}
			var actions = sutils.generate_json_get_actions_by_device_type(rows)
			callback(actions)
		}
	)
}

/**
 * @param{Database} db
 * @param{int} sourceType
 * @param{function} callback
*/
function getEvtTypesBySourceType (db, sourceType, callback) {
	var data = {}
	//* Required data: for sourceType, list of events, and for each: {evtlabel: evtid}
	var q = "SELECT stet.event_type_id, et.name " + 
			"FROM `" + t['stet'] + "` stet " +
			"INNER JOIN `" + t['et'] + "` et ON (et.id = stet.event_type_id) " +
			"WHERE stet.sensor_type_id = ?"
	var p = [sourceType]
	db.select_query(q, p, function (err, rows) {
		for(var i in rows) {
			data[rows[i]['name']] = rows[i]['event_type_id']
		}
		callback(data)
	})
}

/**
 * @param{Database} db
 * @param{int} evtType
 * @param{function} callback
*/
function getCondTypesByEvtType (db, evtType, callback) {
	var data = {}
	var q = "SELECT etct.condition_type_id, ct.name " + 
			"FROM `" + t['etct'] + "` etct " +
			"INNER JOIN `" + t['ct'] + "` ct ON (ct.id = etct.condition_type_id) " +
			"WHERE etct.event_type_id = ?"
	var p = [evtType]
	db.select_query(q, p, function (err, rows) {
		for(var i in rows) {
			data[rows[i]['name']] = rows[i]['condition_type_id']
		}
		callback(data)
	})
}


/**
 * @param{Database} db
 * @param{int} sensorType
 * @param{function} callback
*/
function getCondTypesBySensorType (db, sensorType, callback) {
	var data = {}
	var q = "SELECT stct.condition_type_id, ct.name " + 
			"FROM `" + t['stct'] + "` stct " +
			"INNER JOIN `" + t['ct'] + "` ct ON (ct.id = stct.condition_type_id) " +
			"WHERE stct.sensor_type_id = ?"
	var st = sensorType
	var p = [st]
	db.select_query(q, p, function (err, rows) {
		if (null != err) {
			console.error("SCHMOD: SQL Query failed", err)
		}
		for(var i in rows) {
			data[rows[i]['name']] = rows[i]['condition_type_id']
		}
		callback(data)
	})
}


// Note: Just a dev template
/**
 * @param{Database} db
 * @param{int} sourceType
 * @param{function} callback
*/
function maFonction (db, sourceType, callback) {

}

/**
 * @param{Database} db
 * @param{int} condType
 * @param{int} sensorType
 * @param{function} callback
*/
function getCondValuesByCondTypeAndSensorType (db, condType, sensorType, callback) {
	var data = {}
	var q = 
	"SELECT input_type " +
	"FROM `" + t['ct'] + "` ct " +
	"WHERE id = ?" 
	var p = [condType]
	db.select_query(q, p, function (err, rows) {
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
				p = [sensorType]
				data['values'] = {}
				db.select_query(q, p, function (err, rows) {
					if (null != err) {
						console.log("SCHMOD: SQL ERROR", err)
					} else {
						for(var i in rows) {
							data.values[rows[i]['name']] = rows[i]['id']
						}
						// console.log("SCHMOD: IS a list", JSON.stringify(data))
						callback(data)
					}
				})
			} else {
				// console.log("SCHMOD: NOT a list", JSON.stringify(data))
				callback(data)
			}
		}
	})
}

var taskRH  = function (req, res, params, responseSender) {
	switch(params.query.action) {

		case 'get_actions' : //* Returns the actions available for a given device type
		{
			console.log('get_actions: deviceType=' + params.query.deviceType)
			//* Required data: for deviceType, list of actions, and for each: {actionlabel: action id}
			
			getActionsByDeviceType(params.db, parseInt(params.query.deviceType), function (actions) {
				res.end(JSON.stringify(actions))
			})
			break
		}

		case 'get_event_types' : //* Returns the events available for a given sensor type
		{
			console.log("SCHMOD: Getting event types from sensor_type")
			getEvtTypesBySourceType(params.db, parseInt(params.query.sourceType), function (data) {
				res.end(JSON.stringify(data))
			})		
			break
		}

		case 'get_condition_types' : //* Returns the condition types for a given event type or sensor type
		{
			//* Required data: for evtType (resp. sensorType, list of events, and for each: {evtlabel: evtid}
			if (params.query.evtType) { // Getting the conditions types related to a given event_type
				console.log("SCHMOD: Getting conditions types from event_type")
				getCondTypesByEvtType(params.db, parseInt(params.query.evtType), function (data) {
					res.end(JSON.stringify(data))
				})
			} else if (params.query.sensorType) { // Getting the conditions types related to a given sensor_type
				console.log("SCHMOD: Getting conditions types from sensor_type")
				getCondTypesBySensorType(params.db, parseInt(params.query.sensorType), function (data) {
					res.end(JSON.stringify(data))
				})
			} 
			break
		}

		case 'get_condition_values' : //* Returns the possible values for a given condition type
		{
			getCondValuesByCondTypeAndSensorType(params.db, parseInt(params.query.condType),parseInt(params.query.sensorType), function (data) {
				res.end(JSON.stringify(data))
			})
			break
		}

		case 'initCache' : //* Returns the html for a condition, preloaded with the sensors list (more?)
		{
			getEvtSources(params.db, function (evtSources) {
				var data = {
					  'conditionTemplate' : tpl.get_template_result("new_device_templates.html", {
						  'conditionTemplate' : true
						, 'evtSourceTypes' : evtSources
						})
					, 'conditionListValueTemplate' : tpl.get_template_result("new_device_templates.html", {
						  'conditionListValueTemplate' : true
						})
					, 'conditionFreeValueTemplate' : tpl.get_template_result("new_device_templates.html", {
						  'conditionFreeValueTemplate' : true
						})
					}
				res.end(JSON.stringify(data))
			})
			break
		}

		case 'submit':
		{
			console.log("SCHMOD", params.query.data)
			var formData = JSON.parse(params.query.data)

			var q = "INSERT INTO `" + t['t'] + '` (name, action_type_id, target_id, event_type_id, origin_id) VALUES (?, ?, ?, ?, ?)'
			var p = [formData.name, formData.act.aAction, formData.act.aActor, formData.evt.evtType, formData.evt.evtSource]
			// console.log(q, p)
			params.db.insert_query(q, p, function (err) {
				if (null != err) {
					console.error("SCHMOD", err)
					res.end(JSON.stringify({success: false, msg: err}))
				} else {
					var taskId = this.lastID
					var count = formData.cond.length
					var cb = function (err) {
						// Small trick here : We know we have to wait for the last callback to terminate in order to send the response. Thus we have an internal counter and we decrement it.
						// When it reaches 0, then we're done and we can answer.
						count--
						if (0 == count) {
							res.end(JSON.stringify({success: true, msg: 'La tâche a été ajoutée avec succès'}))
						}
					}
					for(var i in formData.cond) {
						var q1 = "INSERT INTO `" + t['c'] + "` (task_id, sensor_id, type_id, value_to_compare) VALUES (?, ?, ?, ?)"
						var p1 = [taskId, formData.cond[i].condSource, formData.cond[i].condType, formData.cond[i].condValue]
						// console.log(q1, p1)
						params.db.insert_query(q1, p1, cb)
					}
				}
			})
		}
			break

		case 'edit': //@TODO: Finish and test that
		{
			console.log("SCHMOD: EDIT MODE")
			var taskId = parseInt(params.query.id)
			var deviceTypes = ''
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
							 'evtSourceTypes' : evtSources,
							 'editMode': true
						}

						var q = 
						"SELECT t.name AS name, action_type_id, target_id, sensor_type_id, event_type_id, origin_id, type_id, value_to_compare, sensor_id" +
						" FROM `" + t['t'] + "` t " +
						" INNER JOIN `" + t['s'] + "` s ON(s.id = target_id)" + // WARNING: The join has to be done on the target_id column and NOT on the sensor_id column as we are interested in the type of the target
						" LEFT OUTER JOIN `" + t['c'] + "` c ON(c.task_id = t.id)" +  //  IMPORTANT the LEFT OUTER JOIN, if you do an INNER JOIN then you will not get anything in the case there is no condition linked to the task (hehe...)
						" WHERE t.id = ?" 
						var p = [taskId]
						params.db.select_query(q, p, function (err, rows) {
							if (null != err) {
								console.log("SCHMOD:", err)
							} else {
								// Task related data:
								// console.log(q, p)
								// console.log("taskId", taskId)
								// console.log(rows)
								tplData['taskName'] = rows[0].name
								var targetId = parseInt(rows[0].target_id)
								var aTId = parseInt(rows[0].action_type_id)
								var eTId = parseInt(rows[0].event_type_id)
								var sTId = parseInt(rows[0].sensor_type_id)

								//Selecting the right actionDevice
								for(var i in tplData.actionDevices) {
									for (var j in tplData.actionDevices[i].devices) {
										var s = tplData.actionDevices[i].devices[j] //"s" because it is a Shorter way to write it (and still a reference to the object)
										if (targetId == s.id) {
											s['selected'] = 'selected="selected"'
										}
									}
								}

								for(var i in rows) {
									//@TODO: Treatment for each condition
								}

								//Selecting the right action
								getActionsByDeviceType(params.db, sTId, function (actions) {
									tplData['actionValues'] = []
									for(var i in actions) {
										var sel = ''
										if (aTId == actions[i]) {
											sel = 'selected="selected"'
										}
										tplData['actionValues'].push({label: i, id: actions[i], selected: sel}) // have to translate this very weird format of pushing data directly as a key, to a format usable in the templates
									}
									
									console.log('SCHMOD', JSON.stringify(tplData))

									var html = tpl.get_template_result("task.html", tplData)

									params.fileUrl = 'task.html'
									responseSender(req, res, params, html)
								})
							}
						})
					})
				}
			)
		}
		break

		case 'update': // @TODO: Test that
		{
			var formData = JSON.parse(params.query.data)
			console.log("SCHMOD", formData)
			var taskId = parseInt(params.query.id)

			var q = "UPDATE `" + t['t'] + '` t SET name = ?, action_type_id = ?, target_id = ?, event_type_id = ?, origin_id = ? WHERE t.id = ?'
			var p = [formData.name, formData.act.aAction, formData.act.aActor, formData.evt.evtType, formData.evt.evtSource, taskId]
			console.log(q, p)
			params.db.update_query(q, p, function (err) {
				if (null != err) {
					console.error("SCHMOD", err)
					res.end(JSON.stringify({success: false}))
				} else {
					//* Note: For simplicity's sake, we just delete the previous conditions and insert the new ones, even if they are the same. If you have hours to waste and want to break everything by doing a diff, then do it, but do ask me for help
					q = "DELETE FROM `" + t['c'] + "` WHERE task_id = ?"
					p = [taskId] 
					params.db.update_query(q, p, function (err) {
						if (null != err) {
							console.error("SCHMOD", err)
							res.end(JSON.stringify({success: false}))
						} else {
							var count = formData.cond.length
							var cb = function (err) {
								// Small trick here : We know we have to wait for the last callback to terminate in order to send the response. Thus we have an internal counter and we decrement it.
								// When it reaches 0, then we're done and we can answer.
								count--
								if (0 == count) {
									res.end(JSON.stringify({success: true}))
								}
							}
							for(var i in formData.cond) {
								var q1 = "INSERT INTO `" + t['c'] + "` (task_id, sensor_id, type_id, value_to_compare) VALUES (?, ?, ?, ?)"
								var p1 = [taskId, formData.cond[i].condSource, formData.cond[i].condType, formData.cond[i].condValue]
								// console.log(q1, p1)
								params.db.insert_query(q1, p1, cb)
							}
						}
					})
				}
			})
		}
		break;

		case 'new': //* Returns the devices for the action and the event
		{
			var deviceTypes = ''
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

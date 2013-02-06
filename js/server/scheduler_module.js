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
			params.db.select_query("SELECT at.id , at.name FROM "+t.at+" at WHERE at.sensor_type_id = ? ", [params.query.deviceType], function (err, rows){
			if(err) console.log("[scheduler_module reported SQL_ERROR] : "+err);
			var actions = sutils.generate_json_get_actions_by_device_type(rows)
			res.end(actions)
			})
			break
		}

		case 'get_event_types' : //* Returns the events available for a given sensor type
		{
			var data = {}
			//* Required data: for sourceType, list of events, and for each: {evtlabel: evtid}
			if (params.query.sourceType == '2' ){
				var data = {
					  'Passe le seuil en montant' : 1
					  , 'Passe le seuil en descendant ' : 1
					  , 'bleh' : 4
				}
			} else if (params.query.sourceType == 3 ){
				var data = {
					  'Activation' : 11
					, 'Désactivation' : 12
				}
			}
			res.end(JSON.stringify(data))
			break
		}

		case 'get_condition_types' : //* Returns the condition types for a given event type or sensor type
		{
			var data = {}
			//* Required data: for evtType (resp. sensorType, list of events, and for each: {evtlabel: evtid}
			if (params.query.evtType) {
				var data = {}
				var q = "SELECT condition_type_id" + 
					"FROM `" + t['etct'] + "` " +
					"WHERE event_type_id = ?"
				var p = [Math.abs(params.query.evtType)]
				params.db.select_query(q, p, function (err, rows) {
					for(var i in rows) {
						data[rows[i]['condition_type_id']] = rows[i]['condition_type_id']
					}
				})
			} else if (params.query.sensorType && params.query.sensorType < 10 ) {
				var data = {
					  '<' : 1 
					, '>' : 2
					, 'pony' : 11
					, 'unicorn' : 12
					, 'narwhal' : 13
				}
			} 
			// console.log(data)
			res.end(JSON.stringify(data))
			break
		}

		case 'get_condition_values' : //* Returns the possible values for a given condition type
		{
			var data = {}
			if (params.query.condType < 10) {
				var data = { 'Seuil1' : 1, 'Seuil2' : 2}
			}
			res.end(JSON.stringify(data))
			break
		}

		case 'initCache' : //* Returns the html for a condition, preloaded with the sensors list (more?)
		{
			var data = {'conditionTemplate' : tpl.get_template_result("new_device_templates.html", {
				  'conditionTemplate' : true
				, 'evtSourceTypes' : [
					{'label' : 'Sources spéciales', 'sensors' : [
						  {'label' : 'Date', 'value' : 1, 'type' : 51}
						, {'label' : 'Météo', 'value' : 2, 'type' : 52}
					]},
					{'label' : 'Capteurs Température', 'sensors' : [
						  {'label' : 'Capteur Température1', 'value' : 1, 'type' : 2}
						, {'label' : 'Capteur Température2', 'value' : 2, 'type' : 2}
					]},
					{'label' : 'Capteurs Présence', 'sensors' : [
						  {'label' : 'Capteur Présence1', 'value' : 1, 'type' : 13}
						, {'label' : 'Capteur Présence2', 'value' : 2, 'type' : 13}
					]}
				]
			})}
			res.end(JSON.stringify(data))
			break
		}

		case 'submit':
		{
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
			params.db.select_query("SELECT st.name, s.sensor_type_id, s.id, s.name AS device_name " +
							"FROM " + t.st + " st " +
							"JOIN " + t.s + " s ON st.id = s.sensor_type_id " +
							"WHERE s.sensor_type_id IN ( " +
							"	SELECT sensor_type_id " +
							"	FROM " + t.at + " " +
							") " +
							"ORDER BY s.sensor_type_id", 
				null, 
				function (err, rows) {
					if(null != err) console.log("[scheduler_module reported SQL_ERROR] : "+err);
					
					var deviceTypes = sutils.generate_json_devices_list_from_sql_rows(rows)

					var data = tpl.get_template_result("task.html", { 
						  'deviceTypes' : deviceTypes
						  //* Alternative device array
						  // 'deviceTypes' : [{'label' : 'Prises', 'devices' : [{'label' : 'Prise1', 'value' : 1, 'type' : 1} , {'label' : 'Prise2', 'value' : 2, 'type' : 1} ]}, {'label' : 'Volets', 'devices' : [{'label' : 'Volet1', 'value' : 1, 'type' : 2} , {'label' : 'Volet2', 'value' : 2, 'type' : 2} ]} ]
						, 'evtSourceTypes' : [
							{'label' : 'Sources spéciales', 'sensors' : [
							    {'label' : 'Date', 'value' : 1, 'type' : 51}
								, {'label' : 'Météo', 'value' : 2, 'type' : 52}
							]},
							{'label' : 'Capteurs Température', 'sensors' : [
							    {'label' : 'Capteur Température1', 'value' : 1, 'type' : 2}
								, {'label' : 'Capteur Température2', 'value' : 2, 'type' : 2}
							]},
							{'label' : 'Capteurs Présence', 'sensors' : [
							    {'label' : 'Capteur Présence1', 'value' : 1, 'type' : 3}
								, {'label' : 'Capteur Présence2', 'value' : 2, 'type' : 3}
							]}
						] 
					})

					params.fileUrl = 'task.html'
					responseSender(req, res, params, data)			
				})
			break
		}
	}
}



exports.schedulerRequestHandler = schedulerRH
exports.taskRequestHandler = taskRH

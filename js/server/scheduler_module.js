"use strict"



// var fs = require('fs')
var tpl = require('./template_engine')
var sutils = require('./sensors')
// var ss = require('./sensors_server')
var shared = require('./shared_data')
var SQL_TABLES_DIC = shared.get_shared_data('SQL_TABLES');
//OUTPUT: SQL_TABLES_DIC - Just for reference
// { st: 'sensors_types',
//   et: 'event_types',
//   at: 'actions_types',
//   l: 'logs',
//   c: 'conditions',
//   ct: 'condition_types',
//   m: 'modes',
//   s: 'sensors',
//   t: 'tasks' 
// }


var schedulerRH  = function (req, res, params, responseSender) {
	var tplData = {}
	var q = "SELECT s.sensor_type_id, st.name, t.id AS id, t.name AS device_name " + // Note : t.name is renamed AS device_name just for compatibility with generate_json_devices_list_from_sql_rows() function
		"FROM `" + SQL_TABLES_DIC.t + "` t " +
		"INNER JOIN `" + SQL_TABLES_DIC.s + "` s ON (t.target_id = s.id) " +
		"INNER JOIN `" + SQL_TABLES_DIC.st + "` st ON (st.id = s.sensor_type_id) " +
		"ORDER BY st.name ASC"
	var p = null
	console.log(q)
	params.db.query(q, p, function (err, rows) {
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

var newTaskRH  = function (req, res, params, responseSender) {
	switch(params.query.action) {

		case 'get_actions' : //* Returns the actions available for a given device type
		{
			console.log('get_actions: deviceType=' + params.query.deviceType)
			//* Required data: for deviceType, list of actions, and for each: {actionlabel: action id}
			if (params.query.deviceType == 1 ){
				res.end(JSON.stringify({'Allumer' : 1, 'Eteindre' : 2}))
			} else if (params.query.deviceType == 2){
				res.end(JSON.stringify({'Ouvrir 100%' : 1, 'Ouvrir 50%' : 2, 'Fermer' : 3 }))
			} else if (params.query.deviceType == 2){
				res.end(JSON.stringify({'Ouvrir 100%' : 1, 'Ouvrir 50%' : 2, 'Fermer' : 3 }))
			} else {
				res.end(JSON.stringify({'On' : 1, 'Off' : 2}))
			}

			params.db.query("SELECT at.id , at.name FROM "+SQL_TABLES_DIC.at+" at WHERE at.sensor_type_id = ? ", [params.query.deviceType], function (err, rows){
			if(err) console.log("[scheduler_module reported SQL_ERROR] : "+err);
			actions = sutils.generate_json_get_actiones_by_device_type(rows)
			})
			break
		}

		case 'get_event_types' : //* Returns the events available for a given sensor type
		{
			var data = {}
			//* Required data: for sourceType, list of events, and for each: {evtlabel: evtid}
			if (params.query.sourceType == '2' ){
				data = {
					  'Passe le seuil ' : 1
				}
			} else if (params.query.sourceType == 3 ){
				data = {
					  'Activation' : 11
					, 'Désactivation' : 12
				}
			}
			res.end(JSON.stringify(data))
			break
		}

		case 'get_event_conditions' : 
			// TODO: 
			var data = {}
			if (params.query.evtType && params.query.evtType < 10 ) {
				data = {
					  'TODO' : 1
					, 'Passe le seuil en montant' : 1
					, 'Passe le seuil en descendant' : 1 // the ids are equal
					, 'pony' : 11
					, 'unicorn' : 12
					, 'narwhal' : 13
				}
			}
			console.log(data)
			res.end(JSON.stringify(data))
			break

		case 'get_condition_types' : //* Returns the condition types for a given event type or sensor type
		{
			var data = {}
			//* Required data: for evtType (resp. sensorType, list of events, and for each: {evtlabel: evtid}
			if (params.query.evtType && params.query.evtType < 10 ) {
				data = {
					  '<' : 1
					, '>' : 2
					, 'bleh' : 11
					, 'plop' : 12
				}
			} else if (params.query.sensorType && params.query.sensorType < 10 ) {
				data = {
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
				data = { 'Seuil1' : 1, 'Seuil2' : 2}
			}
			res.end(JSON.stringify(data))
			break
		}

		case 'initCache' : //* Returns the html for a condition, preloaded with the sensors list (more?)
		{
			var data = {'conditionTemplate' : tpl.get_template_result("newDeviceTemplates.html", {
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

		default : //* Returns the devices for the action and the event
		{
			var deviceTypes = ''
			var firsttime = 1
			var sensor_type_id = -1
			var number_of_rows = 0
			/**
			 *@TODO : get the devices that receive actions and adjust the query as well!! 
			 */
			params.db.query("SELECT st.name, s.sensor_type_id, s.id, s.name AS device_name " +
							"FROM " + SQL_TABLES_DIC.st + " st " +
							"JOIN " + SQL_TABLES_DIC.s + " s ON st.id = s.sensor_type_id " +
							"WHERE s.sensor_type_id IN ( " +
							"	SELECT sensor_type_id " +
							"	FROM " + SQL_TABLES_DIC.at + " " +
							") " +
							"ORDER BY s.sensor_type_id", 
				null, 
				function (err, rows) {
					if(null != err) console.log("[scheduler_module reported SQL_ERROR] : "+err);
					
					deviceTypes = sutils.generate_json_devices_list_from_sql_rows(rows)

					var data = tpl.get_template_result("new_task.html", { 
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

					params.fileUrl = 'new_task.html'
					responseSender(req, res, params, data)			
				})
			break
		}
	}
}



exports.schedulerRequestHandler = schedulerRH
exports.newTaskRequestHandler = newTaskRH

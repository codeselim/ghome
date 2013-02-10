"use strict"

// var fs = require('fs')
var tpl = require('./template_engine')
var t = require('./shared_data').get_shared_data('SQL_TABLES')

var repeatQuery = function(query, parameters, callbackparam, successcallback, errorcallback) {
	var errorHappened = false
	var nbqueries = parameters.length

	var sync_queries = function(err){
		if (err) {
			nbqueries-- 
		} else {
			nbqueries = 9999
			callbackparam.err = err
			if (!errorHappened) {
				errorHappened = true
				errorcallback(callbackparam)
			}
		}
		if (nbqueries = 0) {
			successcallback(callbackparam)
		}
	}

	//* If the query object is an array, we run each query. Else, the one query will be used repeatedly.
	if (Object.prototype.toString.call(query) === '[object Array]') {
		if (nbqueries != query.length) {
			console.log('The query and parameter arrays don\'t have the same length')
			errorcallback(callbackparam)
		} else {
			for (var i=0; i < parameters.length; i++) {
				if (!errorHappened) {
					params.db.insert_query(q[i], p[i], function (err) {
						sync_queries(err)
					})
				}
			}
		}
	} else {	
		for (var p in parameters) {
			if (!errorHappened) {
				params.db.insert_query(query, p, function (err) {
					sync_queries(err)
				})
			}
		}
	}
}


var submit = function(req, res, params, newMode) {
	var submitSuccess = function(callbackparam) {
		callbackparam.res.end(JSON.stringify({'success': true, 'msg' : 'Le nouvel équipement a été ajouté avec succès.'}))
	}

	var submitError = function(callbackparam) {
		callbackparam.res.end(JSON.stringify({'msg': JSON.stringify(callbackparam.err), 'success': false}))
	}


	//* Function Start
	console.log(params.query)
	if (Object.prototype.toString.call(params.query.deviceTypes) != '[object Array]' || params.query.deviceTypes.length <= 1) {
		res.end(JSON.stringify({'msg': 'Le seuil doit être lié à au moins un type de capteur', 'success': false}))
	} else {
		var p,q
		// if (newMode) {
			q = "INSERT INTO `" + t['th'] + "` (id, name, value) VALUES (NULL, ?, ?)"
			p = [params.query.name, params.query.value]
		// } else {
		// 	q = "UPDATE `" + t['th'] + "` SET name=?, value=? WHERE id=?"
		// 	p = [params.query.name, params.query.value, params.query.id]
		// }


		params.db.insert_query(q, p, function (err) {
			if (null == err) {
				//* Preparing the queries
				var thst = []
				thst.length = params.query.deviceTypes.length
				for (var i = 0; i < thst.length; i++) {
					thst[i] = [this.lastID, dt.stid]
				}
				console.log("Threshold inserted at index "+ this.lastID)
				repeatQuery("INSERT INTO `" + t['thst'] + "` (threshold_id, sensor_type_id) VALUES (?, ?)",
					thst, submitSuccess, submitError, {res:res})

			} else {
				console.error("threshold_module: Error when inserting the new threshold.", q, p, zerr)
				submitError({err: err, res: res})
				// res.end(JSON.stringify({'msg': JSON.stringify(err), 'success': false}))
			}
		})
	}
}

var editRH = function (req, res, params, responseSender) {

	var data = {}
	switch (params.query.action) {
		case 'submit_new':
			submit(req, res, params, true)
			break

		case 'submit_edit':
			var q = "UPDATE `" + t['th'] + "` SET name=?, value=? WHERE id=?"
			var p = [params.query.name, params.query.value, params.query.id]
			params.db.update_query(q, p, function (err) {
				if (err == null) {
					callbackparam.res.end(JSON.stringify({'success': true, 'msg' : 'Le nouvel équipement a été modifié avec succès.'}))
				} else {
					callbackparam.res.end(JSON.stringify({'msg': JSON.stringify(callbackparam.err), 'success': false}))
				}
			})
			break

		case 'edit':
			// break
			// Pareil que new sauf vérif id seuil

		case 'new':
			params.fileUrl = 'threshold.html'
			// liste types de capteurs
			data = {
				  'threshold' : {'id':1, 'label': 'Seuil1', 'value': 1234}
				//, 'sensors' : [{'id':1, 'label': 'sensor1'}, {'id':2, 'label': 'sensor2', 'selected':true}]
			}
			params.db.select_query('SELECT sensors.id AS id, events_launchers_view.name '+
				' AS sensorName FROM events_launchers_view JOIN sensors_types  ON '+
				'events_launchers_view.sensor_type_id = sensors_types.id JOIN sensors ON '+
				'events_launchers_view.hardware_id = sensors.hardware_id WHERE thresholdable = 1', [], function (err, rows) {
				data.devices = rows
				responseSender(req, res, params, tpl.get_template_result("threshold.html", data))
			})
		
			break
		

		default:
		// responseSender(req, res, params, data)var data = tpl.get_template_result("threshold.html", {
		// 	'thresholds' : [{'id':1, 'label':'seuil1', 'value': 1},{'id':2, 'label':'seuil2', 'value': 2}]
		// })
			params.error404 = true
			responseSender(req, res, params, null)
			break
	}
}


var listRH  = function (req, res, params, responseSender) {
	params.db.select_query("SELECT id, thresholdName, value FROM thresholds", [], function(err, rows) {
		var data = tpl.get_template_result("threshold_list.html", {
		//liste des seuils
		'thresholds' : rows
	})
	params.fileUrl = 'threshold_list.html'
	responseSender(req, res, params, data)

	})

}


exports.thresholdListRequestHandler = listRH
exports.thresholdRequestHandler = editRH

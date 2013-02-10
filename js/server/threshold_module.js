"use strict"

// var fs = require('fs')
var tpl = require('./template_engine')
var t = require('./shared_data').get_shared_data('SQL_TABLES')

var repeatQuery = function(db, query, parameters, callbackparam, successcallback, errorcallback) {
	var errorHappened = false
	var nbqueries = parameters.length

	var sync_queries = function(err){
		console.log(nbqueries)
		if (err == null) {
			nbqueries-- 
		} else {
			nbqueries = 9999
			callbackparam.err = err
			if (!errorHappened) {
				errorHappened = true
				errorcallback(callbackparam)
			}
		}
		if (nbqueries == 0) {
			successcallback(callbackparam)
		}
	}

	console.log('Parameters', parameters)
	console.log('Query', query)
	//* If the query object is an array, we run each query. Else, the one query will be used repeatedly.
	if (Object.prototype.toString.call(query) === '[object Array]') {
		if (nbqueries != query.length) {
			console.log('The query and parameter arrays don\'t have the same length')
			errorcallback(callbackparam)
		} else {
			for (var i=0; i < parameters.length; i++) {
				if (!errorHappened) {
					db.insert_query(query[i], parameters[i], function (err) {
						sync_queries(err)
					})
				}
			}
		}
	} else {	
		for (var i in parameters) {
			if (!errorHappened) {
				db.insert_query(query, parameters[i], function (err) {
					sync_queries(err)
				})
			}
		}
	}
}


var submit = function(req, res, params, newMode) {
	var submitSuccess = function(callbackparam) {
		console.log('success!')
		callbackparam.res.end(JSON.stringify({'success': true, 'msg' : 'Le nouvel équipement a été ajouté avec succès.'}))
	}

	var submitError = function(callbackparam) {
		callbackparam.res.end(JSON.stringify({'msg': JSON.stringify(callbackparam.err), 'success': false}))
	}

	//* Function Start
	console.log(params.query)
	console.log(params.query.deviceTypes)
	if (!params.query.deviceTypes && !params.query['deviceTypes[]']) {
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
		var dtArray
		if (params.query.deviceTypes) {
			dtArray = [params.query.deviceTypes]
		} else if (params.query['deviceTypes[]']) {
			dtArray = params.query['deviceTypes[]']
		}

		params.db.insert_query(q, p, function (err) {
			if (null == err) {
				//* Preparing the queries
				var thst = []
				thst.length = dtArray.length
				for (var i = 0; i < thst.length; i++) {
					thst[i] = [this.lastID, dtArray[i]]
				}
				console.log(thst)
				console.log("Threshold inserted at index "+ this.lastID)
				repeatQuery(params.db, "INSERT INTO `" + t['thst'] + "` (threshold_id, sensor_type_id) VALUES (?, ?)",
					thst, {res:res}, submitSuccess, submitError)

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
		params.fileUrl = 'threshold.html'
			// break
			// Pareil que new sauf vérif id seuil
			data = {
				  'threshold' : {'id':1, 'thresholdName': 'Seuil1', 'value': 1234}
				}
			params.db.select_query("SELECT sensor_type_id AS id, st.name AS sensorType"+
				" FROM "+t['thst']+" JOIN "+t['st']+" AS st ON sensor_type_id = id WHERE threshold_id = ?", [params.query.id], function(err, rows) {
					for(var r in rows) {
						rows[r].selected = true
					}
					data.sensors = rows
					responseSender(req, res, params, tpl.get_template_result("threshold.html", data))
				})

		case 'new':
			params.fileUrl = 'threshold.html'
			// liste types de capteurs
			data = {
				  'threshold' : {'id':1, 'thresholdName': 'Seuil1', 'value': 1234}
				//, 'sensors' : [{'id':1, 'label': 'sensor1'}, {'id':2, 'label': 'sensor2', 'selected':true}]
			}
			params.db.select_query("SELECT DISTINCT sensor_type_id AS id, st.name AS deviceType "+
				"FROM " +t['elv']+" AS elv JOIN "+t['st']+" AS st ON "+
				"elv.sensor_type_id = st.id "+
				"WHERE thresholdable = 1 ORDER BY deviceType", [], function (err, rows) {
				data.device_types = rows
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
	params.db.select_query("SELECT id, name AS thresholdName, value FROM thresholds", [], function(err, rows) {
		var data = tpl.get_template_result("threshold_list.html", {
		//liste des seuils
		  'thresholds' : rows
		, 'msg' : params.query.msg
	})
	params.fileUrl = 'threshold_list.html'
	responseSender(req, res, params, data)

	})

}


exports.thresholdListRequestHandler = listRH
exports.thresholdRequestHandler = editRH

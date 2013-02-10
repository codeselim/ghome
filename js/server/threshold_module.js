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

var diff = function(referenceArray, newArray) {
	// @TODO debug
	//* Diff between the current entries and the submitted ones
	console.log('=========================')
	console.log('ref:',referenceArray)
	console.log('-------------------------')
	console.log('new:',newArray)
	console.log('=========================')

	var added = []
	var index

	for (var i = 0; i < newArray.length; i++) {
		console.log('looking for value: ', newArray[i])
		index = referenceArray.indexOf(newArray[i])
		console.log('index:', index)
		if (index == -1) { // Not found, the value has been added
			added.push(newArray[i])
		} else {
			referenceArray.splice(index, 1) //* We remove the item from referenceArray
		}
		
	}

	console.log(JSON.stringify({'added': added, 'removed': referenceArray}))

	return {'added': added, 'removed': referenceArray}
	//* referenceArray now contains only the removed values	
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
		//* Setup
		var p,q       //* SQL Params and Query
		var dtArray   //* Device Type array
		if (params.query.deviceTypes) {
			dtArray = [params.query.deviceTypes]
		} else if (params.query['deviceTypes[]']) {
			dtArray = params.query['deviceTypes[]']
		}
		var thst = [] //* Contains the threshold id and the sensor type id, for the thst queries


		if (newMode) { // Creation
			q = "INSERT INTO `" + t['th'] + "` (id, name, value) VALUES (NULL, ?, ?)"
			p = [params.query.name, params.query.value]

			params.db.insert_query(q, p, function (err) {
				if (null == err) {
					//* Preparing the queries
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
				}
			})


		} else { // Edition
			q = "UPDATE `" + t['th'] + "` SET name=?, value=? WHERE id=?"
			p = [params.query.name, params.query.value, params.query.id]

			params.db.update_query(q, p, function (err) {
				if (null == err) {
					//* Preparing the thst queries

					//* First, retrive the current entries
					params.db.select_query("SELECT sensor_type_id FROM `" +t['thst']+ "` WHERE threshold_id=?", params.query.id, function(err, rows) {
						if (err != null) submitError({err: err, res: res})
						else { // Query success
							//* Removing the column name
							var cleanRows = []
							cleanRows.length = rows.length
							for (var i = 0; i < rows.length; i++) {
								cleanRows[i] = rows[i].sensor_type_id
							}

							//* Finding the added and removed elements
							var diffRes = diff(cleanRows, dtArray )

							thst.length = diffRes.added.length + diffRes.removed.length
							q = []
							q.length = thst.length
							var i,j=0

							var insert_query = "INSERT INTO `" + t['thst'] + "` (threshold_id, sensor_type_id) VALUES (?, ?)"
							var delete_query = "DELETE FROM `" + t['thst'] + "` WHERE threshold_id = ? AND sensor_type_id = ?"
							for (var i = 0; i < diffRes.removed.length; i++) {
								thst[j++] = [params.query.id, diffRes.removed[i]]
								q[j++] = delete_query
							}
							for (var i = 0; i < diffRes.added.length; i++) {
								thst[j++] = [params.query.id, diffRes.added[i]]
								q[j++] = insert_query
							}
							//* Diff between the current entries and the submitted ones
							console.log('== thst =================')
							console.log(thst)
							console.log('=========================')

							//* Run the queries
							repeatQuery(params.db, q,	thst, {res:res}, submitSuccess, submitError)
						}
					})
				} else {
					console.error("threshold_module: Error when editing threshold.", q, p, zerr)
					submitError({err: err, res: res})
				}
			})
		}

	}
}

var editRH = function (req, res, params, responseSender) {
	console.log("QUERY : "+params.query)
	var data = {}
	switch (params.query.action) {

		case 'submit_new':
			submit(req, res, params, true)
			break

		case 'submit_edit':
			submit(req, res, params, false)
			console.log(params.query.value)
			var q = "UPDATE `" + t['th'] + "` SET name=?, value=? WHERE id=?"
			var p = [params.query.name, params.query.value, params.query.id]
			params.db.update_query(q, p, function (err) {
				if (err == null) {
					res.end(JSON.stringify({'success': true, 'msg' : 'Le nouvel équipement a été modifié avec succès.'}))
				} else {
					res.end(JSON.stringify({'msg': JSON.stringify(callbackparam.err), 'success': false}))
				}
			})
			break

			case 'edit':
			params.fileUrl = 'threshold.html'
			// break
			// Pareil que new sauf vérif id seuil
			//data = {
			//	  'threshold' : {'id':1, 'thresholdName': 'Seuil1', 'value': 1234}
			//	}
			data = {}
			data.device_types = []
			params.db.select_query("SELECT id, name AS thresholdName, value FROM "+t['th']+
								" WHERE id = ?", [params.query.id], function(err, rows) {
					data.threshold = rows[0]

					params.db.select_query("SELECT st.id, st.name AS deviceType"+
								" FROM "+t['thst']+" JOIN "+t['st']+" AS st ON sensor_type_id = st.id WHERE threshold_id = ?", 
								params.query.id, function(err, rows) {
						console.log(data.device_types)
						for(var r in rows) {
							rows[r].selected = true
							data.device_types.push(rows[r])
						}

						//data.device_types = rows
						params.db.select_query("SELECT st.id, st.name AS deviceType FROM "+t['st']+" AS st WHERE id NOT IN(SELECT st.id"+
										" FROM "+t['thst']+" JOIN "+t['st']+" AS st ON sensor_type_id = id WHERE threshold_id = ?) AND thresholdable = 1", 
										[params.query.id], function(err, rows) {
							for (var r in rows) { 
								data.device_types.push(rows[r]) 
							}
							responseSender(req, res, params, tpl.get_template_result("threshold.html", data))
						})
					})
				})
			break

		case 'new':
		data = {}
		params.fileUrl = 'threshold.html'
			// liste types de capteurs
			data = {
				'threshold' : {'id': null, 'thresholdName': '', 'value': null }
				
			}
			params.db.select_query("SELECT DISTINCT sensor_type_id AS id, st.name AS deviceType "+
				"FROM " +t['elv']+" AS elv JOIN "+t['st']+" AS st ON "+
				"elv.sensor_type_id = st.id "+
				"WHERE thresholdable = 1 ORDER BY deviceType", [], function (err, rows) {
					data.device_types = rows
					responseSender(req, res, params, tpl.get_template_result("threshold.html", data))
				})

			break

		case 'check_task':
		//TODO : 
		//vérifier si le type de capteur est déjà associé au seuil
		//si oui -> vérifier si un capteur de type sensorType associé à un seuil d'id id est associé
		//à une tache
		  //si oui -> renvoyer success : false
		  //si non -> renvoyer success : true
		//si non -> renvoyer success : true

		res.end(JSON.stringify({'success': true}))
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
	params.db.select_query("SELECT id, name AS thresholdName, value FROM "+t['th'], [], function(err, rows) {
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

"use strict"

// var fs = require('fs')
var tpl = require('./template_engine')
var shared = require('./shared_data')
var tables = shared.get_shared_data('SQL_TABLES')

var editRH = function (req, res, params, responseSender) {
	var data = {}
	switch (params.query.action) {
		case 'submit_new':

			// break

		case 'submit_edit':
			res.end(JSON.stringify({'success': false, 'msg': JSON.stringify(params.query)}))
			break

		case 'edit':
		params.fileUrl = 'threshold.html'
			// break
			// Pareil que new sauf vérif id seuil
			data = {
				  'threshold' : {'id':1, 'label': 'Seuil1', 'value': 1234}
				}
			params.db.select_query("SELECT sensor_type_id AS id, st.name AS sensorType"+
				" FROM "+tables['thst']+" JOIN "+tables['st']+" AS st ON sensor_type_id = id WHERE threshold_id = ?", [params.query.id], function(err, rows) {
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
				  'threshold' : {'id':1, 'label': 'Seuil1', 'value': 1234}
				//, 'sensors' : [{'id':1, 'label': 'sensor1'}, {'id':2, 'label': 'sensor2', 'selected':true}]
			}
			params.db.select_query("SELECT DISTINCT sensor_type_id AS id, st.name AS sensorType "+
				"FROM " +tables['elv']+" AS elv JOIN "+tables['st']+" AS st ON "+
				"elv.sensor_type_id = st.id "+
				"WHERE thresholdable = 1 ORDER BY sensorType", [], function (err, rows) {
				data.sensors = rows
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
	})
	params.fileUrl = 'threshold_list.html'
	responseSender(req, res, params, data)

	})

}


exports.thresholdListRequestHandler = listRH
exports.thresholdRequestHandler = editRH

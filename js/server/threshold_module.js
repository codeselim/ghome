"use strict"

// var fs = require('fs')
var tpl = require('./template_engine')



var editRH = function (req, res, params, responseSender) {
	var data = {}
	switch (params.query.action) {
		case 'submit_new':

			// break

		case 'submit_edit':
			res.end(JSON.stringify({'success': false, 'msg': JSON.stringify(params.query)}))
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
			params.db.select_query("SELECT sensors.id AS id, events_launchers_view.name "+
				" AS sensorName FROM events_launchers_view JOIN sensors_types  ON "+
				"events_launchers_view.sensor_type_id = sensors_types.id JOIN sensors ON "+
				"events_launchers_view.hardware_id = sensors.hardware_id WHERE thresholdable = 1", [], function (err, rows) {
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

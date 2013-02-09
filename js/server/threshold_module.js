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

		case 'new':
			params.fileUrl = 'threshold.html'
			data = {
				  'threshold' : {'id':1, 'label': 'Seuil1', 'value': 1234}
				, 'sensors' : [{'id':1, 'label': 'sensor1'}, {'id':2, 'label': 'sensor2', 'selected':true}]
			}
			responseSender(req, res, params, tpl.get_template_result("threshold.html", data))
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
	var data = tpl.get_template_result("threshold_list.html", {
		'thresholds' : [{'id':1, 'label':'seuil1', 'value': 1},{'id':2, 'label':'seuil2', 'value': 2}]
	})
	params.fileUrl = 'threshold_list.html'
	responseSender(req, res, params, data)
}


exports.thresholdListRequestHandler = listRH
exports.thresholdRequestHandler = editRH

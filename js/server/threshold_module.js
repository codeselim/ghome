"use strict"

// var fs = require('fs')
var tpl = require('./template_engine')


var editRH = function (req, res, params, responseSender) {
	switch (params.query.action) {
		case 'submit_new':

			// break

		case 'submit_edit':
		// break

		case 'new':
			// break
		
		case 'edit':
			// break	

		default:
		// responseSender(req, res, params, data)var data = tpl.get_template_result("threshold.html", {
		// 	'thresholds' : [{'id':1, 'label':'seuil1', 'value': 1},{'id':2, 'label':'seuil2', 'value': 2}]
		// })
			params.fileUrl = 'threshold.html'
			responseSender(req, res, params, tpl.get_template_result("threshold.html", {}))
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

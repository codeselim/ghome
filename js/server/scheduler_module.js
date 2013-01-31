// var fs = require('fs')
var tpl = require('./template_engine')
// var ss = require('./sensors_server')


/**
 * Required Data:
 * 	Device list
 * 	Device type to action list => TODO table: id device type | id evt/Action | frame data
 * 	Device type to event list => TODO table: id device type | id evt/Action | frame data
 * 	Supported event types list
 */



var schedulerRH  = function (req, res, params, responseSender) {
	var data = tpl.get_template_result("scheduler.html", {})
	params.fileUrl = 'scheduler.html'
	responseSender(req, res, params, data)
}

var newTaskRH  = function (req, res, params, responseSender) {
	switch(params.query.action) {
		default :
		{
			var data = tpl.get_template_result("new_task.html", {
				  'devices' : [{'label' : 'Prise', 'value' : 1, 'type' : 1}]
				, 'triggers': [{'label' : 'Trigger1', 'value': '1'}]
			})
			params.fileUrl = 'new_task.html'
			responseSender(req, res, params, data)			
			break
		}

		case 'get_options' :
			break;

		case 'get_trigger_div' :
		{
			var data = tpl.get_template_result("triggerDivs.html", {
				  'template1' : {
				  	'sensor_types' : {'label' : 'Prise', 'value' : 1}
				  }
			})
			params.fileUrl = 'triggerDivs.html'
			responseSender(req, res, params, data)			
			break;
		}
	}
}



exports.schedulerRequestHandler = schedulerRH
exports.newTaskRequestHandler = newTaskRH

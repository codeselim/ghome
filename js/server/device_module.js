var fs = require('fs')
var tpl = require('./template_engine')
var ss = require('./sensors_server')
var off = true

//* Only used to test the device testing methods
var nbrq = 0

var newDeviceRH = function (req, res, params, responseSender) {
	//* Loads required data and sends the filled template
	var initNewDevicePage = function() {
		var data = tpl.get_template_result("new_device.html", {
			'devices' : [
				  {'value': 1, 'label': 'Prise'}
				, {'value': 2, 'label': 'Thermomètre'}
			]
		})
		params.fileUrl = 'new_device.html'
		responseSender(req, res, params, data)
	}

	var actions = {
		'default' : initNewDevicePage,

		//* Test functions . return 'ok' after 3 requests
		'teststart' : function() {
			//* Should check the device type and answer whether or not polling should be done.
			//* Different devices would have different tests (e.g. switch on a plug, poll for the temperature, etc.)
			console.log('teststart: id=' + params.query.deviceId + ', type=' + params.query.deviceType)
			nbrq = 0
			res.end(JSON.stringify({'status': 'ok'}))
		},

		'testend' : function() {
			console.log('testend: id=' + params.query.deviceId + ', type=' + params.query.deviceType)
			res.end(JSON.stringify({'status': 'ok'}))
		},

		'testpoll' : function() {
			console.log('testpoll: id=' + params.query.deviceId + ', type=' + params.query.deviceType)
			console.log('nbrq = ' + nbrq)
			if (++nbrq >= 3) {
				res.end(JSON.stringify({'status': 'ok', 'events' : []}))
			} else {
				res.end(JSON.stringify({'status': 'err'}))
			}
		},
		//* Test functions end

		'test' : function () {
			// setTimeout (function(){
			// 	res.end(JSON.stringify({'test': 'test'}))
			// }, 2000)
			if (off) {
				ss.sendToSensor(params.query.deviceId, ss.PLUG_SWITCH_ON_FRAME)
				res.end(JSON.stringify({msg: "Test sent ON to plug"}))
				off = !off;
			} else {
				ss.sendToSensor(params.query.deviceId, ss.PLUG_SWITCH_OFF_FRAME)
				res.end(JSON.stringify({msg: "Test sent OFF to plug"}))
				off = !off;
			}
		},

		'submit': function() {
			console.log('TODO: save the new device')
			initNewDevicePage()
		}	
	}

	if ( !params.query.action || !(typeof actions[params.query.action] == 'function')) {
		params.query.action = 'default'
	}
	actions[params.query.action]()
}

var deviceManagementRH  = function (req, res, params, responseSender) {
	var data = tpl.get_template_result("device_management.html", {
		'device_types' : [
			  {'name' : 'Prises', 'devices' : [
					  {'id': 'p1', 'label': 'Prise1'}
					, {'id': 'p2', 'label': 'Prise2'}
			  ]}
			, {'name' : 'Capteurs de température', 'devices' : [
					  {'id': 'ct1', 'label': 'Temp1'}
					, {'id': 'ct2', 'label': 'Temp2'}
			  ]}
		  , {'name' : 'Interrupteurs', 'devices' : [
				  {'id': 'i1', 'label': 'Interrupteur1'}
				, {'id': 'i2', 'label': 'Interrupteur2'}
		  ]}
		]
	})
	params.fileUrl = 'device_management.html'
	responseSender(req, res, params, data)
}



exports.newDeviceRequestHandler = newDeviceRH
exports.devMgmtRequestHandler = deviceManagementRH

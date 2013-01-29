var fs = require('fs')
var ss = require('./sensors_server')
var off = true

//* Only used to test the device testing methods
var nbrq = 0

var newDeviceRH = function (req, res, params, responseSender) {

	var actions = {
		'default' : function (){
			params['fileUrl'] = '../../views/new_device.html'
			responseSender(req, res, params, fs.readFileSync(params.fileUrl))
		},

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
			params['fileUrl'] = '../../views/new_device.html'
			responseSender(req, res, params, fs.readFileSync(params.fileUrl))
		}	
	}

	if ( !params.query.action || !(typeof actions[params.query.action] == 'function')) {
		params.query.action = 'default'
	}
	actions[params.query.action]()
}


exports.newDeviceRequestHandler = newDeviceRH
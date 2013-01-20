var fs = require('fs')

var newDeviceRH = function (req, res, params, responseSender) {
	var actions = {
		'default' : function (){
			params['fileUrl'] = '../../views/new_device.html'
			responseSender(req, res, params, fs.readFileSync(params.fileUrl))
		},

		'test' : function () {
			setTimeout (function(){
				res.end(JSON.stringify({'test': 'test'}))	
			}, 2000)
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
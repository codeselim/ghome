var fs        = require('fs')

var newDeviceRH = function (req, res, params, responseSender) {
	console.log(params)
	var actions = {
		'default' : function (){
			params['fileUrl'] = '../../views/new_device.html'
			responseSender(req, res, params, fs.readFileSync(params.fileUrl))
		},

		'test' : function () {
			setTimeout (function(){
			res.end(JSON.stringify({'test': 'test'}))	
				
			}, 2000)
		}
	}

	if (!params.query.action) {
		params.query.action = 'default'
	}
	
	actions[params.query.action]()
}


exports.newDeviceRequestHandler = newDeviceRH
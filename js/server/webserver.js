var http = require('http')
var fs   = require('fs')
var mime = require('mime')
var tpl = require('./template_engine')
var shared = require('./shared_data')
var get_shared_data = shared.get_shared_data
var set_shared_data = shared.set_shared_data

var webdir = '../..'
/**
 * ==== Templates data structure ==== 
 * How to fill this data structure:
 * {
 *  'module_name' : {'file': 'name_of_the_template_or_view_file', 'relatedData': function_that_will_return_the_data_object}
 *  'module_name2' : {'file': 'another_filename'} // no related data for this module 
 * }
 */
var requestHandlers = {
	'home' : homeReqHandler
	, 'device_management' : dmReqHandler
	, 'app' : appReqHandler
	, 'default' : defaultReqHandler
}

var SSEres = null


/**  This function returns the CSS temperature color to be applied to a given
 * temperature depending on its value
 * For instance, -2 would be blue, 25 would be green, 32 would be red...
 * @param{int} temperature_value The temperature value (signed integer)
 * @return{string} Color name to be used in the CSS class ("{COLOR}-temp")
 */
var temp2color = function(temperature_value) {
	var color = ''
	if (temperature_value >= 32) {
		color = 'red1'
	} else if (temperature_value >= 25) {
		color = 'green3'
	} else if (temperature_value >= 19) {
		color = 'green2'
	} else if (temperature_value >= 10) {
		color = 'green1'
	} else if (temperature_value >= 5) {
		color = 'blue1'
	} else if (temperature_value >= 0) {
		color = 'blue2'
	} else if (temperature_value >= -5) {
		color = 'blue3'
	} else if (temperature_value <= -10) {
		color = 'blue4'
	}
	return color
}


function appReqHandler(req, res, params, response_sender) {
	console.log("appRH")
	var templateData = {
	}
	var data = tpl.get_template_result("app.html", templateData)
	params['fileUrl'] = 'app.html'
	response_sender(req, res, params, data)
}



function dmReqHandler(req, res, params, response_sender) {

	var templateData = {
	}
	var data = tpl.get_template_result("device_management.html", templateData)
	params['fileUrl'] = 'device_management.html'
	response_sender(req, res, params, data)
}



function homeReqHandler(req, res, params, response_sender) {
	console.log("homeReqHandler")
	var templateData = {
		'IN_TEMP'		: get_shared_data('IN_TEMP')
		, 'OUT_TEMP'	   : get_shared_data('OUT_TEMP')
		, 'COLOR_TEMP_IN'  : temp2color(get_shared_data('IN_TEMP'))
		, 'COLOR_TEMP_OUT' : temp2color(get_shared_data('OUT_TEMP'))
	}
	var data = tpl.get_template_result("home.html", templateData)
	console.log(params['pathname'])
	params['fileUrl'] = 'home.html'
	response_sender(req, res, params, data)
}

function SSEReqHandler(req, res, params, response_sender) {
	specialURL = true
	console.log('New SSE connection')
	SSEres = res
	SSEres.writeHead(200, {
		'Content-Type': 'text/event-stream',
		'Cache-Control': 'no-cache',
		'Connection': 'keep-alive'
	})
}

/**
 * responseSender is going to be the default callback of every requestHandler
 * It sets the HTTP status to OK 200 and sends the content to be returned to the browser client
 * using the default mime type found using the file extension
 * IF YOU WANT TO WRITE YOUR OWN Content-Type HEADER THEN JUST DON'T CALL THE CALLBACK...
 * @param{http.ServerRequest} original request from the browser client
 * @param{http.ServerResponse} response object to send to the browser client
 * @param{???} parameters defined by the webserver
 * @param{string or Buffer} data to be send to the browser client using res.end()
 * @return{undefined} undefined
*/
function responseSender(req, res, params, data) {
	res.writeHead(200, {'Content-Type': mime.lookup(params.fileUrl)})
	res.end(data)
}

/** @TODO to be documented */
function defaultReqHandler(req, res, params, response_sender) {
	console.log("defaultReqHandler")
	fs.readFile(webdir + params['pathname'], null, function (err, data) {
		if (err) {
			console.error(err)
		}
		console.log(params['pathname'])
		params['fileUrl'] = params['pathname']
		responseSender(req, res, params, data)
	})
}


function start (db, port) {
	console.log('Starting webserver')
	http.createServer(function (req, res) {
		//* Note : req is an instance of http.ServerRequest and res is an instance of http.ServerResponse
		try {
			var specialURL = false
			var urlParams = require('url').parse(req.url, true)
			var fileUrl
			
			if (!urlParams.query.module) {
				if (urlParams['pathname'] == '/' || urlParams['pathname'].split('.').pop() == 'html') {
					urlParams.query.module = 'home'
				} else {
					urlParams.query.module = 'default'
				}
			}
			req.addListener("end", function() {
				if(urlParams.query.module in requestHandlers) {
					requestHandlers[urlParams.query.module](req, res, urlParams, responseSender)
				}
				else {
		  	// 404 
			//@TODO 404 error
		}
	});




		} catch(e) {
			console.log(e)
		}
	}).listen(port)
}

function frameRecieved(frame) {
	if (SSEres) {
		SSEres.write('data: ' + JSON.stringify(frame) + '\n\n')
	} else {
		console.log('There is no GUI SSE opened connection')
	}
}

exports.start = start
exports.frameRecieved = frameRecieved
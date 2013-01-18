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
var modules = {
	  'home'              : {'file': 'home.html', 'relatedData' : homeModuleData}
	, 'device_management' : {'file': 'device_management.html'}
	, 'app'               : {'file': 'app.html'}
	, 'new_device'        : {'file': 'new_device.html'}
}
var SSEres = null

/** Example of function that returns the "data object" **/
function homeModuleData() {
	var templateData = {
		  'IN_TEMP'        : get_shared_data('IN_TEMP')
		, 'OUT_TEMP'       : get_shared_data('OUT_TEMP')
		, 'COLOR_TEMP_IN'  : temp2color(get_shared_data('IN_TEMP'))
		, 'COLOR_TEMP_OUT' : temp2color(get_shared_data('OUT_TEMP'))
	}
	return templateData
}


function start (db) {
	console.log('Starting webserver')
	var parseParams = function (url) {
		var urlParams = {}
		var match,
				pl     = /\+/g,  // Regex for replacing addition symbol with a space
				search = /([^&=]+)=?([^&]*)/g,
				decode = function (s) { return decodeURIComponent(s.replace(pl, " ")) },
				query  = url
				console.log('query: ' + query)

				while (match = search.exec(query))
					urlParams[decode(match[1])] = decode(match[2])
				return urlParams
			}

			http.createServer(function (req, res) {
		//* Note : req is an instance of http.ServerRequest and res is an instance of http.ServerResponse
		try {
			var url = req.url.split('?')
			var specialURL = false
			var urlParams = parseParams(url[1])
			var fileUrl, templateData

			if (!urlParams.module) {
				if (url == '/' || url[0].split('.').pop() == 'html') {
					urlParams.module = 'home'
				} else {
					urlParams.module = 'nonHTML'
				}
			}

			var template_data = {} // Will contain the data to be dynamically injected inside the templates files
			var nonHTML = false
			switch (urlParams.module) {
				case 'sse':
				specialURL = true
				console.log('New SSE connection')
				SSEres = res
				SSEres.writeHead(200, {
					'Content-Type': 'text/event-stream',
					'Cache-Control': 'no-cache',
					'Connection': 'keep-alive'
				})
				break

				case 'nonHTML':
					fileUrl = req.url.replace(/([^\?]+)\?(.*)/, '$1')
					fileUrl = webdir + fileUrl
					nonHTML = true
					break

				default:
					if (urlParams.module in modules) {// Module found, returns its view
						fileUrl = modules[urlParams.module].file
						if (modules[urlParams.module].relatedData) {
							templateData = modules[urlParams.module].relatedData()
						} else {
							templateData = {}
						}
						
					} else {// Module was not found
						console.error('module not found')
						// @TODO error page
					}
					break 
			}

			if (!specialURL && fileUrl) {
				console.log('Asked file=' + fileUrl)
				res.writeHead(200, {'Content-Type': mime.lookup(fileUrl)})
				if (nonHTML) {
					fs.readFile(fileUrl, null, function (err, data) {
						if (err) {
							console.error(err)
						}
						res.end(data)
					})
				} else {
					res.end(tpl.get_template_result(fileUrl, templateData))
				}
			}

		} catch(e) {
			console.log(e)
		}
	}).listen(9615)
}

function frameRecieved(frame) {
	if (SSEres) {
		SSEres.write('data: ' + JSON.stringify(frame) + '\n\n')
	} else {
		console.log('There is no GUI SSE opened connection')
	}
}

/**  This function returns the CSS temperature color to be applied to a given
 * temperature depending on its value
 * For instance, -2 would be blue, 25 would be green, 32 would be red...
 * @param{int} temperature_value The temperature value (signed integer)
 * @return{string} Color name to be used in the CSS class ("{COLOR}-temp")
*/
function temp2color(temperature_value) {
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

exports.start = start
exports.frameRecieved = frameRecieved
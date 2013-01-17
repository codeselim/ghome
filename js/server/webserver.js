var http = require('http')
var fs   = require('fs')
var mime = require('mime')
var tpl = require('./template_engine')
var shared = require('./shared_data')
var get_shared_data = shared.get_shared_data
var set_shared_data = shared.set_shared_data

var webdir = '../..'
var viewsdir = '../../views/'
var URLS = {}
URLS['home'] = viewsdir + 'home.html'
URLS['device_management'] = viewsdir + 'device_management.html'
URLS['app'] = viewsdir + 'app.html'
var SSEres = null

function start (db) {
	console.log('Starting webserver')
	var parseParams = function (url) {
		var urlParams = {}
		var match,
				pl     = /\+/g,  // Regex for replacing addition symbol with a space
				search = /([^&=]+)=?([^&]*)/g,
				decode = function (s) { return decodeURIComponent(s.replace(pl, " ")) },
				query  = url
				console.log(query)

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
					urlFile = req.url.replace(/([^\?]+)\?(.*)/, '$1')
					urlFile = webdir + urlFile
					nonHTML = true
					break

				case 'home': // No break for this case, this is intended
					template_data['IN_TEMP'] = get_shared_data('IN_TEMP')
					template_data['OUT_TEMP'] = get_shared_data('OUT_TEMP')
					template_data['COLOR_TEMP_IN'] = temp2color(template_data['IN_TEMP'])
					template_data['COLOR_TEMP_OUT'] = temp2color(template_data['OUT_TEMP'])
					// no break
				default:
					if (urlParams.module in URLS) {// Module found, returns its view
						urlFile = URLS[urlParams.module]
					} else {// Module was not found
						console.error('module not found')
						// @TODO error page
					}
					break 
			}

			if (!specialURL && urlFile) {
				console.log('Asked file=' + urlFile)
				res.writeHead(200, {'Content-Type': mime.lookup(urlFile)})
				if (nonHTML) {
					fs.readFile(urlFile, 'utf-8', function (err, data) {
						if (err) {
							console.error(err)
						}
						res.end(data)
					})
				} else {
					res.end(tpl.get_template_result(urlFile, template_data))
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
	color = ''
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
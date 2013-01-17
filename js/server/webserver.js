var http = require('http')
var fs   = require('fs')
var mime = require('mime')
var tpl = require('./template_engine')

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
					template_data['IN_TEMP'] = 'POUET'
					template_data['COLOR_TEMP_IN'] = 'green1'
					template_data['COLOR_TEMP_OUT'] = 'red'
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

exports.start = start
exports.frameRecieved = frameRecieved
var http = require('http')
var fs   = require('fs')
var mime = require('mime')

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
					break

				default:
					if (-1 == URLS.indexOf(urlParams.module)) {// Module was not found
						console.error('module not found')
						// @TODO error page
					} else {// Module found, returns its view
						urlFile = URLS[urlParams.module]
					}
					break 
			}

			if (!specialURL && urlFile) {
				console.log('Asked file=' + urlFile)
				res.writeHead(200, {'Content-Type': mime.lookup(urlFile)})
				res.end(fs.readFileSync(urlFile))
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
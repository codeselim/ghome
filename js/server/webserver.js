var http = require('http')
var fs   = require('fs')
var mime = require('mime')

var webdir = '../..'
var SSEres = null

function start (db) {
	console.log('Starting webserver')

	http.createServer(function (req, res) {
		//* Note : req is an instance of http.ServerRequest and res is an instance of http.ServerResponse
		try {
			var specialURL = false
			switch (req.url) {
				case "/sse":
					specialURL = true
					console.log("New SSE connection")
					SSEres = res
					SSEres.writeHead(200, {
						'Content-Type': 'text/event-stream',
						'Cache-Control': 'no-cache',
						'Connection': 'keep-alive'
					})
					break

				case "/":
					urlFile = webdir + "/app.html"
					break

				default:
					//@TODO what does that line do exactly?
					urlFile = req.url.replace(/([^\?]+)\?(.*)/, "$1")
					urlFile = webdir + urlFile
					break 
			}

			if (!specialURL) {
				console.log("Asked file=" + urlFile)
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
		SSEres.write("data: " + JSON.stringify(frame) + '\n\n')
	} else {
		console.log('There is no opened connection')
	}
}

exports.start = start
exports.frameRecieved = frameRecieved
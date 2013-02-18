var streams = []

function requestHandler(req, res, params, response_sender) {
	// console.log('New SSE connection')
	streams.push(res)
	res.writeHead(200, {
		'Content-Type': 'text/event-stream',
		'Cache-Control': 'no-cache',
		'Connection': 'keep-alive'
	})

	res.on("error", shutdown)
	res.on("close", shutdown)
	res.on("end", shutdown)
}

//* @this the html.ServerRequest raising the error/close/end event */
function shutdown () {
	// console.log('stream shutdown')

	var index = streams.indexOf(this)
	if (index != -1) {
		streams.slice(index, 1)
	}
}

/** 
 * Sends a notification to all registered streams
 * @param (Object) data: JS Object to send (will be stringified)
 */
function sendSSE(data) {
	var i

	// console.log('to send', data)
	for (i = 0; i < streams.length; i++) {
		streams[i].write('data: ' + JSON.stringify(data) + '\n\n')
	}
	if (i == 0) {
		// console.log('There is no GUI SSE opened connection')
	}
}


exports.requestHandler = requestHandler
exports.sendSSE = sendSSE
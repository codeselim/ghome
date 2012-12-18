var http = require('http');
var fs = require('fs');

var homeTemplate = null;

URLS = []
URLS["page2"] = "/page2.html"
URLS["SSE"] = "/sse.html"

function sendSSE(req, res) {
	res.writeHead(200, {
		'Content-Type': 'text/event-stream',
		'Cache-Control': 'no-cache',
		'Connection': 'keep-alive'
	});

	var id = (new Date()).toLocaleTimeString();

  // Sends a SSE every 1 seconds on a single connection.
  var i = 0
  setInterval(function() {
  	i += 1
  	// if (i > 20) {
  	// 	clearInterval(a)
  	// }
  	console.log("Sending a new SSE")
  	constructSSE(res, id, "Message " + i);
  }
  , 1000);

  constructSSE(res, id, (new Date()).toLocaleTimeString());
}


function constructSSE(res, id, data) {
	res.write('id: ' + id + '\n');
	res.end("data: " + data + '\n\n');
}

http.createServer(function (req, res) {
	//Note : req is an instance of http.ServerRequest and res is an instance of http.ServerResponse
	try {
		urlFile = req.url.replace(/([^\?]+)\?(.*)/, "$1")
		console.log("Asked file=" + urlFile)
		if (req.url == "/") {
			res.writeHead(200, {'Content-Type': 'text/html'});
			var index = fs.readFileSync('index.html');
			answer = index
			res.end(answer);
		} else if (urlFile == URLS["page2"]) {
			res.writeHead(200, {'Content-Type': 'text/html'});
			homeTemplate = fs.readFileSync("page2.html");
			answer = homeTemplate
			res.end(answer);
		} else if (urlFile == URLS["SSE"] && (req.headers.accept && req.headers.accept == 'text/event-stream')) {
			console.log("New SSE connection")
			sendSSE(req, res)
		} else {
			answer = fs.readFileSync("." + urlFile)
			res.end(answer);
		}

		// answer += "URL=" + req.url + "\n"
		// answer += "Headers=" + JSON.stringify(req.headers, null, 2) + "\n"
		// answer += "Trailers=" + JSON.stringify(req.trailers, null, 2) + "\n"
		// answer += "httpVersion=" + req.httpVersion + "\n"
	} catch(e) {
		console.log(e);

	}
}).listen(9615);
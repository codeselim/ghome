var http = require('http');
var fs = require('fs');

var homeTemplate = null;

URLS = []
URLS["page2"] = "/page2.html"
URLS["SSE"] = "/sse.html"

function constructSSE(argument) {
	// @TODO
}

function sendSSE (argument) {
	// @TODO
}

http.createServer(function (req, res) {
	//Note : req is an instance of http.ServerRequest and res is an instance of http.ServerResponse
	res.writeHead(200, {'Content-Type': 'text/html'});
	try {
		urlFile = req.url.replace(/([^\?]+)\?(.*)/, "$1")
		console.log("Asked file=" + urlFile)
		if (req.url == "/") {
			var index = fs.readFileSync('index.html');
			answer = index
		} else if (urlFile == URLS["page2"]) {
			homeTemplate = fs.readFileSync("page2.html");
			answer = homeTemplate
		} else if (urlFile == URLS["SSE"]) {
			setInterval(function () {
				constructSSE(res, id, )
			})
		} else {
			answer = fs.readFileSync("." + urlFile)
		}
		
		// answer += "URL=" + req.url + "\n"
		// answer += "Headers=" + JSON.stringify(req.headers, null, 2) + "\n"
		// answer += "Trailers=" + JSON.stringify(req.trailers, null, 2) + "\n"
		// answer += "httpVersion=" + req.httpVersion + "\n"
		res.end(answer);
	} catch(e) {
		console.log(e);

	}
}).listen(9615);
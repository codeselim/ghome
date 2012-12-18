var http = require('http');
var fs = require('fs');
var index = fs.readFileSync('index.html');

http.createServer(function (req, res) {
	//Note : req is an instance of http.ServerRequest and res is an instance of http.ServerResponse
	res.writeHead(200, {'Content-Type': 'text/plain'});
	try {
		answer = index
		answer += "URL=" + req.url + "\n"
		answer += "Headers=" + JSON.stringify(req.headers, null, 2) + "\n"
		answer += "Trailers=" + JSON.stringify(req.trailers, null, 2) + "\n"
		answer += "httpVersion=" + req.httpVersion + "\n"
		res.end(answer);
	} catch(e) {
		console.log(e);

	}
}).listen(9615);
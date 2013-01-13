var net = require("net");
console.log("Starting Android Service server")
var server = net.createServer(function(stream) {
	stream.setTimeout(0);
	stream.setEncoding("utf8");

	stream.addListener("connect", function(){
		console.log("New server connection established.")
	});

	var buffer = ""
	stream.addListener("data", function (data) {
		console.log(new Date(), "New data packet came in:", data)
		stream.write(new Date().toString() + ": ACK\r\n")
	});
})

server.listen(5000, "192.168.0.13");
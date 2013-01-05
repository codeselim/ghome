//* Server that deals with the data from the sensors

function start (db, web_serv) {
	FRAME_SIZE = 14
	frames = []
	console.log("Starting Sensors server")
	var net = require("net");
	var server = net.createServer(function(stream) {
		// var chatter = new Chatter(stream);
		// chatters.push(chatter);

		stream.setTimeout(0);
		stream.setEncoding("utf8");

		stream.addListener("connect", function(){
			console.log("New sensors server connection established.")
		});

		var buffer = new Buffer("");
		stream.addListener("data", function (data) {
			buffer.concat([new Buffer(data)])
			while (buffer.length >= FRAME_SIZE) {//* We have at least complete frame (14 bytes)
				frames.push(buffer.slice(0, FRAME_SIZE)) //* Pushes the new "complete" frame with the other ones
				buffer = buffer.slice(FRAME_SIZE) //* Crops the current buffer 
			};
		});

		stream.addListener("end", function(){
			console.log("Closing a sensors server connection")

			stream.end();
		});
	});

	server.listen(8000);
}

exports.start = start
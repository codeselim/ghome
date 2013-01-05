//* Server that deals with the data from the sensors


var events = require('events');
var eventEmitter = new events.EventEmitter();
var SENSOR_FRAME_EVENT = "newSensorFrame"
function start (db, web_serv) {
	FRAME_SIZE = 14
	var net = require("net");
	console.log("Starting Sensors server")
	var server = net.createServer(function(stream) {

		stream.setTimeout(0);
		stream.setEncoding("utf8");

		stream.addListener("connect", function(){
			console.log("New sensors server connection established.")
		});

		var buffer = new Buffer("");
		stream.addListener("data", function (data) {
			console.log("Receiving data from sensors.")
			buffer = Buffer.concat([buffer, new Buffer(data)])
			while (buffer.length >= FRAME_SIZE) {//* We have at least complete frame (14 bytes) (beware, not the same value as string.length)
				console.log("A frame is over")
				eventEmitter.emit(SENSOR_FRAME_EVENT, buffer.slice(0, FRAME_SIZE)) //* Sends the new "complete" frame to the event handler
				buffer = buffer.slice(FRAME_SIZE) //* Crops the current buffer, we don't need the data from the previous frame anymore
			};
			console.log("Ending the sensors stream data receiver function") //* Mainly for the purpose of being able to check when the SENSOR_FRAME_EVENT handler function is executed with respect to the current function execution
		});

		stream.addListener("end", function(){
			console.log("Closing a sensors server connection")

			stream.end();
		});
	});

	server.listen(8000);
}

exports.start = start
exports.events = eventEmitter
exports.SENSOR_FRAME_EVENT = SENSOR_FRAME_EVENT
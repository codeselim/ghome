//* Server that deals with the data from the sensors


var events = require('events');
var eventEmitter = new events.EventEmitter();
var SENSOR_FRAME_EVENT = "newSensorFrame"
var FRAME_SEPARATOR = ""
function start (db, web_serv, port) {
	FRAME_SIZE = 28
	var net = require("net");
	console.log("Starting Sensors server")
	var server = net.createServer(function(stream) {

		stream.setTimeout(0);
		stream.setEncoding("utf8");

		stream.addListener("connect", function(){
			console.log("New sensors server connection established.")
		});

		var buffer = ""
		stream.addListener("data", function (data) {
			console.log("Receiving data from sensors.")
			buffer += data
			var pos = -1
			while (buffer.length >= FRAME_SIZE && -1 != (pos = buffer.indexOf(FRAME_SEPARATOR))) {//* We have found a separator, that means that the previous frame (that may be incomplete or may not) is over and a new one starts
				console.log("A frame is over")
				if (0 != pos) {//* The separator is not the first char, that means we have an unfinished / incomplete frame just before the current one. Throw it away
					//* Skip the beginning of the buffer:
					buffer = buffer.substr(pos+1, buffer.length) //* If the second parameter is >= the maximum possible length substr can return, substr just returns the maximum length possible, so who cares substracting?
					//* Once we've skipped the rubbish, we need to re-check that the frame we want to read (the one which actually provides the FRAME_SEPARATOR) is now long enough (>= FRAME_SIZE)
					//* We do that by skipping the end of the loop and thus re-doing the loop condition:
					console.log("Throwing away rubbish.")
					continue;
				}
				frame = buffer.substr(0, FRAME_SIZE) //* We know we have a complete frame (>= FRAME_SIZE and pos == 0) so just cut it off by its length
				eventEmitter.emit(SENSOR_FRAME_EVENT, frame) //* Sends the new "complete" frame to the event handler
				buffer = buffer.substr(FRAME_SIZE-1, buffer.length) //* Crops the current buffer, we don't need the data from the previous frame anymore
			};
			console.log("Ending the sensors stream data receiver function") //* Mainly for the purpose of being able to check when the SENSOR_FRAME_EVENT handler function is executed with respect to the current function execution
		});

		stream.addListener("end", function(){
			console.log("Closing a sensors server connection")

			stream.end();
		});
	});

	server.listen(port);
}

exports.start = start
exports.events = eventEmitter
exports.SENSOR_FRAME_EVENT = SENSOR_FRAME_EVENT
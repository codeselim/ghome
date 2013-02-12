"use strict"

//* Server that deals with the data from the sensors


var events = require('events');
var net = require("net");
var sensors_utils = require('./sensors')
var get_shared_data = require('./shared_data').get_shared_data
var decode = sensors_utils.decode_frame
var check_checksum = sensors_utils.check_frame_checksum
var eventEmitter = new events.EventEmitter();
var SENSOR_FRAME_EVENT = "newSensorFrame"
var FRAME_SEPARATOR = "A55A"
var FRAME_SIZE = 28
function start (db, web_serv, port, allowed_ids) {
	console.log(new Date(), "SENSSERV: Starting Sensors server")
	var server = net.createServer(function(stream) {

		stream.setTimeout(0);
		stream.setEncoding("utf8");

		stream.addListener("connect", function(){
			// console.log("SENSSERV: ", new Date(), "New sensors server connection established.")
		});

		var buffer = ""
		stream.addListener("data", function (data) {
			// console.log("SENSSERV: ", new Date(), "Receiving data from sensors.")
			buffer += data
			var pos = -1
			while (buffer.length >= FRAME_SIZE && -1 != (pos = buffer.indexOf(FRAME_SEPARATOR))) {//* We have found a separator, that means that the previous frame (that may be incomplete or may not) is over and a new one starts
				// console.log(new Date(), "A frame is over")
				// console.log(buffer)
				// console.log(buffer.indexOf(FRAME_SEPARATOR))
				// console.log("pos=", pos)
				if (0 != pos) {//* The separator is not the first char, that means we have an unfinished / incomplete frame just before the current one. Throw it away
					//* Skip the beginning of the buffer:
					buffer = buffer.substr(pos, buffer.length) //* If the second parameter is >= the maximum possible length substr can return, substr just returns the maximum length possible, so who cares substracting?
					//* Once we've skipped the rubbish, we need to re-check that the frame we want to read (the one which actually provides the FRAME_SEPARATOR) is now long enough (>= FRAME_SIZE)
					//* We do that by skipping the end of the loop and thus re-doing the loop condition:
					// console.log("Throwing away rubbish.")
					continue;
				}
				var frame = buffer.substr(0, FRAME_SIZE) //* We know we have a complete frame (>= FRAME_SIZE and pos == 0) so just cut it off by its length
				buffer = buffer.substr(FRAME_SIZE, buffer.length) //* Crops the current buffer, we don't need the data from the previous frame anymore
				var frame_data = decode(frame)
				if (-1 != allowed_ids.indexOf(frame_data.id)) {
					console.log("SENSSERV: ", "Sensor id=", frame_data.id)
					console.log("SENSSERV: ", "This sensor is one of ours && the checksum is correct.")
					if(check_checksum(frame_data, frame)) {
						// console.log("The checksum is correct ?", check_checksum(frame_data))
						eventEmitter.emit(SENSOR_FRAME_EVENT, frame_data) //* Sends the new "complete" frame to the event handler
					} else {
						console.log("SENSSERV: ", 'The checksum was not correct.')
					}
				}
			};
			// console.log("SENSSERV: ", "Ending the sensors stream data receiver function") //* Mainly for the purpose of being able to check when the SENSOR_FRAME_EVENT handler function is executed with respect to the current function execution
		});

		stream.addListener("end", function(){
			console.log("SENSSERV: ", "Closing a sensors server connection")

			stream.end();
		});
	});

	server.listen(port);
}

exports.start = start
exports.events = eventEmitter
exports.SENSOR_FRAME_EVENT = SENSOR_FRAME_EVENT
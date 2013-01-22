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
var PLUG_SWITCH_FRAME = 'A55A6B0577000000FF9F1E063072'//* Frame to be sent to toggle the swtich plug state (specific to our given switch power plug)
function start (db, web_serv, port, allowed_ids) {
	FRAME_SIZE = 28
	console.log(new Date(), "Starting Sensors server")
	var server = net.createServer(function(stream) {

		stream.setTimeout(0);
		stream.setEncoding("utf8");

		stream.addListener("connect", function(){
			console.log(new Date(), "New sensors server connection established.")
		});

		var buffer = ""
		stream.addListener("data", function (data) {
			console.log(new Date(), "Receiving data from sensors.")
			buffer += data
			var pos = -1
			while (buffer.length >= FRAME_SIZE && -1 != (pos = buffer.indexOf(FRAME_SEPARATOR))) {//* We have found a separator, that means that the previous frame (that may be incomplete or may not) is over and a new one starts
				console.log(new Date(), "A frame is over")
				console.log(buffer)
				console.log(buffer.indexOf(FRAME_SEPARATOR))
				console.log("pos=", pos)
				if (0 != pos) {//* The separator is not the first char, that means we have an unfinished / incomplete frame just before the current one. Throw it away
					//* Skip the beginning of the buffer:
					buffer = buffer.substr(pos, buffer.length) //* If the second parameter is >= the maximum possible length substr can return, substr just returns the maximum length possible, so who cares substracting?
					//* Once we've skipped the rubbish, we need to re-check that the frame we want to read (the one which actually provides the FRAME_SEPARATOR) is now long enough (>= FRAME_SIZE)
					//* We do that by skipping the end of the loop and thus re-doing the loop condition:
					console.log("Throwing away rubbish.")
					continue;
				}
				frame = buffer.substr(0, FRAME_SIZE) //* We know we have a complete frame (>= FRAME_SIZE and pos == 0) so just cut it off by its length
				buffer = buffer.substr(FRAME_SIZE-1, buffer.length) //* Crops the current buffer, we don't need the data from the previous frame anymore
				frame_data = decode(frame)
				console.log("Sensor id=", frame_data.id)
				if (-1 != allowed_ids.indexOf(frame_data.id)) {
					console.log("This sensor is one of ours && the checksum is correct.")
					if(check_checksum(frame_data, frame)) {
						// console.log("The checksum is correct ?", check_checksum(frame_data))
						eventEmitter.emit(SENSOR_FRAME_EVENT, frame_data) //* Sends the new "complete" frame to the event handler
					} else {
						console.log('The checksum was not correct.')
					}
				}
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

function send_to_sensor (sensor_id, message) {
	var sock = new net.Socket()
	sock.connect(get_shared_data('MAIN_SERVER_PORT'), get_shared_data('MAIN_SERVER_IP'), function () { 
		console.log('Connection to main server established, going to send a message for a sensor')
		sock.write(PLUG_SWITCH_FRAME, null, function () {
			console.log('Data sent to main server, disconnecting.')
			sock.close()
		})
	})
}

exports.start = start
exports.events = eventEmitter
exports.SENSOR_FRAME_EVENT = SENSOR_FRAME_EVENT
exports.PLUG_SWITCH_FRAME = PLUG_SWITCH_FRAME
exports.sendToSensor = send_to_sensor
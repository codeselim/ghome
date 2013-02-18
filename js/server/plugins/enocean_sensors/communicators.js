// var PLUG_SWITCH_ON_FRAME = 'A55A6B0555000000FF9F1E06304C'//* Frame to be sent to toggle the switch on plug state (specific to our given switch power plug)
// var PLUG_SWITCH_OFF_FRAME = 'A55A6B0577000000FF9F1E06306E'//* Frame to be sent to toggle the switch off plug state (specific to our given switch power plug)
var PLUG_SWITCH_ON_FRAME = 'A55A6B0555000000@@deviceId@@304C'//* Frame to be sent to toggle the switch on plug state (specific to our given switch power plug)
var PLUG_SWITCH_OFF_FRAME = 'A55A6B0577000000@@deviceId@@306E'//* Frame to be sent to toggle the switch off plug state (specific to our given switch power plug)
var net = require('net')
var get_shared_data = require('../../shared_data').get_shared_data
var set_shared_data = require('../../shared_data').set_shared_data
var sutils = require('../../sensors')
/** 
 *
 *
 * @param{int} tries_count : Facultative. The number of tries we already did without reaching the device. After 10 tries, we give up.
*/
function switchPlugDC (sensor_id, message, callback, tries_count) {
	if (!tries_count) {
		var tries_count = 1
	} else if (tries_count > 10) {
		console.error(new Date().toString() + "Giving up sending the message" + message + "to sensor_id " + sensor_id + " after 10 tries.")
	}
	console.log('## message:', message)

	console.log("Entering in switchPlugDC()")
	var sock = new net.Socket()
	var new_value = null
	if ("ON" == message) {
		console.log("on message to send")
		message = PLUG_SWITCH_ON_FRAME 
		new_value = true
	} else {
		message = PLUG_SWITCH_OFF_FRAME 
		new_value = false
	}

	// sensorid has to be sent as hex string
	message = message.replace(/@@deviceId@@/g,sensor_id.toString(16).toUpperCase())
	
	sock.connect(get_shared_data('MAIN_SERVER_PORT'), get_shared_data('MAIN_SERVER_IP'), function () { 
		console.log('switchPlugDC: Connection to main server established, going to send a message for a sensor', message)
		sock.write(message, null, function () {
			sock.close()
			console.log('switchPlugDC: Data sent to main server, disconnecting.')
			console.log("Exiting in switchPlugDC() callback")
		})
		// The following code was originally in the write() callback BUT. As the data is less than the kernel io buffer, it seems there a kind of a bug in nodejs and the callback s called extremely long after, not to say never
		// So just consider the data was written: 
		if (null != callback) {
			callback(5, new_value)
		};
	})

	sock.on("error", function () { 
		console.error("switchPlugDC:", new Date().toString() + "Could not send message " + message + "to sensor_id " + sensor_id + ", trying again in 10 seconds."); 
		setTimeout(function () {
			switchPlugDC(sensor_id, message, callback, tries_count+1)
		}, 10000)
	})
	console.log("Exiting in switchPlugDC() (without the callback)")
}


//* Registering them in the system
var dc = require('../../device_communicator')
dc.addDeviceCommunicator(5, switchPlugDC)

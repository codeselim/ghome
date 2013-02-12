var PLUG_SWITCH_ON_FRAME = 'A55A6B0555000000FF9F1E06304C'//* Frame to be sent to toggle the switch on plug state (specific to our given switch power plug)
var PLUG_SWITCH_OFF_FRAME = 'A55A6B0577000000FF9F1E06306E'//* Frame to be sent to toggle the switch off plug state (specific to our given switch power plug)
var net = require('net')
var get_shared_data = require('../../shared_data').get_shared_data

/** 
 *
 *
 * @param{int} tries_count : Facultative. The number of tries we already did without reaching the device. After 10 tries, we give up.
*/
function switchPlugDC (sensor_id, message, tries_count) {
	if (!tries_count) {
		var tries_count = 1
	} else if (tries_count > 10) {
		console.error(new Date().toString() + "Giving up sending the message" + message + "to sensor_id " + sensor_id + " after 10 tries.")
	}

	console.log("Entering in switchPlugDC()")
	var sock = new net.Socket()
	if ("ON" == message) {
		console.log("on message to send")
		var message = PLUG_SWITCH_ON_FRAME // @TODO : Do a .replace("{ID}", sensor_id)
	} else {
		var message = PLUG_SWITCH_OFF_FRAME // @TODO : Do a .replace("{ID}", sensor_id)
	}
	
	sock.connect(get_shared_data('MAIN_SERVER_PORT'), get_shared_data('MAIN_SERVER_IP'), function () { 
		console.log('switchPlugDC: Connection to main server established, going to send a message for a sensor', message)
		sock.write(message, null, function () {
			console.log('switchPlugDC: Data sent to main server, disconnecting.')
			sock.close()
			console.log("Exiting in switchPlugDC() callback")
		})
	})

	sock.on("error", function () { 
		console.error(new Date().toString() + "Could not send message " + message + "to sensor_id " + sensor_id + ", trying again in 10 seconds."); 
		setTimeout(function () {
			switchPlugDC(sensor_id, message, tries_count+1)
		}, 10000)
	})
	console.log("Exiting in switchPlugDC() (without the callback)")
}


//* Registering them in the system
var dc = require('../../device_communicator')
dc.addDeviceCommunicator(5, switchPlugDC)

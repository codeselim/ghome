var PLUG_SWITCH_ON_FRAME = 'A55A6B0555000000FF9F1E063072'//* Frame to be sent to toggle the switch on plug state (specific to our given switch power plug)
var PLUG_SWITCH_OFF_FRAME = 'A55A6B0577000000FF9F1E063072'//* Frame to be sent to toggle the switch off plug state (specific to our given switch power plug)
var net = require('net')
var get_shared_data = require('../../shared_data').get_shared_data

function switchPlugDC (sensor_id, message) {
	var sock = new net.Socket()
	if ("ON" == message) {
		message = PLUG_SWITCH_ON_FRAME // @TODO : Do a .replace("{ID}", sensor_id)
	} else {
		message = PLUG_SWITCH_OFF_FRAME // @TODO : Do a .replace("{ID}", sensor_id)
	}
	sock.connect(get_shared_data('MAIN_SERVER_PORT'), get_shared_data('MAIN_SERVER_IP'), function () { 
		console.log('switchPlugDC: Connection to main server established, going to send a message for a sensor', message)
		sock.write(message, null, function () {
			console.log('switchPlugDC: Data sent to main server, disconnecting.')
			sock.close()
		})
	})
}


//* Registering them in the system
var dc = require('../../device_communicator')
dc.addDeviceCommunicator(5, switchPlugDC)

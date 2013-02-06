var db = null
var started = false
var get_shared_data = require('./shared_data').get_shared_data
var t = get_shared_data('SQL_TABLES')

function start (connected_db) {
		db = connected_db
		started = true
}

function notStarted () {
	console.error("Executing a device_communicator module's function without having started it. Returning immediately.")
}

//* Will map device types to communicators functions:
var communicators = {
	0: simplisticCommunicator
} 

/**
 * This function allows any component of the server to send a given message to a given device/sensor.
 * The message will be parse by the related device communicator and thus may not be sent as-is.
 * @param{int} sensor_id
 * @param{string} message
 * @return{void} undefined
*/
function sendToSensor (sensor_id, message) {
	if (!started) {
		notStarted()
	};
	db.select_query("SELECT sensor_type_id FROM `" + t['s'] + "` WHERE id = ?", [sensor_id], function (err, rows) {
		if (null == err) {
			var tid = rows[0].sensor_type_id

			if (tid in communicators) {
				communicators[tid](sensor_id, message)
			}
		};
	})
}

function simplisticCommunicator (sensor_id, message) {
	var sock = new net.Socket()
	sock.connect(get_shared_data('MAIN_SERVER_PORT'), get_shared_data('MAIN_SERVER_IP'), function () { 
		console.log('Connection to main server established, going to send a message for a sensor', message)
		sock.write(message, null, function () {
			console.log('Data sent to main server, disconnecting.')
			sock.close()
		})
	})
}

/** 
 * This function allows plugins to add new device communicators for a given device type id
 * @param{int} type_id The device type_id we want to define a device communicator for
 * @param{function (sensord_id, message)} device communicator to be set for type_id device type
 * @return{void} undefined
*/
function addDeviceCommunicator (type_id, communicator) {
	if (type_id in communicators) {
		console.error("Trying to overwrite an existing device communicator for type_id=" + type_id + ". Aborting.")
		return
	};
	communicators[type_id] = communicator
}

exports.sendToSensor = sendToSensor
exports.start = start
exports.addDeviceCommunicator = addDeviceCommunicator
//* Server of the GHome application
//* Will be launching the network sensors server as well as the web server that deals with the different GUIs

var web_serv = require('./webserver')
var sensors_serv = require('./sensors_server')
var android_notif_serv = require('./android_notif_server')
var dbg = require('./debug')
var shared = require('./shared_data')
var sse_sender = require('./sse_sender')
var get_shared_data = shared.get_shared_data
var set_shared_data = shared.set_shared_data


var cp = require('child_process')
var n = cp.fork(__dirname + '/background_worker.js')

//* Handling messages FROM the child
n.on('message', function(m) {
  console.log('PARENT got message:', m)
});


/**
 * frame_processor : Processes a new sensor frame
 * @param {Dictionary} frame The new frame
 * @returns nothing
 */
function frame_processor (frame) {
	console.log("Sending the frame to the bg worker")
	n.send({newSensorFrame: frame})
	console.log("A new sensor frame has been completed : ")
	console.log(frame)
}

function frame_to_android_notif (frame_data) {
	android_notif_serv.push_android_notif(JSON.stringify(frame_data))
}

// @TODO : Put that logic somewhere else, like in the EventMonitor...
function update_main_temperatures (frame_data) {
	// Frame to be used as demo : A55A0B0700003608008933780084
	if (frame_data.id == get_shared_data('OUT_TEMP_SENSOR_ID')) {
		console.log('The sensor id of the received frame is the one of the main INSIDE temperature sensor. Updating the server in-memory value.')
		temp = require('./sensors').decode_data_byte(frame_data)[1].toFixed(1)
		set_shared_data('OUT_TEMP', temp)
		
	};
	// set_shared_data('OUT_TEMP', temp)
}

/** GLOBAL_INIT : Initialization function at the startup of the global server (server.js file) 
 * It will for instance get the last inside/outised temperatures and push them into memory, etc. .. 
 * It will, among other things, bring the server to the state it was when it was shutdown (either gracefully or suddenly..)
 */
function GLOBAL_INIT () {
	set_shared_data('IN_TEMP', 0) // @TODO : Get the value from the database instead !
	set_shared_data('OUT_TEMP', -2) // @TODO : Get the value from the database instead !
	set_shared_data('MAIN_SERVER_IP', '134.214.105.28')
	set_shared_data('MAIN_SERVER_PORT', 5000)
	set_shared_data('IN_TEMP_SENSOR_ID', 8991608)
	set_shared_data('OUT_TEMP_SENSOR_ID', 8991608)
}

//@TODO : Find a way to organize the packages so that they share the data
GLOBAL_INIT()
web_serv.start(null, 9615)
android_notif_serv.start(5000, "0.0.0.0") // DO NOT CHANGE THIS PORT NUMBER (Well, or test after changing it !) I don't know why, but it's working on port 5000 and not on port 3000 for instance....
sensors_serv.events.addListener(sensors_serv.SENSOR_FRAME_EVENT, frame_processor)
sensors_serv.events.addListener(sensors_serv.SENSOR_FRAME_EVENT, sse_sender.sendSSE)
sensors_serv.events.addListener(sensors_serv.SENSOR_FRAME_EVENT, frame_to_android_notif)
sensors_serv.events.addListener(sensors_serv.SENSOR_FRAME_EVENT, update_main_temperatures)
var allowed_ids = [2214883, 346751, 8991608/*temp sensor*/, 6] //  @TODO : Put ALL OF THE IDS here // Note : The "6" is for debugging, remove before production
sensors_serv.start(null, null, 8000, allowed_ids)

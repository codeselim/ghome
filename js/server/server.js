//* Server of the GHome application
//* Will be launching the network sensors server as well as the web server that deals with the different GUIs

var web_serv = require('./webserver')
var sensors_serv = require('./sensors_server')
var android_notif_serv = require('./android_notif_server')
var dbg = require('./debug')

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

//@TODO : Find a way to organize the packages so that they share the data
web_serv.start()
android_notif_serv.start(5000, "0.0.0.0") // DO NOT CHANGE THIS PORT NUMBER (Well, or test after changing it !) I don't know why, but it's working on port 5000 and not on port 3000 for instance....
sensors_serv.events.addListener(sensors_serv.SENSOR_FRAME_EVENT, frame_processor)
sensors_serv.events.addListener(sensors_serv.SENSOR_FRAME_EVENT, web_serv.frameRecieved)
sensors_serv.events.addListener(sensors_serv.SENSOR_FRAME_EVENT, frame_to_android_notif)
var allowed_ids = [2214883, 346751, 6] //  @TODO : Put ALL OF THE IDS here // Note : The "6" is for debugging, remove before production
sensors_serv.start(null, null, 8000, allowed_ids)

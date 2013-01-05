//* Server of the GHome application
//* Will be launching the network sensors server as well as the web server that deals with the different GUIs

var web_serv = require('./webserver')
var sensors_serv = require('./sensors_server')
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

//@TODO : Fin a way to organize the packages so that they share the data
// web_serv.start()
sensors_serv.events.addListener(sensors_serv.SENSOR_FRAME_EVENT, frame_processor)
sensors_serv.start(null, null, 8000, 6)
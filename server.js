//* Server of the GHome application
//* Will be launching the network sensors server as well as the web server that deals with the different GUIs

var web_serv = require('./webserver')
var sensors_serv = require('./sensors_server')

/**
 * frame_processor : Processes a new sensor frame
 * @param {Buffer} frame The Buffer object for the new frame
 * @returns nothing
 */
function frame_processor (frame) {
	console.log("A new sensor frame has been completed : ")
	console.log(frame)
}

//@TODO : Fin a way to organize the packages so that they share the data
// web_serv.start()
sensors_serv.events.on(sensors_serv.SENSOR_FRAME_EVENT, frame_processor)
sensors_serv.start()
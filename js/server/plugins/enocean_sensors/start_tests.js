"use strict"

var gsd = require('../../shared_data').get_shared_data
//ssd = require('../../shared_data').set_shared_data
var deviceCommunicator = require('../../device_communicator')


var start_tests = gsd('DEVICE_START_TESTS')
var satr = gsd('shared_among_tests_requests')
var sutils = require('../../sensors')

//* Action for device of type 2 
start_tests[1] = function (req, res, params, testid) {
	res.end(JSON.stringify({'testid': testid, hideafter: 1000, msg: "Veuillez maintenant appuyer sur le bouton LRN de votre capteur." }))
}
//* Action for device of type 2 
start_tests[2] = function (req, res, params, testid) {
	res.end(JSON.stringify({'testid': testid, hideafter: 1000, msg: "Veuillez maintenant appuyer sur le bouton LRN de votre capteur." }))
}
//* Action for device of type 2 
start_tests[3] = function (req, res, params, testid) {
	res.end(JSON.stringify({'testid': testid, hideafter: 1000, msg: "Veuillez maintenant appuyer sur le bouton LRN de votre capteur." }))
}
//* Action for device of type 2 
start_tests[4] = function (req, res, params, testid) {
	res.end(JSON.stringify({'testid': testid, hideafter: 1000, msg: "Veuillez maintenant appuyer sur le bouton LRN de votre capteur." }))
}
//* Action for device of type 5 : Power switch plug
start_tests[5] = function (req, res, params, testid) {
	console.log("STARTT: Starting testid=", testid)
	satr[testid]['start_time'] = new Date()
	deviceCommunicator.sendToSensorWithDevType(parseInt(params.query.deviceId), 5, "ON")
	res.end(JSON.stringify({'testid': testid, hideafter: 1500, msg: "Votre prise va être mise en état ON pendant 7 secondes puis éteinte." }))
}
//* Action for device of type 2 
start_tests[6] = function (req, res, params, testid) {
	res.end(JSON.stringify({'testid': testid, hideafter: 1000, msg: "Veuillez maintenant appuyer sur le bouton LRN de votre capteur." }))
}


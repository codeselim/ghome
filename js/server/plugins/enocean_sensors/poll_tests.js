"use strict"

var gsd = require('../../shared_data').get_shared_data
var deviceCommunicator = require('../../device_communicator')
//ssd = require('../../shared_data').set_shared_data

var poll_tests = gsd('DEVICE_POLL_TESTS')
var satr = gsd('shared_among_tests_requests')
var sutils = require('../../sensors')

var simpleTeachIndDetection = function (req, res, params, testid) {
	if (-1 != gsd('TEACH_IN_IDS').indexOf(satr['deviceId'])) {
		res.end(JSON.stringify({status: 'ok', events: []})) // putting "events" empty array will trigger the test end, on the client
	} else {
		res.end(JSON.stringify({status: 'ok'})) // just saying hello
	}
}

//* Action for device of type 1 = temperature
poll_tests[1] = simpleTeachIndDetection

//* Action for device of type 2 
poll_tests[2] = simpleTeachIndDetection

//* Action for device of type 3 
poll_tests[3] = simpleTeachIndDetection

//* Action for device of type 4 
poll_tests[4] = simpleTeachIndDetection

//* Action for device of type 5 : Power switch plug
poll_tests[5] = function (req, res, params, testid) {
	var current = new Date()
	console.log("POLLT: We have been waiting for..." + (current - satr[testid]['start_time']) + "ms")
	if (7000 <= (current - satr[testid]['start_time'])) {// If it's 7 seconds since we switched the plug ON, switch it on right now
		console.log("POLLT: IS OVER")
		deviceCommunicator.sendToSensorWithDevType(parseInt(params.query.deviceId), 5, "OFF")
		res.end(JSON.stringify({status: 'ok', events: []})) // putting "events" empty array will trigger the test end, on the client
	} else {
		console.log("POLLT: NOT YET")
		res.end(JSON.stringify({status: 'ok'})) // just saying hello
	}
}
//* Action for device of type 2 
poll_tests[6] = simpleTeachIndDetection
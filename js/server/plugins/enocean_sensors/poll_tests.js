gsd = require('../../shared_data').get_shared_data
deviceCommunicator = require('../../device_communicator')
//ssd = require('../../shared_data').set_shared_data

poll_tests = gsd('DEVICE_POLL_TESTS')

//* Action for device of type 5 : Power switch plug
poll_tests[5] = function (req, res, params, testid) {
    deviceCommunicator[5](params.query.deviceId, "ON")
    res.end({status: 'ok', events: []})
}

//* Action for device of type 1 = temperature
poll_tests[1] = function (req, res, params, testid) {
	
}


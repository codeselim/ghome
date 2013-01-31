gsd = require('../../shared_data').get_shared_data
deviceCommunicator = require('../device_communicator')
//ssd = require('../../shared_data').set_shared_data

poll_tests = gsd('DEVICE_START_TESTS')

//* Action for device of type 5 : Power switch plug
poll_tests[5] = function (req, res, params) {
    deviceCommunicator[5]("ON")
    res.end({status: 'ok', events: []})
}

//* Action for device of type 2 
poll_tests[2] = function (req, res, params) {
    

}


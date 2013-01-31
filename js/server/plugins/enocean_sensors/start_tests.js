gsd = require('../../shared_data').get_shared_data
//ssd = require('../../shared_data').set_shared_data

start_tests = gsd('DEVICE_START_TESTS')

//* Action for device of type 5 : Power switch plug
start_tests[5] = function (req, res, params, testid) {
    // nothing to do, right now

}

//* Action for device of type 2 
start_tests[2] = function (req, res, params, testid) {
    

}


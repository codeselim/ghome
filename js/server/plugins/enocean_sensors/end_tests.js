gsd = require('../../shared_data').get_shared_data
//ssd = require('../../shared_data').set_shared_data

end_tests = gsd('DEVICE_END_TESTS')

//* Action for device of type 5 : Power switch plug
end_tests[5] = function (req, res, params, testid) {
    // nothing to do, right now

}

//* Action for device of type 2 
end_tests[2] = function (req, res, params, testid) {
    

}


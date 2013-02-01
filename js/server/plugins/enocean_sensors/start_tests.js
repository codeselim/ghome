gsd = require('../../shared_data').get_shared_data
//ssd = require('../../shared_data').set_shared_data
deviceCommunicator = require('../../device_communicator')


start_tests = gsd('DEVICE_START_TESTS')
satr = gsd('shared_among_tests_requests')

//* Action for device of type 5 : Power switch plug
start_tests[5] = function (req, res, params, testid) {
    satr[testid]['start_time'] = new Date()
    deviceCommunicator.sendToSensor(params.query.deviceId, "ON")
    res.end(JSON.stringify({'testid': testid, hideafter: 1000, msg: "Votre prise va être mise en état ON pendant 7 secondes puis éteinte." }))
}

//* Action for device of type 2 
start_tests[2] = function (req, res, params, testid) {
    

}


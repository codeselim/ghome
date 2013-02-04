var fs = require('fs')
var tpl = require('./template_engine')
var ss = require('./sensors_server')
var t = require('./shared_data').get_shared_data('SQL_TABLES') // Dictionary of the SQL tables names
var tpl = require('./template_engine')
var get_shared_data = require('./shared_data').get_shared_data
var off = true
var testid = 0 // The testid can be used by the test start/poll/end handlers to share data among them if they need to, by allowing them to identify a given request
require('./shared_data').set_shared_data('shared_among_tests_requests', {}) // For each testid, will allow us to shared data among the different poll requests
satr = get_shared_data('shared_among_tests_requests')
var sutils = require('./sensors')


/**
 * Gets the list of the devices types from the DB and passes it as a parameter to the callback
 * Object passed : [{'value': type_id, 'label': type_name}]
*/
function getDevicesTypesList (db, callback) {
	q = "SELECT * FROM " + t['st'] + " ORDER BY name ASC"
	var data = []
	db.query(q, null, function (err, rows) { // Dictionary of the SQL tables names
		if (null != err) {
			console.error("SQL Query [1] " + q + " went wrong. Error object: " + JSON.stringify(err))
			// SQL Query went wrong, don't crash, just don't reply anything
		} else {
			for(i in rows) {
				console.log("Row " + i, rows[i])
				data.push({'value': rows[i]['id'], 'label': rows[i]['name']})
			}
		}
		callback(data)
	})
}

/**
 * Gets the device info from the DB and passes it as a parameter to the callback
 * The info passed contains: type of devices, device name, device hardware id, ##TODO: device status ##
 * Object passed : {device_types: [{'value': type_id, 'label': type_name}],
 *                  device: {'id': id, 'type': type_id, 'equip_id': hardware_id, 'equip_label': name}
*/
function getDeviceInfo (db, deviceid, callback) {
	getDevicesTypesList(function(deviceTypes){ //* Retrieving the list of device types
		var data = {'devices_types': deviceTypes}
		q = "SELECT * FROM " + t['st'] + " ORDER BY name ASC WHERE id = ?"
		db.query(q, deviceid, function (err, rows) {
			if (null != err) {
				console.error("SQL Query [1] " + q + " went wrong. Error object: " + JSON.stringify(err))
				// SQL Query went wrong, don't crash, just don't reply anything
			} else {
				if (rows) {
					console.log("Row " + i, rows[i])
					data.device = { 'id': rows[0]['id']
												, 'type': rows[0]['type_id']
												, 'equip_label': rows[0]['name']
												, 'equip_id': rows[0]['hardware_id']}
				}
			}
			callback(data)
		})
	})

}

var deviceRH = function (req, res, params, responseSender) {
	switch (params.query.action) {
		case 'submit':
			db.query("INSERT INTO `sensors` (id, hardware_id, name) VALUES (NULL, ?, ?)", [params.postData.equip_label, params.postData.equip_id], function (err, rows) {
				if (null != err) {
					deviceManagementRH(req, res, params, responseSender)
				}
			})
			break

		case 'new':
			//* Loads required data and sends the filled template
			getDevicesTypesList(params.db, function (devices_types) {
				var data = tpl.get_template_result("device.html", { 'devices_types' : devices_types })
				params.fileUrl = 'device.html'
				responseSender(req, res, params, data)
			})
			break
		
		case 'edit':
			if (params.query.id) {
				getDeviceInfo(params.db, params.query.id, function (devices_types) {
					var data = tpl.get_template_result("device.html", { 'devices_types' : devices_types })
					params.fileUrl = 'device.html'
					responseSender(req, res, params, data)
				})
			}
			break	
	}
}

var deviceTestRH = function (req, res, params, responseSender) {
	ts = get_shared_data('DEVICE_START_TESTS')
	te = get_shared_data('DEVICE_END_TESTS')
	tp = get_shared_data('DEVICE_POLL_TESTS')
	aids = get_shared_data('ALLOWED_IDS')
	cids = get_shared_data('CONNECTED_IDS')
	switch(params.query.action) {
		case "teststart":
			console.log('teststart: id=' + params.query.deviceId + ', type=' + params.query.deviceType)
			testid++
			// Initialize the data structure allowing tests to shared data about this specific test (unique testid)
			satr[testid] = {}
			// In case if was already in memory, delete it:
			ArrayRemove(aids, aids.indexOf(params.query.deviceId))
			ArrayRemove(cids, cids.indexOf(params.query.deviceId))
			//* Then add it to the allowed ids so that we don't filter it out, but don't add to connected ones, as what we want is to detect connection
			aids.push(params.query.deviceId)
			ts[params.query.deviceType](req, res, params, testid)
			break;

		case "testpoll":
			console.log('testpoll: id=' + params.query.deviceId + ', type=' + params.query.deviceType)
			tp[params.query.deviceType](req, res, params, params.query.testid)
			break;

		case "testend":
			console.log('testpend: id=' + params.query.deviceId + ', type=' + params.query.deviceType)
			//* Removing from in-memory arrays
			ArrayRemove(aids, aids.indexOf(params.query.deviceId))
			ArrayRemove(cids, cids.indexOf(params.query.deviceId))
			// The test is over, cleaning shared data about it
			delete satr[testid]
			te[params.query.deviceType](req, res, params, params.query.testid)
			break;

		default:
				// ???
				break;
		}
}

var deviceManagementRH  = function (req, res, params, responseSender) {
	params.db.query("SELECT st.name, s.sensor_type_id, s.hardware_id, s.name AS device_name " +
					"FROM " + t['st'] + " st " +
					"JOIN " + t['s']+ " s ON st.id = s.sensor_type_id " +
					"ORDER BY s.sensor_type_id", 
		null, 
		function (err, rows) {
			if(null != err) console.log("[scheduler_module reported SQL_ERROR] : "+err);
			
			//deviceTypes +=  '"deviceTypes" : ['  //moved down
			deviceTypes = sutils.generate_json_devices_list_from_sql_rows(rows)

				//console.log( deviceTypes )
			console.log("scheduler_modules.js: ", params)

			var data = tpl.get_template_result("device_management.html", { 
				  'device_types' : deviceTypes
			})

			params.fileUrl = 'device_management.html'
			responseSender(req, res, params, data)			
		}
	)
}



exports.deviceRequestHandler = deviceRH
exports.devMgmtRequestHandler = deviceManagementRH
exports.deviceTestRH = deviceTestRH

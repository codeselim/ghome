"use strict"

var fs = require('fs')
var tpl = require('./template_engine')
var ss = require('./sensors_server')
var t = require('./shared_data').get_shared_data('SQL_TABLES') // Dictionary of the SQL tables names
var tpl = require('./template_engine')
var get_shared_data = require('./shared_data').get_shared_data
var off = true
var testid = 0 // The testid can be used by the test start/poll/end handlers to share data among them if they need to, by allowing them to identify a given request
require('./shared_data').set_shared_data('shared_among_tests_requests', {}) // For each testid, will allow us to shared data among the different poll requests
var satr = get_shared_data('shared_among_tests_requests')
var sutils = require('./sensors')
var utils = require('./utils')

/**
 * Gets the list of the devices types from the DB and passes it as a parameter to the callback
 * Object passed : [{'value': type_id, 'label': type_name}]
*/
function getDevicesTypesList (db, callback) {
	var q = "SELECT * FROM " + t['st'] + " ORDER BY name ASC"
	var data = []
	db.select_query(q, null, function (err, rows) { // Dictionary of the SQL tables names
		if (null != err) {
			console.error("SQL Query [1] " + q + " went wrong. Error object: " + JSON.stringify(err))
			// SQL Query went wrong, don't crash, just don't reply anything
		} else {
			console.log(rows)
			for(var i in rows) {
				console.log("Row " + i, rows[i])
				data.push({'id': rows[i]['id'], 'label': rows[i]['name']})
			}
		}
		callback(data)
	})
}

/**
 * Gets the device info from the DB and passes it as a parameter to the callback
 * The info passed contains: type of devices, device name, device hardware id, ##TODO: device status ##
 * Object passed : {device_types: [{'id': type_id, 'label': type_name}],
 *                  device: {'id': id, 'type': type_id, 'equip_id': hardware_id, 'equip_label': name}
*/
function getDeviceInfo (db, deviceid, callback) {
	var q = "SELECT s.id, s.sensor_type_id, s.name, s.hardware_id, st.name as stname " +
		"FROM " + t['s'] + " s JOIN " + t['st'] + " st ON s.sensor_type_id=st.id " +
		"WHERE s.id = ?"
	db.select_query(q, deviceid, function (err, rows) {
		var data = {}
		if (null != err) {
			console.error("SQL Query [1] " + q + " went wrong. Error object: " + JSON.stringify(err))
			// SQL Query went wrong, don't crash, just don't reply anything
		} else {
			if (rows[0]) {
				var row = rows[0]
				console.log(JSON.stringify(rows))
				data = {
					  'devices_types': [{'id': row.sensor_type_id, 'label': row.stname}]
					, 'device' : { 
						  'id': row.id
						, 'type': row.sensor_type_id
						, 'equip_label': row.name
						, 'equip_id': row.hardware_id
					} 
				}
			}
			callback(data)
		})
	})

}

var deviceRH = function (req, res, params, responseSender) {
	switch (params.query.action) {
		case 'submit_new':
			var q = "INSERT INTO `" + t['s'] + "` (id, name, hardware_id, sensor_type_id) VALUES (NULL, ?, ?, ?)"
			var p = [params.query.equip_label, params.query.equip_id, params.query.equip_type]
			// console.log("Going to execute query ", q, "with params", p)
			params.db.insert_query(q, p, function (err) {
				if (null == err) {
					console.log("Request went well")
					// res.writeHead(301, {'Location': "/?module=device_management"})
					// res.end()
					res.end(JSON.stringify({'id': this.lastID, 'success': true}))
				} else {
					console.error("newDeviceRH: Error when inserting the new device.", q, p, zerr)
					res.end(JSON.stringify({'msg': JSON.stringify(err), 'success': false}))
				}
			})
			break

		case 'submit_edit':
			res.end(JSON.stringify({'msg': 'not implemented yet', 'success': false}))
			break;

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
				getDeviceInfo(params.db, params.query.id, function (deviceInfo) {
					console.log(deviceInfo)

					for(var i in deviceInfo.devices_types) {
						var dt = deviceInfo.devices_types[i]
						console.log(dt)
						if (dt.id == deviceInfo.device.type) {
							dt.selected = true
							break
						}
					}

					var data = tpl.get_template_result("device.html", deviceInfo)
					params.fileUrl = 'device.html'
					responseSender(req, res, params, data)
				})
			}
			break	
	}
}

var deviceTestRH = function (req, res, params, responseSender) {
	var ts = get_shared_data('DEVICE_START_TESTS')
	var te = get_shared_data('DEVICE_END_TESTS')
	var tp = get_shared_data('DEVICE_POLL_TESTS')
	var aids = get_shared_data('ALLOWED_IDS')
	var cids = get_shared_data('CONNECTED_IDS')
	switch(params.query.action) {
		case "teststart":
			console.log('teststart: id=' + params.query.deviceId + ', type=' + params.query.deviceType)
			testid++
			// Initialize the data structure allowing tests to shared data about this specific test (unique testid)
			satr[testid] = {}
			// In case if was already in memory, delete it:
			utils.ArrayRemove(aids, aids.indexOf(params.query.deviceId))
			utils.ArrayRemove(cids, cids.indexOf(params.query.deviceId))
			//* Then add it to the allowed ids so that we don't filter it out, but don't add to connected ones, as what we want is to detect connection
			aids.push(params.query.deviceId)
			if (params.query.deviceType in ts) {
				ts[params.query.deviceType](req, res, params, testid)
			} else {// If no start_test registered, displaying error message
				res.end(JSON.stringify({'testid': testid, poll_delay: 3000, hideafter: 3000, msg: "ERROR: The requested device type has not any registered tests." }))
			}
			break;

		case "testpoll":
			console.log('testpoll: id=' + params.query.deviceId + ', type=' + params.query.deviceType)
			if (params.query.deviceType in tp) {
				tp[params.query.deviceType](req, res, params, params.query.testid)
			} else {// If no poll_test registered: Sending events:[] so that we terminate the test
				res.end(JSON.stringify({status: 'ok', events: []})) 
			}
			break;

		case "testend":
			console.log('testpend: id=' + params.query.deviceId + ', type=' + params.query.deviceType)
			//* Removing from in-memory arrays
			ArrayRemove(aids, aids.indexOf(params.query.deviceId))
			ArrayRemove(cids, cids.indexOf(params.query.deviceId))
			// The test is over, cleaning shared data about it
			delete satr[testid]
			if (params.query.deviceType in te) {
				te[params.query.deviceType](req, res, params, params.query.testid)
			}// else : Nothing to do
			break;

		default:
				// ???
				break;
		}
}

var deviceManagementRH  = function (req, res, params, responseSender) {
	params.db.select_query("SELECT st.name, s.sensor_type_id, s.id, s.name AS device_name " +
					"FROM " + t['st'] + " st " +
					"JOIN " + t['s']+ " s ON st.id = s.sensor_type_id " +
					"ORDER BY st.name, device_name ASC", 
		null, 
		function (err, rows) {
			if(null != err) console.log("[scheduler_module reported SQL_ERROR] : "+err);
			
			var deviceTypes = sutils.generate_json_devices_list_from_sql_rows(rows)

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

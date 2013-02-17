"use strict"

var fs = require('fs')
var tpl = require('./template_engine')
var ss = require('./sensors_server')
var t = require('./shared_data').get_shared_data('SQL_TABLES') // Dictionary of the SQL tables names
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
	var q = "SELECT id, name FROM " + t['st'] + " ORDER BY name ASC"
	var data = []
	db.select_query(q, null, function (err, rows) { // Dictionary of the SQL tables names
		if (null != err) {
			console.error("SQL Query [1] " + q + " went wrong. Error object: " + JSON.stringify(err))
			// SQL Query went wrong, don't crash, just don't reply anything
		} else {
			console.log(rows)
			for(var i in rows) {
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
		}
	})
}

var deviceRH = function (req, res, params, responseSender) {
	switch (params.query.action) {
		case 'change_device_state':
			require('./device_communicator').sendToSensor(params.query.deviceId, params.query.newStateCode)
			res.end(JSON.stringify({'success':true}))
			break


		case 'submit_new':
			var q = "INSERT INTO `" + t['s'] + "` (id, name, hardware_id, sensor_type_id) VALUES (NULL, ?, ?, ?)"
			var p = [params.query.equip_label, params.query.equip_id, params.query.equip_type]
			// console.log("Going to execute query ", q, "with params", p)
			params.db.insert_query(q, p, function (err) {
				if (null == err) {
					console.log("Request went well")
					get_shared_data('SOFTWARE_IDS')[params.query.equip_id] = this.lastID
					res.end(JSON.stringify({'id': this.lastID, 'success': true, 'msg' : 'Le nouvel équipement a été ajouté avec succès.'}))
				} else {
					console.error("deviceRH: Error when inserting the new device.", q, p, zerr)
					res.end(JSON.stringify({'msg': JSON.stringify(err), 'success': false}))
				}
			})
			break

		case 'submit_edit':
			var q = "UPDATE `" + t['s'] + "` SET name=?, hardware_id=? WHERE id=?"
			var p = [params.query.equip_label, params.query.equip_id, params.query.id]
			params.db.select_query(q, p, function (err) {
				if (null == err) {
					console.log("Request went well")
					res.end(JSON.stringify({'id': this.lastID, 'success': true, 'msg' : 'Votre équipement a été modifié avec succès.'}))
				} else {
					console.error("deviceRH: Error when editing the new device " + params.query.id, err)
					res.end(JSON.stringify({'msg': err, 'success': false}))
				}
			})
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
					deviceInfo.editMode = true
					deviceInfo.value = sutils.getDisplayableState(deviceInfo.devices_types.id, get_shared_data('SENSORS_VALUES')[params.query.id])	
					console.log('## ', JSON.stringify(deviceInfo))

					params.db.select_query("SELECT at.message_to_sensor, at.name FROM `" + t.at + "` at WHERE at.sensor_type_id = ? ",
								[deviceInfo.device.type], function (err, rows){
						if(err) {
							params.error404 = true
							responseSender(req, res, params)
						} else {
							console.log('## rows', JSON.stringify(rows))							
							deviceInfo.actions = rows
							if (rows.length > 0) {
								deviceInfo.hasActions = true
							}
							for(var i in deviceInfo.devices_types) {
								var dt = deviceInfo.devices_types[i]
								console.log(dt)
								if (dt.id == deviceInfo.device.type) {
									dt.selected = true
									break
								}
							}

							console.log('## ', JSON.stringify(deviceInfo))

							var data = tpl.get_template_result("device.html", deviceInfo)
							params.fileUrl = 'device.html'
							responseSender(req, res, params, data)
						}
					})
				})
			} else {
				params.error404 = true
				responseSender(req, res, params)
			}
			break	
	}
}

var deviceTestRH = function (req, res, params, responseSender) {
	var ts = get_shared_data('DEVICE_START_TESTS')
	var te = get_shared_data('DEVICE_END_TESTS')
	var tp = get_shared_data('DEVICE_POLL_TESTS')
	var aids = get_shared_data('ALLOWED_IDS')
	var tiIds = get_shared_data('TEACH_IN_IDS')
	switch(params.query.action) {
		case "teststart":
			console.log('teststart: id=' + params.query.deviceId + ', type=' + params.query.deviceType)
			testid++
			var devId = parseInt(params.query.deviceId)
			// Initialize the data structure allowing tests to shared data about this specific test (unique testid)
			satr[testid] = {}
			satr[testid]["deviceId"] = params.query.deviceId
			// In case if was already in memory, delete it:
			/* A bit of explanation here :
			 * In order to receive data from the device
			 * it has to be in the allowed_ids array
			 * but if this is a device that finally don't register in the system
			 * then we have to remove it from this allowed_ids array at the end
			 * and if it is a device that is already registered, then we don't want to remove it 
			 * at the end. This, if it is found in the current state, don't remove at the end, 
			 * else, remove at the end of the test
			*/
			// if(-1 != aids.indexOf(params.query.deviceId)) {// if currently not allowed
			// 	satr[testid]['removeAfterTest'] = false // not allowed after either
			// } else {
			// 	satr[testid]['removeAfterTest'] = true // 
			// }
			
			//* Remove it from "connected_ids" so that we can detect if it has sent us a data by checking it has been added back into the array
			utils.ArrayRemove(tiIds, devId)
			
			//* Then add it to the allowed ids so that we don't filter it out, but don't add to connected ones, as what we want is to detect connection
			// former implementation
			// aids.push(params.query.deviceId)
			if (params.query.deviceType in ts) {
				ts[params.query.deviceType](req, res, params, testid)
			} else {// If no start_test registered, displaying error message
				res.end(JSON.stringify({'testid': testid, poll_delay: 3000, hideafter: 3000, msg: "ERROR: The requested device type has not any registered tests." }))
			}
			break;

		case "testpoll":
			console.log('testpoll: id=' + params.query.deviceId + ', type=' + params.query.deviceType)
			var devId = parseInt(params.query.deviceId)
			if (params.query.deviceType in tp) {
				tp[params.query.deviceType](req, res, params, params.query.testid)
			} else {// If no poll_test registered: Sending events:[] so that we terminate the test
				res.end(JSON.stringify({status: 'ok', events: []})) 
			}
			break;

		case "testend":
			console.log('testpend: id=' + params.query.deviceId + ', type=' + params.query.deviceType)
			var devId = parseInt(params.query.deviceId)
			//* Removing from in-memory arrays
			// former implementation
			// if (satr[testid]['removeAfterTest']) {
			// 	utils.ArrayRemove(aids, devId)
			// };
			utils.ArrayRemove(tiIds, devId)
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
	switch (params.query.action) {
		case 'update_device_values' : 
			//* @TODO WIP, send the new values
			// var sensors_values = get_shared_data('SENSORS_VALUES')
			params.error404 = true
			responseSender(req, res, params)
			break

		default:
			params.db.select_query(
				"SELECT st.name, s.sensor_type_id, s.id, s.name AS device_name " +
				"FROM " + t['st'] + " st " +
				"JOIN " + t['s']+ " s ON st.id = s.sensor_type_id " +
				"ORDER BY st.name, device_name ASC", 
				null, 
				function (err, rows) {
					var sensors_values = get_shared_data('SENSORS_VALUES')
					var data = ''
					if(null != err) {
						console.log("[scheduler_module reported SQL_ERROR] : "+err);
					} else {
						var deviceTypes = sutils.generate_json_devices_list_from_sql_rows(rows)
						for(var i in deviceTypes) {
							var typeId = deviceTypes[i].id
							for(var j in deviceTypes[i].devices) {
								var s = deviceTypes[i].devices[j]
								deviceTypes[i].devices[j]['value'] = sutils.getDisplayableState(typeId, sensors_values[s.id])	
							}
						}


						var tplParams = {'device_types' : deviceTypes}

						if (params.query.msg) {
							tplParams.msg = decodeURIComponent(params.query.msg)
						}

						data = tpl.get_template_result("device_management.html", tplParams)

						params.fileUrl = 'device_management.html'
						
					}
					
					responseSender(req, res, params, data)			
				}
			)
			break
	}
}



exports.deviceRequestHandler = deviceRH
exports.devMgmtRequestHandler = deviceManagementRH
exports.deviceTestRH = deviceTestRH

var fs = require('fs')
var tpl = require('./template_engine')
var ss = require('./sensors_server')
var t = require('./shared_data').get_shared_data('SQL_TABLES') // Dictionary of the SQL tables names
var tpl = require('./template_engine')
var off = true
var testid = 0 // The testid can be used by the test start/poll/end handlers to share data among them if they need to, by allowing them to identify a given request
/**
 * Gets the list of the devices types from the DB and passes it as a parameter to the callback
 * Object passed ; [{'value': type_id, 'label': type_name}]
*/
function getDevicesTypesList (db, callback) {
	q = "SELECT * FROM " + t['st'] + " ORDER BY name ASC"
	var data = []
	db.query(q, null, function (err, rows) { // Dictionary of the SQL tables names
		if (null != err) {
			console.error("SQL Query [1] " + q + " went wrong. Error objet: " + JSON.stringify(err))
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

var newDeviceRH = function (req, res, params, responseSender) {
	//* Loads required data and sends the filled template
	var initNewDevicePage = function() {
		getDevicesTypesList(params.db, function (devices_types) {
			var data = tpl.get_template_result("new_device.html", { 'devices_types' : devices_types })
			params.fileUrl = 'new_device.html'
			responseSender(req, res, params, data)
		})
	}

	var actions = {// lol, this is a hidden switch // new JS way huhu
		'default' : initNewDevicePage,
		'submit': function() {
			db.query("INSERT INTO `sensors` (id, hardware_id, name) VALUES (NULL, ?, ?)", [params.postData.equip_label, params.postData.equip_id], function (err, rows) {
				if (null != err) {
					deviceManagementRH(req, res, params, responseSender)
				};
			})
			// initNewDevicePage()
		}
	}

	if ( !params.query.action || !(typeof actions[params.query.action] == 'function')) {
		params.query.action = 'default'
	}
	actions[params.query.action]()
}

var deviceTestRH = function (req, res, params, responseSender) {
	ts = get_shared_data('DEVICE_START_TESTS')
	te = get_shared_data('DEVICE_END_TESTS')
	tp = get_shared_data('DEVICE_POLL_TESTS')
	testid++
	aids = get_shared_data('ALLOWED_IDS')
	cids = get_shared_data('CONNECTED_IDS')
	switch(params.query.action) {
		case "teststart":
			console.log('teststart: id=' + params.query.deviceId + ', type=' + params.query.deviceType)
			// In case if was already in memory, delete it:
			ArrayRemove(aids.indexOf(params.query.deviceId))
			ArrayRemove(cids.indexOf(params.query.deviceId))
			//* Then add it to the allowed ids so that we don't filter it out, but don't add to connected ones, as what we want is to detect connection
			aids.push(params.query.deviceId)
			ts[params.query.deviceType](req, res, params, responseSender, testid)
			break;

		case "testpoll":
			console.log('testend: id=' + params.query.deviceId + ', type=' + params.query.deviceType)
			te[params.query.deviceType](req, res, params, responseSender)
			break;

		case "testend":js
			console.log('testpoll: id=' + params.query.deviceId + ', type=' + params.query.deviceType)
			//* Removing from in-memory arrays
			ArrayRemove(aids.indexOf(params.query.deviceId))
			ArrayRemove(cids.indexOf(params.query.deviceId))
			tp[params.query.deviceType](req, res, params, responseSender)
			break;

		default:
				// ???
				break;
		}
}

var deviceManagementRH  = function (req, res, params, responseSender) {
	var data = tpl.get_template_result("device_management.html", {
		'device_types' : [
			  {'name' : 'Prises', 'devices' : [
					  {'id': 'p1', 'label': 'Prise1'}
					, {'id': 'p2', 'label': 'Prise2'}
			  ]}
			, {'name' : 'Capteurs de température', 'devices' : [
					  {'id': 'ct1', 'label': 'Temp1'}
					, {'id': 'ct2', 'label': 'Temp2'}
			  ]}
		  , {'name' : 'Interrupteurs', 'devices' : [
				  {'id': 'i1', 'label': 'Interrupteur1'}
				, {'id': 'i2', 'label': 'Interrupteur2'}
		  ]}
		]
	})
	params.fileUrl = 'device_management.html'
	responseSender(req, res, params, data)
}



exports.newDeviceRequestHandler = newDeviceRH
exports.devMgmtRequestHandler = deviceManagementRH
exports.deviceTestRH = deviceTestRH
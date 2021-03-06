"use strict"

//* Server of the GHome application
//* Will be launching the network sensors server as well as the web server that deals with the different GUIs

// ************ WARNING : KEEP THOSE LINES AT THE TOP, OR SOME DATA WILL BE UNDEFINED ! ***************
var shared = require('./shared_data')
var utils = require('./utils')
var get_shared_data = shared.get_shared_data
var set_shared_data = shared.set_shared_data
set_shared_data('SQL_TABLES', {'st': 'sensors_types',
								'et':'event_types',
								'at':'actions_types',
								'l': 'logs',
								'c':'conditions',
								'ct':'condition_types',
								'm':'modes',
								's':'sensors',
								'th': 'thresholds',
								't':'tasks',
								'set':'settings',
								'arv':'actions_receivers_view',
								'elv':'events_launchers_view',
								'etct':'event_types_condition_types',
								'stet':'sensor_types_event_types',
								'stct':'sensor_types_condition_types',
								'thst':'thresholds_sensor_types'
							})
var allowed_ids = []  //[8991608, 346751, 8991608, 111198, 112022, 115002] 
var software_ids = {}
set_shared_data('SOFTWARE_IDS', software_ids)
set_shared_data('ALLOWED_IDS', allowed_ids)
var t = get_shared_data('SQL_TABLES')
var plugins = ['enocean_sensors'] // Edit this array in order to load new plugins
//******************************************************************

var sensors_utils = require('./sensors')
var web_serv = require('./webserver')
var sensors_serv = require('./sensors_server')
var android_notif_serv = require('./android_notif_server')
var dbg = require('./debug')
// var sse_sender = require('./sse_sender')
var dbms = require('./dbms')
var logger = require('./logger')
var events_monitor = require('./events_monitor')
var device_communicator = require('./device_communicator')
var tasks_executor = require('./tasks_executor')
var cp = require('child_process')
var spy = require('./spy.js')
var stats_computer = require('./stats_computer')

//*************** Constants **************
var SENSORS_SERVER_PORT = 8000
var WEB_SERVER_SECURED_PORT = 443
var WEB_SERVER_UNSECURED_PORT = 80
var ANDROID_NOTIF_SERVER_PORT = 4500
//****************************************

function frame_to_android_notif (frame_data) {
	android_notif_serv.push_android_notif(JSON.stringify(frame_data))
}

// @TODO : Put that logic somewhere else, like in the EventMonitor...
function update_main_temperatures (frame_data) {
	// Frame to be used as demo : A55A0B0700003608008933780084
	if (frame_data.id == get_shared_data('OUT_TEMP_SENSOR_HID')) {
		console.log('The sensor id of the received frame is the one of the main OUTSIDE temperature sensor. Updating the server in-memory value.')
		var temp = require('./sensors').decode_data_byte(1 /* temperature */, frame_data).toFixed(1)
		set_shared_data('OUT_TEMP', temp)
	} 
	if (frame_data.id == get_shared_data('IN_TEMP_SENSOR_HID')) {
		console.log('The sensor id of the received frame is the one of the main INSIDE temperature sensor. Updating the server in-memory value.')
		var temp = require('./sensors').decode_data_byte(1 /* temperature */, frame_data).toFixed(1)
		set_shared_data('IN_TEMP', temp)
	}
}

function pre_init () {
	set_shared_data('DEVICE_START_TESTS', {})
	set_shared_data('DEVICE_POLL_TESTS', {})
	set_shared_data('DEVICE_END_TESTS', {})
}

function load_plugins () {
	for(var i in plugins) {
		var p = './plugins/' + plugins[i] + '/'
		require(p + 'poll_tests.js')
		require(p + 'start_tests.js')
		require(p + 'end_tests.js')
		require(p + 'communicators.js')
		require(p + 'state_displayers.js')
		require(p + 'events_handlers.js')
	}
}

/** GLOBAL_INIT : Initialization function at the startup of the global server (server.js file) 
 * It will for instance get the last inside/outised temperatures and push them into memory, etc. .. 
 * It will, among other things, bring the server to the state it was when it was shutdown (either gracefully or suddenly..)
 */
var db = null
var sensors_values = {}
function GLOBAL_INIT () {
	function cancel_startup (query) {
		console.error("!! Error, could not load the former state of the sensors from the DB, aborting server startup. ¡¡")
		console.error("The query that caused the error is " + query)
		console.error("And the error is" + err)
		process.exit()
	}
	console.log("Starting Initializing data...")
	var ip = utils.getLocalPublicIpAddress(["wlan0", "wlan1"])
    console.log("Server is starting. With local IP=" + ip)
	set_shared_data('LOCAL_SERVER_IP', ip)
	set_shared_data('MAIN_SERVER_IP', "134.214.105.28")
	set_shared_data('WEB_UI_BASEURL', 'https://' + ip)
    console.log("WeB_UI_BASEURL=", get_shared_data("WEB_UI_BASEURL"))
	set_shared_data('WEB_UI_HOME', 'https://' + ip + "/?module=home")
	set_shared_data('MAIN_SERVER_PORT', 5000)
	set_shared_data('TEMP_SENSOR_TYPE', 1)
	db = new dbms.Database()
	console.log("Connecting to db...")
	db.connect('dat', function () {
		console.log(db)
		console.log("DB connected.")
		set_shared_data('IN_TEMP', 0) // @TODO : Get the value from the database instead !
		set_shared_data('OUT_TEMP', -2) // @TODO : Get the value from the database instead !
		var q = "SELECT hardware_id, id FROM `" + t['s'] + "`"
		db.select_query(q, null, function (err, rows) {
			if (null != err) {
				cancel_startup(q)
			}
			for(var i in rows) {
				allowed_ids.push(rows[i].hardware_id)
				software_ids[rows[i].hardware_id] = rows[i].id
			}
			
			var q = "SELECT name, value FROM `" + t['set'] + "` "
			db.select_query(q, null, function (err, rows) {
				if (null != err) {
					cancel_startup(q)
				}
				for(var i in rows) {
					var setting = rows[i].name
					var value = rows[i].value
					if (setting == "main_inside_temperature_sensor") {
						set_shared_data('IN_TEMP_SENSOR_ID', parseInt(value))
					} else if (setting == "main_outside_temperature_sensor") {
						set_shared_data('OUT_TEMP_SENSOR_ID', parseInt(value))
					} else if (setting == "main_inside_temperature_sensor_hid") {
						set_shared_data('IN_TEMP_SENSOR_HID', parseInt(value))
					} else if (setting == "main_outside_temperature_sensor_hid") {
						set_shared_data('OUT_TEMP_SENSOR_HID', parseInt(value))
					} else {
						set_shared_data(setting, value)
					}
				}

				var query = 
				" SELECT sensor_id AS sid, MAX(time), value " +
				" FROM `" + t['l'] + "` l " +
				" INNER JOIN `" + t['s'] + "` s ON (s.id = l.sensor_id)" +
				" GROUP BY sensor_id";//* /!\ According to StackOverflow, when using BTree as indexes (which is the case with sqlite), the maximum (key1, key2, key3) tuple will be the one returned by the GROUP BY and thus, for us, the last one in terms of time
				db.select_query(query, null, function (err, rows) {
					if (null != err) {
						cancel_startup(query)
					}
					for(var i in rows) {
						if (rows[i].sid == get_shared_data('OUT_TEMP_SENSOR_ID')) {
							set_shared_data('OUT_TEMP', parseFloat(rows[i].value).toFixed(1))
						}
						if (rows[i].sid == get_shared_data('IN_TEMP_SENSOR_ID')) {
							set_shared_data('IN_TEMP', parseFloat(rows[i].value).toFixed(1))
						}

						sensors_values[rows[i].sid] = rows[i].value
					}
					console.log("Server startup states: " + JSON.stringify(sensors_values) + JSON.stringify(allowed_ids))
					set_shared_data('SENSORS_VALUES', sensors_values) //* Will be updated by EventMonitor
					start()
				})
			})
		})
	})
}

function start () {
	console.log('Data initialized... Starting server components.')
	device_communicator.start(db)
	logger.start(db)
	web_serv.start(db, WEB_SERVER_SECURED_PORT, WEB_SERVER_UNSECURED_PORT)
	events_monitor.start(db);
	tasks_executor.start(db);
	stats_computer.start(db);
	spy.start(db);
	android_notif_serv.start(ANDROID_NOTIF_SERVER_PORT, "0.0.0.0") // DO NOT CHANGE THIS PORT NUMBER (Well, or test after changing it !) I don't know why, but it's working on port 5000 and not on port 3000 for instance....
	// sensors_serv.events.addListener(sensors_serv.SENSOR_FRAME_EVENT, sse_sender.sendSSE)
	// sensors_serv.events.addListener(sensors_serv.SENSOR_FRAME_EVENT, sensors_utils.notifyNewSensorState)
	// sensors_serv.events.addListener(sensors_serv.SENSOR_FRAME_EVENT, frame_to_android_notif)
	sensors_serv.events.addListener(sensors_serv.SENSOR_FRAME_EVENT, update_main_temperatures)
	sensors_serv.events.addListener(sensors_serv.SENSOR_FRAME_EVENT, logger.insertLog)
	sensors_serv.events.addListener(sensors_serv.SENSOR_FRAME_EVENT, events_monitor.handleEvent)
	events_monitor.events.addListener(events_monitor.SENSOR_EVENT, tasks_executor.execute_task)
	events_monitor.events.addListener(events_monitor.SENSOR_EVENT, spy.check_spy)
	sensors_serv.start(db, web_serv, SENSORS_SERVER_PORT, allowed_ids)
}


pre_init()
load_plugins()
GLOBAL_INIT()

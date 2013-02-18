"use strict"

//* Gets data parsed from sensors and check if it's associated to a real event
//* from the database

var db;
var eventTypeId;
var dictSensorEvent = {}
var data;
var eventToSend;
var idTimer;
var tasks_executor = require("./tasks_executor.js");
var shared_data = require("./shared_data.js");
var sensors_utils = require('./sensors.js');
var fs = require("fs");
var events = require('events');
// Map with last values of each sensor {id : value, ...}
var lastValues;
var SENSOR_EVENT = "newSensorEvent";
var eventEmitter = new events.EventEmitter();
var tables = shared_data.get_shared_data('SQL_TABLES');

Date.prototype.getWeek = function() {
	var onejan = new Date(this.getFullYear(),0,1);
	return Math.ceil((((this - onejan) / 86400000) + onejan.getDay()+1)/7);
} 


function checkThresholds(idSensor, sensor_type_id, value) {
	//// console.log("ERROR WITH "+ lastValues);
	db.select_query("SELECT th.value " +
		"FROM `" +  tables['th'] + "` th " +
		"INNER JOIN `"+ tables['thst'] + "` thst ON (thst.threshold_id = th.id) " +
		"WHERE thst.sensor_type_id = ?",
		[sensor_type_id], 
		function(err, rows) {
			var thresholds = [];
			for (var r in rows) {
				thresholds.push(rows[r]["value"]);
			}

			for(var t in thresholds) {
				var threshold = thresholds[t]
				// console.log("-------------------lastValues[idSensor] ",lastValues[idSensor], "threshold ",threshold, "value ", value)
				if (lastValues[idSensor] < threshold && value > threshold) {
					//tasks_executor.execute_task(1);
					eventEmitter.emit(SENSOR_EVENT, 1, idSensor);
				}
				if (lastValues[idSensor] > threshold && value < threshold) {
					//tasks_executor.execute_task(2);
					eventEmitter.emit(SENSOR_EVENT, 2, idSensor);
				}
			}
			//// console.log("ERROR WITH "+ value);
			lastValues[idSensor] = value;
	});
}

function sendTimeEvent() {
	var currentTime = new Date();
	//// console.log("Minute changed = " + currentTime.getMinutes());
	//db.query("SELECT id FROM event_types WHERE name = ?", "minute", sendEvent);
	var lastExecutionStr = null;
	var previousTime = null;
	if (fs.existsSync("lastExecutionTimer.txt")) {
		lastExecutionStr = fs.readFileSync("lastExecutionTimer.txt", "utf8");
		previousTime = new Date(lastExecutionStr);
	}
	//tasks_executor.execute_task(7);

	// Year or month has changed
	if (previousTime == null || currentTime.getFullYear() != previousTime.getFullYear() || currentTime.getMonth() != previousTime.getMonth()) {
		// All events
		eventEmitter.emit(SENSOR_EVENT, 9, -1)
		eventEmitter.emit(SENSOR_EVENT, 8, -1)
		eventEmitter.emit(SENSOR_EVENT, 7, -1)
		eventEmitter.emit(SENSOR_EVENT, 6, -1)
		eventEmitter.emit(SENSOR_EVENT, 5, -1)
		/*tasks_executor.execute_task(9);
		tasks_executor.execute_task(8);
		tasks_executor.execute_task(5);
		tasks_executor.execute_task(6);
		tasks_executor.execute_task(7);*/

	}
	// Week has changed
	else if (currentTime.getWeek() != previousTime.getWeek()) {
		/*tasks_executor.execute_task(8);
		tasks_executor.execute_task(5);
		tasks_executor.execute_task(6);
		tasks_executor.execute_task(7);*/
		eventEmitter.emit(SENSOR_EVENT, 5, -1)
		eventEmitter.emit(SENSOR_EVENT, 8, -1)
		eventEmitter.emit(SENSOR_EVENT, 7, -1)
		eventEmitter.emit(SENSOR_EVENT, 6, -1)
	}
	// Day has changed
	else if (currentTime.getDay() != previousTime.getDay()) {
		/*tasks_executor.execute_task(5);
		tasks_executor.execute_task(6);
		tasks_executor.execute_task(7);*/
		eventEmitter.emit(SENSOR_EVENT, 5, -1)
		eventEmitter.emit(SENSOR_EVENT, 6, -1)
		eventEmitter.emit(SENSOR_EVENT, 7, -1)
	}
	// Hour has changed
	else if (currentTime.getHours() != previousTime.getHours()) {
		/*tasks_executor.execute_task(6);
		tasks_executor.execute_task(7);*/
		eventEmitter.emit(SENSOR_EVENT, 6, -1)
		eventEmitter.emit(SENSOR_EVENT, 7, -1)
	}
	// Minute has changed
	else if (currentTime.getMinutes() != previousTime.getMinutes()) {
		//tasks_executor.execute_task(7);
		eventEmitter.emit(SENSOR_EVENT, 7, -1)
	}
/*
	// Hour changed
	if (currentTime.getHours() != previousTime.getHours()) {
		// console.log("Hour changed = " + currentTime.getHours());
		tasks_executor.execute_task(6);
	}
	// Day changed
	if (currentTime.getDay() != previousTime.getDay()) {
		// console.log("Day changed = " + currentTime.getDay());
		tasks_executor.execute_task(5);
	}
	// Week changed
	if (currentTime.getDay() == 1 previousTime.getDay() == 0) {
		// console.log("Week changed");
		tasks_executor.execute_task(8);


	}
	// Month changed
	if (currentTime.getMonth() != previousTime.getMonth() || currentTime.getFullYear() != previousTime.getFullYear()) {
		// console.log("Month changed");
		tasks_executor.execute_task(9);
	}

			
	*/
	// Save date of last execution
	var fileLastExecution = fs.openSync("lastExecutionTimer.txt", "w");
	fs.writeSync(fileLastExecution, currentTime.toLocaleString(), 0);
	fs.closeSync(fileLastExecution);

}


function start(database) {
	// console.log("EM_Starting events_monitor");
	lastValues = shared_data.get_shared_data("SENSORS_VALUES");
	db = database;
	idTimer = setInterval(sendTimeEvent, 15000);
}

function handleEvent(frame_data) {
	// console.log("EM_Data received from : " + frame_data.id);
	// console.log("EM_Data : " + frame_data.data);

	db.select_query("SELECT id AS sensor_id, sensor_type_id FROM `"+ tables['s'] +"` WHERE hardware_id = ?", [frame_data.id], function(err, rows) {

	// For every type of the sensor (a sensor can have many types)

	for (var r in rows) {
			//// console.log(rows[r]["sensors_types.name"]);
			//var sensor_type = rows[r]["sensors_types.name"];
			//var sensor_type_id = rows[r]["sensors_types.id"];
			// If sensor_type_id is associated with a function in dictSensorEvent
			var sensor_type = rows[r].sensor_type_id
			var value = sensors_utils.decode_data_byte(sensor_type, frame_data)
			var sensor_id = rows[r].sensor_id
			// console.log("EM_TYPE SENSOR : " + sensor_type);
			// console.log("EM_VALUE_SENSOR : " + value);

			// Notification to update the sensor's value
			sensors_utils.notifyNewSensorState(sensor_id, sensor_type, value)

			if (sensor_type in dictSensorEvent) {
				// console.log("EM_SEND EVENT")
				dictSensorEvent[sensor_type](sensor_id, sensor_type, value)
			}
		}
	});
}

function addEventHandler (sensor_type, eventHandler) {
	dictSensorEvent[sensor_type] = eventHandler
}

exports.start = start;
exports.handleEvent = handleEvent;
exports.events = eventEmitter;
exports.SENSOR_EVENT = SENSOR_EVENT;
exports.addEventHandler = addEventHandler
exports.checkThresholds = checkThresholds
exports.eventEmitter = eventEmitter
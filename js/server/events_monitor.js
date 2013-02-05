//* Gets data parsed from sensors and check if it's associated to a real event
//* from the database

var db;
var eventTypeId;
var data;
var eventToSend;
var idTimer;
var tasks_executor = require("./tasks_executor.js");
var shared_data = require("./shared_data.js");
var fs = require("fs");
var events = require('events');
// Map with last values of each sensor {id : value, ...}
var lastValues;
var SENSOR_EVENT = "newSensorEvent"
;var eventEmitter = new events.EventEmitter();

Date.prototype.getWeek = function() {
	var onejan = new Date(this.getFullYear(),0,1);
	return Math.ceil((((this - onejan) / 86400000) + onejan.getDay()+1)/7);
} 


function checkThresholds(idSensor, sensor_type_id, value) {

	db.query("SELECT value FROM thresholds WHERE sensor_type_id = ?", [sensor_type_id], function(err, rows) {
		var thresholds = [];
		for (var r in rows) {
			thresholds.push(rows[r]["thresholds.value"]);
		}

		for (t in thresholds) {
			if (lastValues[idSensor] < threshold && value > threshold) {
		tasks_executor.execute_task(1);
	}    
	if (lastValues[idSensor] > threshold && value < threshold) {
		tasks_executor.execute_task(2);
	}
	}
	lastValues[idSensor] = value;
	});

}


function tempEvent(idSensor, sensor_type_id, value) {
	checkThresholds(idSensor, sensor_type_id, value);
}
function lumEvent(idSensor, sensor_type_id, value) {
	checkThresholds(idSensor, sensor_type_id, value);
}
function contEvent(idSensor, sensor_type_id, value) {
	// Contact performed
	if(value == 1) {
		tasks_executor.execute_task(3);
	}

	// Contact removed
	if(value == 0) {
		tasks_executor.execute_task(4);
	}

	lastValues[idSensor] = value;

}
function preEvent(idSensor, sensor_type_id, value) {
	// Occupancy PIR ON
	if (value == 0) {
		tasks_executor.execute_task(10);
	}
	// Occupancy PIR OFF
	if (value == 1) {
		tasks_executor.execute_task(11);
	}

	lastValues[idSensor] = value;
}

var dictSensorEvent = { 1 : tempEvent,
	2 : lumEvent,
	4 : contEvent,
	3 : preEvent,
	};

function sendTimeEvent() {
	var currentTime = new Date();
	//console.log("Minute changed = " + currentTime.getMinutes());
	//db.query("SELECT id FROM event_types WHERE name = ?", "minute", sendEvent);
	var fileLastExecution = fs.openSync("lastExecutionTimer.txt", "w");
	fs.closeSync(fileLastExecution);
	var lastExecutionStr = fs.readFileSync("lastExecutionTimer.txt", "utf8");
	var previousTime = new Date(lastExecutionStr);
	//tasks_executor.execute_task(7);

	// Year or month has changed
	if (currentTime.getFullYear() != previousTime.getFullYear() || currentTime.getMonth() != previousTime.getMonth()) {
		// All events
		eventEmitter.emit(SENSOR_EVENT, 9)
		eventEmitter.emit(SENSOR_EVENT, 8)
		eventEmitter.emit(SENSOR_EVENT, 7)
		eventEmitter.emit(SENSOR_EVENT, 6)
		eventEmitter.emit(SENSOR_EVENT, 5)
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
		eventEmitter.emit(SENSOR_EVENT, 5)
		eventEmitter.emit(SENSOR_EVENT, 8)
		eventEmitter.emit(SENSOR_EVENT, 7)
		eventEmitter.emit(SENSOR_EVENT, 6)
	}
	// Day has changed
	else if (currentTime.getDay() != previousTime.getDay()) {
		/*tasks_executor.execute_task(5);
		tasks_executor.execute_task(6);
		tasks_executor.execute_task(7);*/
		eventEmitter.emit(SENSOR_EVENT, 5)
		eventEmitter.emit(SENSOR_EVENT, 6)
		eventEmitter.emit(SENSOR_EVENT, 7)
	}
	// Hour has changed
	else if (currentTime.getHours() != previousTime.getHours()) {
		/*tasks_executor.execute_task(6);
		tasks_executor.execute_task(7);*/
		eventEmitter.emit(SENSOR_EVENT, 6)
		eventEmitter.emit(SENSOR_EVENT, 7)
	}
	// Minute has changed
	else if (currentTime.getMinutes() != previousTime.getMinutes()) {
		//tasks_executor.execute_task(7);
		eventEmitter.emit(SENSOR_EVENT, 7)
	}
/*
	// Hour changed
	if (currentTime.getHours() != previousTime.getHours()) {
		console.log("Hour changed = " + currentTime.getHours());
		tasks_executor.execute_task(6);
	}
	// Day changed
	if (currentTime.getDay() != previousTime.getDay()) {
		console.log("Day changed = " + currentTime.getDay());
		tasks_executor.execute_task(5);
	}
	// Week changed
	if (currentTime.getDay() == 1 previousTime.getDay() == 0) {
		console.log("Week changed");
		tasks_executor.execute_task(8);


	}
	// Month changed
	if (currentTime.getMonth() != previousTime.getMonth() || currentTime.getFullYear() != previousTime.getFullYear()) {
		console.log("Month changed");
		tasks_executor.execute_task(9);
	}

			
*/
	// Save date of last execution
	var fileLastExecution = fs.openSync("lastExecutionTimer.txt", "w");
	fs.writeSync(fileLastExecution, currentTime.toLocaleString(), 0, encoding='utf8');
	fs.closeSync(fileLastExecution);

}


function start(database) {
	console.log("Starting events_monitor");
	lastValues = shared_data.get_shared_data("SENSOR_VALUES");
	db = database;
	//getData(2214883, 10);
	//getData(2214883, 10);
	eventEmitter.addListener(SENSOR_EVENT, tasks_executor.execute_task)
	idTimer = setInterval(sendTimeEvent, 15000);
}

function handleEvent(frame_data) {

data = dataSensor;
console.log("Data received : " + dataSensor + "\nHardware ID sensor : " + idSensor);
db.query("SELECT id AS sensor_id, sensor_type_id FROM `"+ tables['s'] +"` WHERE hardware_id = ?", [frame_data.id], function(err, rows) {
// For every type of the sensor (a sensor can have many types)
	 for (var r in rows) {
      //console.log(rows[r]["sensors_types.name"]);
      //var sensor_type = rows[r]["sensors_types.name"];
      //var sensor_type_id = rows[r]["sensors_types.id"];
      // If sensor_type_id is associated with a function in dictSensorEvent
      type = rows[i].sensor_type_id
	  value = sensors_utils.decode_data_byte(frame_data, type)
	  sensor_id = rows[i].sensor_id
      if (type in Object.keys(dictSensorEvent)) {
      	//db.query("SELECT id FROM sensors WHERE hardware_id = ? AND sensor_type_id = ?", [idSensor, sensor_type_id], function(err, rows) {
      		for (var r in rows) {
      			var sensor_id = rows[r]["id"];
      			dictSensorEvent[type](sensor_id, type, value);
      		}
      	
      }
      
      /*var eventStr = dictEvents[sensor_type](2,5);
      db.query("SELECT id FROM event_types WHERE name = ?", eventStr, sendEvent);*/
  }
});

}

exports.start = start;
exports.handleEvent = handleEvent

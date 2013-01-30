//* Gets data parsed from sensors and check if it's associated to a real event
//* from the database

var db;
var eventTypeId;
var data;
var eventToSend;
var idTimer;
var tasks_executor = require("./tasks_executor.js");


function tempEvent(value, threshold) {
	return "temperature";
}
function lumEvent(value, threshold) {
	return "luminosity";
}
function contEvent(value, threshold) {
	return "contact";
}
function preEvent(value, threshold) {
	return "presence";
}
function timeEvent(value, threshold) {
	return "hour";
}
var dictSensorEvent = { 1 : tempEvent,
	2 : lumEvent,
	4 : contEvent,
	3 : preEvent,
	};

function sendTimeEvent() {
	var currentTime = new Date();
	console.log("Minute changed = " + currentTime.getMinutes());
	//db.query("SELECT id FROM event_types WHERE name = ?", "minute", sendEvent);
	tasks_executor.execute_task(7, currentTime.getMinutes(), null);


	if (currentTime.getMinutes() == 0) {
		console.log("Hour changed = " + currentTime.getHours());
		tasks_executor.execute_task(6, currentTime.getHours(), null);
	}
	if (currentTime.getHours() == 0) {
		console.log("Day changed = " + currentTime.getDay());
		tasks_executor.execute_task(5, currentTime.getDay(), null);
	}
}


function start(database) {
	console.log("Starting events_monitor");
	db = database;
	//getData(36, 48);
	idTimer = setInterval(sendTimeEvent, 15000);
}

function createEvent() {
	eventToSend = [eventTypeId,data];
}

function sendEvent(err, rows) {
	if (rows == null) {
	console.log("SEND EVENT");
}
	for (var r in rows) {
		console.log(rows[r]);
			eventTypeId = rows[r]["id"];
	}
	tasks_executor.execute_task(eventTypeId, 234525,sensor_id);
	/*createEvent();
	console.log(eventToSend);*/
	//Function to call from task monitor
}

function getThresholds(err, rows) {
	var thresholds = [];
	for (var r in rows) {
		thresholds.push(rows[r]["thresholds.value"]);
	}
	return thresholds;
}


function sendEventHardwareSensor(err, rows) {

	var d;
	// For every type of the sensor (a sensor can have many types)
	 for (var r in rows) {
      console.log(rows[r]["sensors_types.name"]);
      var sensor_type = rows[r]["sensors_types.name"];
      var sensor_type_id = rows[r]["sensors_types.id"];
      // If sensor_type_id is associated with a function in dictSensorEvent
      if (sensor_type_id in Object.keys(dictSensorEvent)) {
      	dictSensorEvent[sensor_type_id]();
      }
      db.query("SELECT value FROM thresholds WHERE sensor_type_id = ?", [sensor_type_id], getThresholds);
      /*var eventStr = dictEvents[sensor_type](2,5);
      db.query("SELECT id FROM event_types WHERE name = ?", eventStr, sendEvent);*/
  } 
}

function getData(idSensor, dataSensor) {

data = dataSensor;

db.query("SELECT sensors_types.name FROM (SELECT * FROM sensors WHERE sensors.hardware_id = ?) JOIN sensors_types ON sensor_type_id = sensors_types.id", idSensor, sendEventHardwareSensor);

}

exports.start = start;
exports.getData = getData

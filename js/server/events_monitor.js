//* Gets data parsed from sensors and check if it's associated to a real event
//* from the database

var db;
var eventTypeId;
var data;
var eventToSend;
var idTimer;
var tasks_executor = require("./tasks_executor.js");


function setTempEvent(value, threshold) {
	return "temperature";
}
function setLumEvent(value, threshold) {
	return "luminosity";
}
function setContEvent(value, threshold) {
	return "contact";
}
function setPreEvent(value, threshold) {
	return "presence";
}
function setTimeEvent(value, threshold) {
	return "hour";
}
var dictEvents = {"temperature":setTempEvent,
	"luminosity": setLumEvent,
	"contact": setContEvent,
	"presence": setPreEvent,
	"time": setTimeEvent};

function sendTimeEvent() {
	var currentTime = new Date();
	console.log("Minute changed = " + currentTime.getMinutes());
	db.query("SELECT id FROM event_types WHERE name = '?'", "minute", sendEvent);
	tasks_executor.execute_task(eventTypeId, currentTime.getMinutes());

	if (currentTime.getMinutes() == 0) {
		console.log("Hour changed = " + currentTime.getHours());
	}
	if (currentTime.getHours() == 0) {
		console.log("Day changed = " + currentTime.getDay());
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
	console.log("SEND EVENT");
	for (var r in rows) {
		console.log[r];
			eventTypeId = rows[r]["id"];
	}
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
	 for (var r in rows) {
      console.log(rows[r]["sensors_types.name"]);
      var sensor_type = rows[r]["sensors_types.name"];
      var sensor_type_id = rows[r]["sensors_types.id"];
      db.query("SELECT value FROM thresholds WHERE sensor_type_id = ?", [sensor_type_id], d =getThresholds);
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

//* Gets data parsed from sensors and check if it's associated to a real event
//* from the database

var db;
var eventTypeId;
var data;
var eventToSend;

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


function start(database) {
	console.log("Starting events_monitor");
	db = database;
	getData(36, 48);
}

function createEvent() {
	eventToSend = [eventTypeId,data];
}

function sendEvent(err, rows) {
	for (var r in rows) {
			eventTypeId = rows[r]["id"];
	}
	createEvent();
	console.log(eventToSend);
	//Function to call from task monitor
}

function sendEventHardwareSensor(err, rows) {
	 for (var r in rows) {
      console.log(rows[r]["sensors_types.name"]);
      var sensor_type = rows[r]["sensors_types.name"];
      var eventStr = dictEvents[sensor_type](2,5);
      db.query("SELECT id FROM event_types WHERE name = ?", eventStr, sendEvent);
  } 
}

function getData(idSensor, dataSensor) {

data = dataSensor;
db.query("SELECT sensors_types.name FROM (SELECT * FROM sensors WHERE sensors.hardware_id = ?) JOIN sensors_types ON sensor_type_id = sensors_types.id", idSensor, sendEventHardwareSensor);

}

exports.start = start;
exports.getData = getData

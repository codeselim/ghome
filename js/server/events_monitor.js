//* Gets data parsed from sensors and check if it's associated to a real event
//* from the database

var db;
var eventTypeId;
var data;
var eventToSend;
var idTimer;
var tasks_executor = require("./tasks_executor.js");
var shared_data = require("./shared_data.js");
// Map with last values of each sensor {id : value, ...}
var lastValues;


function checkThresholds(idSensor, sensor_type_id, value) {

	db.query("SELECT value FROM thresholds WHERE sensor_type_id = ?", [sensor_type_id], function(err, rows) {
		var thresholds = [];
		for (var r in rows) {
			thresholds.push(rows[r]["thresholds.value"]);
		}

		for (t in thresholds) {
			if (lastValues[idSensor] < threshold && value > threshold) {
		tasks_executor.execute_task(1, value, idSensor);
	}    
	if (lastValues[idSensor] > threshold && value < threshold) {
		tasks_executor.execute_task(2, value, idSensor);
	}

	}
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
		tasks_executor.execute_task(3, value, idSensor);
	}

	// Contact removed
	if(value == 0) {
		tasks_executor.execute_task(4, value, idSensor);
	}

}
function preEvent(idSensor, sensor_type_id, value) {
	//return "presence";
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
	tasks_executor.execute_task(7, "10", -1);


	if (currentTime.getMinutes() == 0) {
		console.log("Hour changed = " + currentTime.getHours());
		tasks_executor.execute_task(6, currentTime.getHours(), -1);
	}
	if (currentTime.getHours() == 0) {
		console.log("Day changed = " + currentTime.getDay());
		tasks_executor.execute_task(5, currentTime.getDay(), -1);
	}
}


function start(database) {
	console.log("Starting events_monitor");
	lastValues = shared_data.get_shared_data("SENSOR_VALUES");
	db = database;
	getData(2214883, 10);
	getData(2214883, 10);
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


function getData(idSensor, dataSensor) {

data = dataSensor;
console.log("Data received : " + dataSensor + "\nHardware ID sensor : " + idSensor);
db.query("SELECT sensors_types.name FROM (SELECT * FROM sensors WHERE sensors.hardware_id = ?) JOIN sensors_types ON sensor_type_id = sensors_types.id", idSensor, function(err, rows) {
// For every type of the sensor (a sensor can have many types)
	 for (var r in rows) {
      console.log(rows[r]["sensors_types.name"]);
      var sensor_type = rows[r]["sensors_types.name"];
      var sensor_type_id = rows[r]["sensors_types.id"];
      // If sensor_type_id is associated with a function in dictSensorEvent
      if (sensor_type_id in Object.keys(dictSensorEvent)) {
      	db.query("SELECT id FROM sensors WHERE hardware_id = ? AND sensor_type_id = ?", [idSensor, sensor_type_id], function(err, rows) {
      		for (var r in rows) {
      			var sensor_id = rows[r]["id"];
      			dictSensorEvent[sensor_type_id](sensor_id, sensor_type_id, dataSensor);
      		}

      	})
      	
      }
      
      /*var eventStr = dictEvents[sensor_type](2,5);
      db.query("SELECT id FROM event_types WHERE name = ?", eventStr, sendEvent);*/
  }
});

}

exports.start = start;
exports.getData = getData

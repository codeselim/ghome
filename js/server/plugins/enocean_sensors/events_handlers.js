"use strict"
var eventsMonitor = require('../../events_monitor')
var checkThresholds = eventsMonitor.checkThresholds
var eventEmitter = eventsMonitor.eventEmitter
var shared_data = require('../../shared_data')
var SENSOR_EVENT = eventsMonitor.SENSOR_EVENT

function tempEvent(idSensor, sensor_type_id, value) {
	checkThresholds(idSensor, sensor_type_id, value);
}
function lumEvent(idSensor, sensor_type_id, value) {
	checkThresholds(idSensor, sensor_type_id, value);
}
function contEvent(idSensor, sensor_type_id, value) {
	// Contact performed
	if(value == 1) {
		eventEmitter.emit(SENSOR_EVENT, 3, idSensor);
	}

	// Contact removed
	if(value == 0) {
		eventEmitter.emit(SENSOR_EVENT, 4, idSensor);
	}

	shared_data.get_shared_data("SENSORS_VALUES")[idSensor] = value;

}
function preEvent(idSensor, sensor_type_id, value) {
	// Occupancy PIR ON
	if (value == 0) {
		//tasks_executor.execute_task(10);
		eventEmitter.emit(SENSOR_EVENT, 10, idSensor);
	}
	// Occupancy PIR OFF
	if (value == 1) {
		//tasks_executor.execute_task(11);
		eventEmitter.emit(SENSOR_EVENT, 11, idSensor);
	}

	shared_data.get_shared_data("SENSORS_VALUES")[idSensor] = value;
}

function switchEvent(idSensor, sensor_type_id, value) {
	// console.log("VALUE SWITCH :", value)
	switch(value) {

		case 1:
		// Bouton interr droit haut
		eventEmitter.emit(SENSOR_EVENT, 14, idSensor)
		break

		case 2:
		// Bouton interr droit bas
		eventEmitter.emit(SENSOR_EVENT, 15, idSensor)
		break

		case 3:
		// Bouton interr gauche haut
		eventEmitter.emit(SENSOR_EVENT, 12, idSensor)
		break

		case 4:
		// Bouton interr gauche bas
		eventEmitter.emit(SENSOR_EVENT, 13, idSensor)
		break

		default:
		break
	}
}


eventsMonitor.addEventHandler(1, tempEvent)
eventsMonitor.addEventHandler(2, lumEvent)
eventsMonitor.addEventHandler(4, contEvent)
eventsMonitor.addEventHandler(3, preEvent)
eventsMonitor.addEventHandler(8, switchEvent)
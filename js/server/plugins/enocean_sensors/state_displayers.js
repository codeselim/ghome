"use strict"

//* This file contains functions that translate raw state value to human readable sensors states

function simpleTranslate (raw_value) {
	if (raw_value) {
		return raw_value.toString()
	}
	return 'Pas de donnée'
}

function toTemp (raw_value) {
		return parseFloat(raw_value).toFixed(1) + ' °C'
}

function boolTranslator (raw_value) {
	if (raw_value == '0') {
		raw_value = 0
	}
	if (raw_value) {
		return "ON"
	} else {
		return "OFF"
	}
}

function toSwitch(blorg) {
	return ""
}



/**  This function returns the CSS temperature color to be applied to a given
 * temperature depending on its value
 * For instance, -2 would be blue, 25 would be green, 32 would be red...
 * @param{int} temperature_value The temperature value (signed integer)
 * @return{string} Color name to be used in the CSS class ("{COLOR}-temp")
 */
var temperatureStyle = function temperatureStyle(temperature_value) {
	var color = ''
	if (temperature_value >= 32) {
		var color = 'toohot'
	} else if (temperature_value >= 25) {
		var color = 'warmer'
	} else if (temperature_value >= 19) {
		var color = 'warm'
	} else if (temperature_value >= 10) {
		var color = 'quitewarm'
	} else if (temperature_value >= 5) {
		var color = 'quitecold'
	} else if (temperature_value >= 0) {
		var color = 'cold'
	} else if (temperature_value >= -5) {
		var color = 'colder'
	} else if (temperature_value <= -10) {
		var color = 'freezing'
	}
	return color
}

//* Registering them in the system
var sutils = require('../../sensors')
sutils.addStateDisplayer(1, toTemp)
sutils.addStateDisplayer(2, simpleTranslate)
sutils.addStateDisplayer(3, boolTranslator)
sutils.addStateDisplayer(4, boolTranslator)
sutils.addStateDisplayer(5, boolTranslator) // electric switch plug
sutils.addStateDisplayer(8, toSwitch)


sutils.addStyleComputer(1, temperatureStyle)
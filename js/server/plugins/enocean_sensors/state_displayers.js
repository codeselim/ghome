//* This file contains functions that translate raw state value to human readable sensors states

function simpleTranslate (raw_value) {
	return raw_value.toString()
}

function toTemp (raw_value) {
	return parseFloat(raw_value).toFixed(1)
}

function boolTranslator (raw_value) {
	if (raw_value) {
		return "ON"
	} else {
		return "OFF"
	}
}

function toSwitch(blorg) {
	return ""
}


//* Registering them in the system
var sutils = require('../../sensors')
sutils.addStateDisplayer(1, toTemp)
sutils.addStateDisplayer(2, simpleTranslate)
sutils.addStateDisplayer(3, boolTranslator)
sutils.addStateDisplayer(4, boolTranslator)
sutils.addStateDisplayer(5, boolTranslator)
sutils.addStateDisplayer(8, toSwitch)

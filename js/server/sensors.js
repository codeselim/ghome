"use strict"

//* Library of sensors-related functions

//* States's displayers dictionary, used register them and to call them
var stateDisplayers = {}

/**
 * Function to parse a slice of the str as an hexadecimal number
 * @param {string} str The string to be considered (at least locally) as an hexadecimal number
 * @param {unsigned int} start : Start of the slice, 0-indexed
 * @param {unsigned int} length : Length of the slice
 * @returns {int} Slice parsed as an hexadecimal number
*/
function parseIntFromHexSlice(str, start, length) {
	return parseInt(str.substr(start, length), 16);
}

/**
 * Function to decode a network frame from a enOcean sensor
 * @param {string} frame
 * @returns {array} Array of the data inside the frame. The array is organized that way:
 * @todo complete that documentation
*/
function decode_frame (frame) {
	var result = {};
	//* In the order of the documenation table :
	result["hseq_length"] = parseIntFromHexSlice(frame, 4, 2)
	result["org"] = parseIntFromHexSlice(frame, 6, 2)
	result["data"] = [parseIntFromHexSlice(frame, 8, 2), parseIntFromHexSlice(frame, 10, 2), parseIntFromHexSlice(frame, 12, 2), parseIntFromHexSlice(frame, 14, 2)];
	result["id"] = parseIntFromHexSlice(frame, 16, 8)
	result["status"] = parseIntFromHexSlice(frame, 24, 2)
	result["checksum"] = parseIntFromHexSlice(frame, 26, 2)
	
	return result;
}

/**
 * Function the type of the sensor and the detected value
 * @param{int} type_s the type of the sensor (software type, from the db)
 * @param {array} frame_data of the data inside the frame
 *        {integer} type_s  type of sensor
 * @returns {value} the value detected by the sensor
*/
function decode_data_byte (type_s, frame_data) {
	console.log("ENTERING DECODE DATA BYTE")
	switch (type_s) {
		case 1 ://temperature
			var value = Math.abs((frame_data.data[2] * 40 /255) - 40 ) ;//temperature sensor
			return value;
		case 2 ://light
			var value = frame_data.data[1] * 510 / 255;//luminosity value
			return value;
		case 3 ://presence
			var value = frame_data.data[3] & 2;
			return value;
		case 4 ://contact
			var value = frame_data.data[3] & 1;
			return value;
		case 5 : //electricity : value of power consumption in a minute in Wh
			var value = parseFloat (frame_data.data[2]+"."+frame_data.data[3]);
			   //value of power consumption in a minute in Wh

		case 8 : //switch
			switch (frame_data.data[0] >> 4){
				case 1 : 
				 	return 1; //top right
				 case 3 :
				 	return 2; // bottom right
				 case 5 :
				 	return 3; // top left
				 case 7 :
				 	return 4; //bottom left
				 default:
				 return 0;
			

			}
			break
		default:
			return -1
	}
}

function check_frame_checksum (frame_data, framestr) {
	//* Note: The checksum is the least significat Byte of the sum of all the values except the sync bytes (the "separator") and the checksum itself
	var s = 0
	for (var i = framestr.length - 3; i >= 4; i -= 2) {
		s += parseIntFromHexSlice(framestr, i-1, 2)
	};
	// s = (frame_data.hseq_length + frame_data.org + frame_data.data[0] + frame_data.data[1] + frame_data.data[2] + frame_data.data[3] + frame_data.id + frame_data.status)
	console.log("Sum:", s)
	var checksum = s & 0xFF 
	console.log("Computed checksum:", checksum)
	return (checksum == frame_data.checksum)

}

function getDisplayableState (typeId, value) {
	if (typeId in stateDisplayers) {
		return stateDisplayers[typeId](value)
	} else {
		// return 'Unable to get the sensor\'s state'
		return 'Pas de données'
	}
}

/** Used to register a stateDisplayer. That is to say, a function that will, depending on the raw value from the device/sensor, return a state string that we can display to the user
 * @param{int} typeId
 * @param{function} stateDisplayer
*/
function addStateDisplayer (typeId, stateDisplayer) {
	if (typeId in stateDisplayers) {
		console.error("SENSORS: Error, trying to override an existing stateDisplayer")
	} else {
		stateDisplayers[typeId] = stateDisplayer
	}
}

function generate_json_devices_list_from_sql_rows (rows) {
	var sensor_type_id = -42
	var number_of_rows = 0
	var deviceTypes = []
					
	for (var r in rows) {
		if(sensor_type_id != rows[r].sensor_type_id) {	
			var sensor_type_id = rows[r].sensor_type_id
			deviceTypes.push({label: rows[r].name.trim(), id: sensor_type_id, devices: [{label: rows[r].device_name.trim(), id: rows[r].id, type: rows[r].sensor_type_id}]})
		} else {
			deviceTypes[deviceTypes.length-1].devices.push({label: rows[r].device_name.trim(), id: rows[r].id, type: rows[r].sensor_type_id})
		} 
	}
	return deviceTypes
}

function generate_json_get_actions_by_device_type(rows){
	var number_of_rows = 0
	var actions = {}
	for(var i in rows) {
		actions[rows[i].name.trim()] = rows[i].id
	}
	return actions
}

exports.decode_frame = decode_frame
exports.check_frame_checksum = check_frame_checksum
exports.decode_data_byte = decode_data_byte
exports.generate_json_devices_list_from_sql_rows = generate_json_devices_list_from_sql_rows
exports.generate_json_get_actions_by_device_type = generate_json_get_actions_by_device_type
exports.getDisplayableState = getDisplayableState
exports.addStateDisplayer = addStateDisplayer
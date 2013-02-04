//* Library of sensors-related functions

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
 * @param {array} frame_data of the data inside the frame
 *        {integer} type_s  type of sensor
 * @returns {array} Array containig the type of the sensor (temperature or light sensor)
 * and the value detected by the sensor
*/
function decode_data_byte (type_s, frame_data) {
	switch (type_s) {
		case 1 ://temperature
			value = Math.abs((frame_data.data[2] * 40 /255) - 40 ) ;//temperature sensor
			return value;
		case 2 ://light
			value = frame_data.data[1] * 510 / 255;//luminosity value
			return value;
		case 3 ://presence
			value = frame_data.data[3] & 2;
			return value;
		case 4 ://contact
			value = frame_data.data[3] & 1;
			return value;
		case 5 : //electricity : value of power consumption in a minute in Wh
			value = parseFloat (frame_data.data[2]+"."+frame_data.data[3]);
			   //value of power consumption in a minute in Wh
			return value;
		default:
			return null;
	}
}
	


function check_frame_checksum (frame_data, framestr) {
	//* Note: The checksum is the least significat Byte of the sum of all the values except the sync bytes (the "separator") and the checksum itself
	s = 0
	for (var i = framestr.length - 3; i >= 4; i -= 2) {
		s += parseIntFromHexSlice(framestr, i-1, 2)
	};
	// s = (frame_data.hseq_length + frame_data.org + frame_data.data[0] + frame_data.data[1] + frame_data.data[2] + frame_data.data[3] + frame_data.id + frame_data.status)
	console.log("Sum:", s)
	checksum = s & 0xFF 
	console.log("Computed checksum:", checksum)
	return (checksum == frame_data.checksum)

}


function generate_json_devices_list_from_sql_rows (rows) {
	var sensor_type_id = -1
	var number_of_rows = 0
	var deviceTypes = ''
					
	for (var r in rows) {
		if(sensor_type_id != rows[r].sensor_type_id) {	
			sensor_type_id = rows[r].sensor_type_id
			deviceTypes += ']},'
			deviceTypes += '{"label" : "'+rows[r].name.trim()+'", "devices" : [ '    
			deviceTypes += '{"label" : "'+rows[r].device_name.trim()+'", "value" : "'+rows[r].hardware_id+'", "type" : "'+rows[r].sensor_type_id+'"}'   //value  is the id of the device
		} else {
			deviceTypes += ',{"label" : "'+rows[r].device_name.trim()+'", "value" : "'+rows[r].hardware_id+'", "type" : "'+rows[r].sensor_type_id+'"}'
		} 
		number_of_rows++
	}
	if(number_of_rows) {
		var temp = '['  //	temp =  '"deviceTypes" : ['
		temp += deviceTypes.substr(3) //pour enlever les premier  ]},
		temp += ']}  ]'
		deviceTypes = JSON.parse(temp)
	} else {
		deviceTypes = []
	}
	return deviceTypes
}

exports.decode_frame = decode_frame
exports.check_frame_checksum = check_frame_checksum
exports.decode_data_byte = decode_data_byte
exports.generate_json_devices_list_from_sql_rows = generate_json_devices_list_from_sql_rows
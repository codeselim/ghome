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
	result["hseq"] = parseIntFromHexSlice(frame, 4, 2)
	result["org"] = parseIntFromHexSlice(frame, 6, 2)
	result["data"] = [parseIntFromHexSlice(frame, 8, 2), parseIntFromHexSlice(frame, 10, 2), parseIntFromHexSlice(frame, 12, 2), parseIntFromHexSlice(frame, 14, 2)];
	result["id"] = parseIntFromHexSlice(frame, 16, 8)
	result["status"] = parseIntFromHexSlice(frame, 24, 2)
	result["checksum"] = frame.substr(26, 2)
	
	return result;
}

exports.decode_frame = decode_frame
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
	result["hseq"] = parseIntFromHexSlice(frame, 3, 2)
	result["org"] = parseIntFromHexSlice(frame, 5, 2)
	result["data"] = [parseIntFromHexSlice(frame, 7, 2), parseIntFromHexSlice(frame, 9, 2), parseIntFromHexSlice(frame, 11, 2), parseIntFromHexSlice(frame, 13, 2)];
	result["id"] = parseIntFromHexSlice(frame, 15, 8)
	result["status"] = parseIntFromHexSlice(frame, 23, 2)
	result["checksum"] = frame.substr(25, 2)
	result["hseq"] = parseIntFromHexSlice(frame, 3, 2)
	return result;
}

exports.decode_frame = decode_frame
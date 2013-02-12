//* Small JS "upgrade"
var ArrayRemove = function(a, value) { 
	var index = -1
	if (-1 != (index = a.indexOf(value))) {
		a.splice(index, 1); 
	}
	return a
}

/**
 * This function returns the current local system "public" ip address (still the LAN one, not the Internet one)
 * @param{Array} authorizedInterfaces an array of the authorized interfaces names to be searched for an IP
 * @returns{String} the IP Address found or 127.0.0.1 if no address was found
*/

function getLocalPublicIpAddress (authorizedInterfaces) {
	var os = require('os')
	var interfaces = os.networkInterfaces();
	for (k in interfaces) {
		for (k2 in interfaces[k]) {
			var address = interfaces[k][k2];
			if (address.family == 'IPv4' && !address.internal && -1 != authorizedInterfaces.indexOf(k)) {
				return address.address
			}
		}
	}
	return '127.0.0.1' // Return localhost if nothing is found
}

exports.ArrayRemove = ArrayRemove
exports.getLocalPublicIpAddress = getLocalPublicIpAddress
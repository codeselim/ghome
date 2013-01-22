//* This module is aimed to make variables sharing easy among all the servers modules

var shared_data = {}

function get_shared_data (data_name) {
	return shared_data[data_name]
}

function set_shared_data (data_name, data_value) {
	shared_data[data_name] = data_value
}


exports.get_shared_data = get_shared_data
exports.set_shared_data = set_shared_data
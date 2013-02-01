//* Logger module, Model to log frames data into the database

var shared = require('./shared_data')
var get_shared_data = shared.get_shared_data
var set_shared_data = shared.set_shared_data
var sensors_utils = require('./sensors')
/**
 * Initilization 
 */
var db;
var tables = get_shared_data('SQL_TABLES');  //var tables : contains the dictionary for the tables names 

function start(database) {
	db = database;
}

function insertLog(frame_data) {
	// First, check if this frame might be containing or not multiple values information (when sensors can monitor for multiple dimmensions)
	db.query("SELECT id AS sensor_id, sensor_type_id FROM `"+ tables['s'] +"` WHERE hardware_id = ?", [frame_data.id], function (err, rows) {
		if (null == err) {// if no error
			for(i in rows) {
				type = rows[i].sensor_type_id
				value = sensors_utils.decode_data_byte(frame_data, type)
				db.query("INSERT INTO " + tables.l + " VALUES (?, ?, ?, datetime() )", ["NULL", rows[i].sensor_id, value], function (err, rows){
					if(err) {
						console.error("[INSERT_LOG_ERROR] : " + err)
					}
				});
			}
		};
	})
}


exports.start = start
exports.insertLog = insertLog
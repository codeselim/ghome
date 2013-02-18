"use strict"
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

function insertLogWithDevAndValue (devId, newValue, callback) {
	db.insert_query("INSERT INTO " + tables.l + " VALUES (NULL, ?, ?, datetime() )", [devId, newValue], function (err){
		if(err) {
			console.error("[INSERT_LOG_ERROR] : " + err)
		}
		if (null != callback) {
			callback(this.lastID)
		}
	});
}

function insertLog(frame_data) {
	// First, check if this frame might be containing or not multiple values information (when sensors can monitor for multiple dimmensions)
	db.select_query("SELECT id AS sensor_id, sensor_type_id FROM `"+ tables['s'] +"` WHERE hardware_id = ?", [frame_data.id], function (err, rows) {
		if (null == err) {// if no error
			for(var i in rows) {
				var type = rows[i].sensor_type_id
				var value = sensors_utils.decode_data_byte(type, frame_data)
				var devId = rows[i].sensor_id
				insertLogWithDevAndValue(devId, value, null)
			}
		};
	})
}


exports.start = start
exports.insertLog = insertLog
exports.insertLogWithDevAndValue = insertLogWithDevAndValue
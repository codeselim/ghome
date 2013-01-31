//* Logger module, Model to log frames data into the database

var shared = require('./shared_data')
var get_shared_data = shared.get_shared_data
var set_shared_data = shared.set_shared_data

/**
 * Initilization 
 */
var db;
var tables = get_shared_data('SQL_TABLES');  //var tables : contains the dictionary for the tables names 

function start(database) {
	db = database;
}

function insertLog(data) {
    db.query("INSERT INTO " + tables.l + " VALUES (?, ?, ?, datetime() )", [null, data.sensor_id, data.value], function (err, rows){
 		if(err) {
 			console.error("[INSERT_LOG_ERROR] : " + err)
 		}
	});
}


exports.start = start
exports.insertLog = insertLog
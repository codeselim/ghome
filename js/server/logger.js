//* Logger module, Model to log frames data into the database

var shared = require('./shared_data')
var get_shared_data = shared.get_shared_data
var set_shared_data = shared.set_shared_data

/**
 * Initilization 
 */
var db;
//var tables = get_shared_data('SQL_TABLES'); 

function start(database) {
	db = database;
}

function insertLog(data) {
    var tables = get_shared_data('SQL_TABLES'); 
	console.log(tables);
// 	db.query("INSERT INTO logs values (? , ? , ? , datetime() )", [null, data.sensor_id, data.value], function (err, rows){
// 		if(err) console.log("[INSERT_LOG_ERROR] : "+err)
// 		else console.log("[INSERT_LOG_OKAY]")
//	});
}


exports.start = start
exports.insertLog = insertLog
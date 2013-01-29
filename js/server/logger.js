//* Logger module, Model to log frames data into the database


/**
 * Initilization 
 */
var db;

function start(database) {
	db = database;
}

function insertLog(data) {
	db.query("INSERT INTO logs values (? , ? , ? , datetime() )", [null, data.sensor_id, data.value], function (err, rows){
		if(err) console.log("[INSERT_LOG_ERROR] : "+err)
		else console.log("[INSERT_LOG_OKAY]")
	});
}


exports.start = start
exports.insertLog = insertLog
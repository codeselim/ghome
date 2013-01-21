
var sqlite3 = require('sqlite3').verbose();
var db;
var dName;
function connect(dbName) {
	dName = dbName;
	db = new sqlite3.Database("databases/"+dbName+".db");
	console.log("Database " + dbName + " opened");
}

function query(query_str, parameters, callback_func) {
	var statement = db.prepare(query_str);
	statement.all(parameters, callback_func);
	statement.finalize();
	console.log("Query : " + query_str + "performed");
}

function disconnect() {
	db.close();
	console.log("Database " + dName + " closed");
}

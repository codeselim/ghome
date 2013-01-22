
var sqlite3 = require('sqlite3').verbose();
var db;
var dName;

function cbSuccess(msg) {
	console.log("TEST");
	console.log(msg);
	query("SELECT * FROM logs", [], test);
	disconnect();
}
function connect(dbName) {
	dName = dbName;
	db = new sqlite3.Database("../../sql"+dbName+".db", cbSuccess);
	console.log("Database " + dbName + " opened");
}

function query(query_str, parameters, callback_func) {
	db.serialize(function() {
	var statement = db.prepare(query_str);
	statement.all(parameters, callback_func);
	statement.finalize();});

	console.log("Query : " + query_str + "performed");
}

function disconnect() {
	db.close();
	console.log("Database " + dName + " closed");
}

function test(err, rows) {
console.log("Callback called");
}

connect("dat");
/*query("INSERT INTO sensors_types VALUES(?)", ["null", "newType"], test);
disconnect();*/
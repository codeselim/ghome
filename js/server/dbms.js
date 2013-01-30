var sqlite3 = require('sqlite3').verbose();

function Database() {
	this.db = null
	this.dName = null
}

Database.prototype.connect = function(dbName, callback) {
	dName = dbName;
	db = new sqlite3.Database("../../sql/"+dbName+".db", callback);
}

Database.prototype.query = function(query_str, parameters, callback_func) {
	db.serialize(function() {
		var statement = db.prepare(query_str);
		statement.on("error", function (err) {
			callback_func(err, null) // Passing the error to the callback, and null as result
		});
		statement.all(parameters, callback_func);
		statement.finalize();	
	});
}

Database.prototype.disconnect = function() {
	db.close();
}

exports.Database = Database


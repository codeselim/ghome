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
		statement.all(parameters, callback_func);
		statement.finalize();	
	});
}

Database.prototype.disconnect = function() {
	db.close();
}

exports.Database = Database

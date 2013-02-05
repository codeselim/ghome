var sqlite3 = require('sqlite3').verbose();
var DBG = true // @TODO set that to false before going to production

function Database() {
	this.db = null
	this.dName = null
}

Database.prototype.connect = function(dbName, callback) {
	dName = dbName;
	db = new sqlite3.Database("../../sql/"+dbName+".db", callback);
}

Database.prototype.select_query = function(query_str, parameters, callback_func) {
	this.prepare_statement(query_str, parameters, function (statement, params) {
		statement.all(params, callback_func);
		statement.finalize();
	})	
}

Database.prototype.insert_query = function (query_str, parameters, callback_func) {
	this.prepare_statement(query_str, parameters, function (statement, params) {
		statement.run(params, callback_func)
	})
}

Database.prototype.prepare_statement = function(query_str, parameters, spec_func) {
	db.serialize(function() {
		var statement = db.prepare(query_str);
		statement.on("error", function (err) {
			if (DBG) {
				console.error("SQL: An error occured when executing query \n" + query_str + "\nSQL Error is \n" + err)
			};
			callback_func(err, null) // Passing the error to the callback, and null as result
		});
		
		if(null == parameters) {
			parameters = {}
		}
		spec_func(statement, parameters)
	});
}

Database.prototype.disconnect = function() {
	db.close();
}

exports.Database = Database


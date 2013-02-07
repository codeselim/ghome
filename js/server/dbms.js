"use strict"

var sqlite3 = require('sqlite3').verbose();
var DBG = true // @TODO set that to false before going to production

function Database() {
	this.db = null
	this.dName = null
}

Database.prototype.connect = function(dbName, callback) {
	this.dName = dbName;
	this.db = new sqlite3.Database("../../sql/"+dbName+".db", callback);
	if (DBG) {
		this.db.on("trace", function (str) {
			console.log("DBMS TRACE: ", str)
		})
	};
	this.select_query("PRAGMA foreign_keys = ON;", null, function () {})
}

Database.prototype.select_query = function(query_str, parameters, callback_func) {
	this.prepare_statement(query_str, parameters, function (statement, params) {
		statement.all(params, callback_func);
		statement.finalize();
	})	
}

Database.prototype.insert_query = function (query_str, parameters, callback_func) {
	this.prepare_statement(query_str, parameters, function (statement, pa) {
		statement.run(pa, callback_func)
		statement.finalize()
	})
}

Database.prototype.update_query = function (query_str, parameters, callback_func) {
	this.prepare_statement(query_str, parameters, function (statement, pa) {
		statement.run(pa, callback_func)
		statement.finalize()
	})
}

Database.prototype.prepare_statement = function(query_str, parameters, spec_func) {
	var self = this
	this.db.serialize(function() {
		var statement = self.db.prepare(query_str);
		statement.on("error", function (err) {
			if (DBG) {
				console.error("DBMS: An error occured when executing query \n" + query_str + "\nSQL Error is \n" + err)
			};
			spec_func(err, null) // Passing the error to the callback, and null as result
		});

		if(null == parameters) {
			var parameters = {}
		}
		spec_func(statement, parameters)
	});
}

Database.prototype.disconnect = function() {
	this.db.close();
}

exports.Database = Database


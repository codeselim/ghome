var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('test.sqlite');

db.serialize(function() {
	db.run("DROP TABLE lorem")
	db.run("CREATE TABLE IF NOT EXISTS lorem (info TEXT)");

	var c = 0 // Current count of rows in the table...
	db.get("SELECT COUNT(*) AS c FROM lorem", function (e, r) {
		c = r.c
		console.log("Current count of rows in the table is : " + JSON.stringify(r))

		var stmt = db.prepare("INSERT INTO lorem VALUES (?)");
		for (var i = c; i < c+10; i++) {
			str = "Ipsum " + i
			console.log("Preparing insertion of: " + str)
			stmt.run(str);
		}
		stmt.finalize(function (e, r) {
			db.all("SELECT rowid AS id, info FROM lorem", function(err, rows) {
				for(var row in rows) {
					console.log(rows[row].id + ": " + rows[row].info);	
				}				
				db.close();
			});
		});

	})
	// console.log("Current count of rows in the table is : " + JSON.stringify(c))

	
});


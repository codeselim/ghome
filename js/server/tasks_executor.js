var db;

function make_action(err, rows) {
	 for (var r in rows) {
      console.log(rows[r]["action_type_id"]);
  } 
}

function start (database){
	db = database;
}

function execute_task(event_id, value) {

	var date= new Date()
	var month = date.getMonth()
	var day = date.getDay()
	var hour = date.getHours()
	/*var day = date.getDate().toString() // put day in the DB formalism
	if (day.length < 2){
		day = "0" + day
	}

	console.log(day)
	console.log(day.length)*/

	db.query("SELECT action_type_id FROM Tasks AS t, conditions AS c, condition_types AS ct WHERE t.id = c.task_id AND ct.id = c.type_id AND event_type_id = ? AND " + month + " < max_month AND " + month + " > min_month AND "
		+ day + " < max_day AND " + day + " > min_day AND " + hour + " < max_hour AND " + hour + " > min_hour"
		, [event_id], make_action)
}

exports.execute_task = execute_task
exports.start = start
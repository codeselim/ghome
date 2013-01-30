var db;
var sensors_server = require("./sensors_server.js");
var sse_sender = require("./sse_sender.js");

function switch_on_plug(){
	sensors_server.send_to_sensor(null, sensors_server.PLUG_SWITCH_ON_FRAME)
}

function switch_off_plug(){
	sensors_server.send_to_sensor(null, sensors_server.PLUG_SWITCH_OFF_FRAME)
}

function make_action(results) { //this function will make the actions of results
	 for (var r in results) {
      switch(results[r]){
      	case 1 :
      	switch_on_plug();
      	sse_sender.sendSSE({"msg" : "Prise allumée"});
      	break;
      	case 2 :
      	switch_off_plug();
      	sse_sender.sendSSE({"msg" : "Prise éteinte"});
      	break;
      	case 3 :
      	switch_off_plug();
      	sse_sender.sendSSE({"msg" : "Volets ouverts"});
      	break;
      	case 4 :
      	switch_off_plug();
      	sse_sender.sendSSE({"msg" : "Volets fermés"});
      	break;
      	default :
      	sse_sender.sendSSE({"msg" : "Rien du tout"});
      	break;
      }
  } 
}

function start (database){
	db = database;
}

function execute_task(event_id, value, sensor_id) {//this function will search the good actions to do and call make_action with the results in order to make the action effective

	var date= new Date()
	var month = date.getMonth()
	var day = date.getDay()
	var hour = date.getHours()
	var results = new Array();
	//console.log(event_id)

	//We get the action type id and the operator from the candidate actions (actions wich are in the right timer for being candidate)
	db.query("SELECT action_type_id, operator, value_to_compare FROM Tasks AS t, conditions AS c, condition_types AS ct WHERE t.id = c.task_id AND ct.id = c.type_id AND event_type_id = ? AND " + month + " <= max_month AND " + month + " >= min_month AND "
		+ day + " <= max_day AND " + day + " >= min_day AND " + hour + " <= max_hour AND " + hour + " >= min_hour AND sensor_id = ?"
		, [event_id, sensor_id], function (err, rows) { //now we select the proper actions with the operator 
			for (var r in rows){
				switch (rows[r]["operator"]){
					case 1 : // if operator = "="
					if (rows[r]["value_to_compare"] == value){
						results.push(rows[r]["action_type_id"]);
					}
					break;
					case 2 :  // if operator = "<"
					if (rows[r]["value_to_compare"] < value){
						results.push(rows[r]["action_type_id"]);
					}
					break;
					case 3 : // if operator = ">"
					if (rows[r]["value_to_compare"] > value){
						results.push(rows[r]["action_type_id"]);
					}
					break;
					case 4 : // if operator = "<="
					case 7 : // if operator = "passage de seuil bas"
					if (rows[r]["value_to_compare"] <= value){
						results.push(rows[r]["action_type_id"]);
					}
					break;
					case 5 : // if operator = ">="
					case 6 : // if operator = "passage de seuil haut"
					if (rows[r]["value_to_compare"] >= value){
						results.push(rows[r]["action_type_id"]);
					}
					break;
					default :
					break;
				}
			}
			make_action(results);
		})
}

exports.execute_task = execute_task
exports.start = start
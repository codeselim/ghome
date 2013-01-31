var db;
var sensors_server = require("./sensors_server.js");
var sse_sender = require("./sse_sender.js");
var shared = require('./shared_data')
var get_shared_data = shared.get_shared_data
var sensors_values = {}

function switch_on_plug(){
}

function switch_off_plug(){
}

function make_action(results) { //this function will execute the actions of results
	console.log("rentrée dans make action")
	 for (var r in results) {
	 	console.log(results[r])
      switch(results[r]){
      	case 1 :      //if command is "allumer prise"
      	console.log("action allumer prise !");
      	switch_on_plug();
      	sse_sender.sendSSE({"msg" : "Prise allumée"});
      	break;
      	case 2 :     //if command is "eteindre prise"
      	switch_off_plug();
      	sse_sender.sendSSE({"msg" : "Prise éteinte"});
      	break;
      	case 3 :     //if commande is "ouvrir volets"
      	switch_off_plug();
      	sse_sender.sendSSE({"msg" : "Volets ouverts"});
      	break;
      	case 4 :     //if command is "fermer volets"
      	switch_off_plug();
      	sse_sender.sendSSE({"msg" : "Volets fermés"});
      	break;
      	default :     //if not in the results (very very improbable)
      	sse_sender.sendSSE({"msg" : "Rien du tout"});
      	break;
      }
  } 
}

function start (database){
	db = database;
	sensors_values = get_shared_data('SENSORS_VALUES');
}

function execute_task(event_id) {//this function will search the good actions to do and call make_action with the results in order to make the action effective

	var date= new Date()
	var month = date.getMonth()
	var day = date.getDay()
	var hour = date.getHours()
	var results = new Array();
	var value = null;
	var actions_type = {}
	console.log("event id :")
	console.log(event_id)

	//We get the action type id, the operator, the value to compare and the sensor_id from the candidate actions (actions wich are in the right timer for being candidate)
	db.query("SELECT action_type_id, operator, value_to_compare, sensor_id FROM Tasks AS t INNER JOIN conditions AS c ON c.task_id = t.id INNER JOIN condition_types AS ct ON ct.id = c.type_id WHERE event_type_id = ? AND "
			+ month + " <= max_month AND " + month + " >= min_month AND "
			+ day + " <= max_day AND " + day + " >= min_day AND "
			+ hour + " <= max_hour AND " + hour + " >= min_hour"
			, [event_id], function (err, rows) { //now we select the proper actions with the operator
				for (var r in rows) { //creation of a dictionnaire where we put all the candidate actions
					actions_type[rows[r]["action_type_id"]] = true; 
				}
				for (var r in rows){
					value = sensors_values[rows[r]["sensor_id"]];//we catch the value corresponding to the current sensor

					for(bla in sensors_values){
						console.log("blah :",bla);
						console.log(rows[r]["sensor_id"]);
					}

					console.log("nan ? :", sensors_values[rows[r]["sensor_id"]])
					switch (rows[r]["operator"]){
						case 1 : // if operator = "="
						console.log("operateur est égal à égal")
						console.log(rows[r]["value_to_compare"], parseInt(value))
						if (parseInt(rows[r]["value_to_compare"]) != parseInt(value)){ //if we have the contrary of the operator, that means that the action have at least one condition wich is not respected, and we can't execute the action
							actions_type[rows[r]["action_type_id"]] = false; //so we put the corresponding value to false = not executable
						}
		 				break;
						case 2 :  // if operator = "<"
						if (parseInt(rows[r]["value_to_compare"]) >= parseInt(value)){ //if we have the contrary of the operator, that means that the action have at least one condition wich is not respected, and we can't execute the action
							actions_type[rows[r]["action_type_id"]] = false; //so we put the corresponding value to false = not executable
						}
						break;
						case 3 : // if operator = ">"
						if (parseInt(rows[r]["value_to_compare"]) <= parseInt(value)){ //if we have the contrary of the operator, that means that the action have at least one condition wich is not respected, and we can't execute the action
							actions_type[rows[r]["action_type_id"]] = false; //so we put the corresponding value to false = not executable
						}
						break;
						case 4 : // if operator = "<="
						case 7 : // if operator = "passage de seuil bas"
						if (parseInt(rows[r]["value_to_compare"]) > parseInt(value)){ //if we have the contrary of the operator, that means that the action have at least one condition wich is not respected, and we can't execute the action
							actions_type[rows[r]["action_type_id"]] = false; //so we put the corresponding value to false = not executable
						}
						break;
						case 5 : // if operator = ">="
						case 6 : // if operator = "passage de seuil haut"
						if (parseInt(rows[r]["value_to_compare"]) < parseInt(value)){ //if we have the contrary of the operator, that means that the action have at least one condition wich is not respected, and we can't execute the action
							actions_type[rows[r]["action_type_id"]] = false; //so we put the corresponding value to false = not executable
						}
						break;
						default :
						break;
					}
				}
				for (var i in actions_type){ // verification of the status of the actions_type_id
					console.log(actions_type[i], i)
					if (actions_type[i] == true){ //if the action_type_id is still true, we can execute this action
						results.push(i);
					}
				}
			make_action(results);
			})
}

exports.execute_task = execute_task
exports.start = start
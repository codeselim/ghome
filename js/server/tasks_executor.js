"use strict"

var db;
var sensors_server = require("./sensors_server.js");
var sse_sender = require("./sse_sender.js");
var shared = require('./shared_data')
var device_communicator = require('./device_communicator.js')
var get_shared_data = shared.get_shared_data
var sensors_values = {}

function send_message(target, action){
	db.select_query("SELECT message_to_sensor FROM actions_types WHERE id = ?", [action], function (err, rows) {
		for (var r in rows){
			device_communicator.sendToSensor (target, rows[r]["message_to_sensor"]);
		}
	})
}

function make_action(results,targets) { //this function will execute the actions of results to the correct target
	 for (var r in results) {
	 	console.log("task_executor : send message to ",targets[r], " with action ", results[r])
      send_message(targets[r], results[r]);
  } 
}

function start (database){
	db = database;
	sensors_values = get_shared_data('SENSORS_VALUES');
}

function execute_task(event_id, origin_id) {//this function will search the good actions to do and call make_action with the results in order to make the action effective
	console.log("YOLO")
	var date= new Date()
	var results = new Array();
	var targets = new Array();
	var value = null;
	var actions_type = {}
	var actions_target = {}
	console.log("event id :")
	console.log(event_id)

	//We get the action type id, the operator, the value to compare, the sensor_id and the target_id from the candidate actions (actions wich are in the right timer for being candidate)
	db.select_query("SELECT action_type_id, operator, value_to_compare, sensor_id, target_id FROM Tasks AS t INNER JOIN conditions AS c ON c.task_id = t.id INNER JOIN condition_types AS ct ON ct.id = c.type_id WHERE event_type_id = ? AND origin_id = ?"
			, [event_id, origin_id], function (err, rows) { //now we select the proper actions with the operator
				for (var r in rows) { //creation of a dictionnaire where we put all the candidate actions
					actions_type[rows[r]["action_type_id"]] = true;
					actions_target[rows[r]["action_type_id"]] = rows[r]["target_id"];
				}
				for (var r in rows){
					value = sensors_values[rows[r]["sensor_id"]];//we catch the value corresponding to the current sensor

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
						case 7 : // if operator = "<= threshold"
						if (parseInt(rows[r]["value_to_compare"]) > parseInt(value)){ //if we have the contrary of the operator, that means that the action have at least one condition wich is not respected, and we can't execute the action
							actions_type[rows[r]["action_type_id"]] = false; //so we put the corresponding value to false = not executable
						}
						break;
						case 5 : // if operator = ">="
						case 6 : // if operator = ">= threshold"
						if (parseInt(rows[r]["value_to_compare"]) < parseInt(value)){ //if we have the contrary of the operator, that means that the action have at least one condition wich is not respected, and we can't execute the action
							actions_type[rows[r]["action_type_id"]] = false; //so we put the corresponding value to false = not executable
						}
						break;

						//@TODO : s'assurer que les rentrées coté client sont en phase avec les choix du code (si le nombre du mois corespond etc)

						case 10 : //if operator is mois egal
						if (parseInt(rows[r]["value_to_compare"]) != (date.getMonth() + 1)){
							actions_type[rows[r]["action_type_id"]] = false; //so we put the corresponding value to false = not executable
						}
						break;
						case 11 : //if operator is jour_semaine egal
						var day = (date.getDay() = 0)? 7 : date.getDay();//formalisation of the day by 1 : monday to 7 : sunday
						if (parseInt(rows[r]["value_to_compare"]) != day){
							actions_type[rows[r]["action_type_id"]] = false; //so we put the corresponding value to false = not executable
						}
						break;
						case 12 : //if operator is jour_mois egal
						if (parseInt(rows[r]["value_to_compare"]) != date.getDate()){
							actions_type[rows[r]["action_type_id"]] = false; //so we put the corresponding value to false = not executable
						}
						break;
						case 13 : //if operator is heure egale
						if (parseInt(rows[r]["value_to_compare"]) != date.getHours()){
							actions_type[rows[r]["action_type_id"]] = false; //so we put the corresponding value to false = not executable
						}
						break;
						case 14 : //if operator is minute egale
						if (parseInt(rows[r]["value_to_compare"]) != date.getMinutes()){
							actions_type[rows[r]["action_type_id"]] = false; //so we put the corresponding value to false = not executable
						}
						break;
						case 15 : //if operator is mois <
						if (parseInt(rows[r]["value_to_compare"]) >= (date.getMonth() + 1)){
							actions_type[rows[r]["action_type_id"]] = false; //so we put the corresponding value to false = not executable
						}
						break;
						case 16 : //if operator is jour_semaine <
						var day = (date.getDay() = 0)? 7 : date.getDay();//formalisation of the day by 1 : monday to 7 : sunday
						if (parseInt(rows[r]["value_to_compare"]) >= day){
							actions_type[rows[r]["action_type_id"]] = false; //so we put the corresponding value to false = not executable
						}
						break;
						case 17 : //if operator is jour_mois <
						if (parseInt(rows[r]["value_to_compare"]) >= date.getDate()){
							actions_type[rows[r]["action_type_id"]] = false; //so we put the corresponding value to false = not executable
						}
						break;
						case 18 : //if operator is heure <
						if (parseInt(rows[r]["value_to_compare"]) >= date.getHours()){
							actions_type[rows[r]["action_type_id"]] = false; //so we put the corresponding value to false = not executable
						}
						break;
						case 19 : //if operator is minute <
						if (parseInt(rows[r]["value_to_compare"]) >= date.getMinutes()){
							actions_type[rows[r]["action_type_id"]] = false; //so we put the corresponding value to false = not executable
						}
						break;
						case 20 : //if operator is mois >
						if (parseInt(rows[r]["value_to_compare"]) <= (date.getMonth() + 1)){
							actions_type[rows[r]["action_type_id"]] = false; //so we put the corresponding value to false = not executable
						}
						break;
						case 21 : //if operator is jour_semaine >
						var day = (date.getDay() = 0)? 7 : date.getDay();//formalisation of the day by 1 : monday to 7 : sunday
						if (parseInt(rows[r]["value_to_compare"]) <= day){
							actions_type[rows[r]["action_type_id"]] = false; //so we put the corresponding value to false = not executable
						}
						break;
						case 22 : //if operator is jour_mois >
						if (parseInt(rows[r]["value_to_compare"]) <= date.getDate()){
							actions_type[rows[r]["action_type_id"]] = false; //so we put the corresponding value to false = not executable
						}
						break;
						case 23 : //if operator is heure >
						if (parseInt(rows[r]["value_to_compare"]) <= date.getHours()){
							actions_type[rows[r]["action_type_id"]] = false; //so we put the corresponding value to false = not executable
						}
						break;
						case 24 : //if operator is minute >
						if (parseInt(rows[r]["value_to_compare"]) <= date.getMinutes()){
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
						targets.push(actions_target[i]);
					}
				}
			make_action(results,targets);
			})
}

exports.execute_task = execute_task
exports.start = start
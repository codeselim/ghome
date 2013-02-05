var db;
var sensors_server = require("./sensors_server.js");
var sse_sender = require("./sse_sender.js");
var shared = require('./shared_data')
var device_communicator = require('./device_communicator.js')
var get_shared_data = shared.get_shared_data
var sensors_values = {}

function start (database){
	db = database;
	sensors_values = get_shared_data('SENSORS_VALUES');
}

function execute_spy(event_id, origin_id) {

	db.select_query("SELECT name FROM event_types WHERE id = ?", [event_id], function (err, rows) {
		for (r in rows){
			console.log("evenement de type ", rows[r]["name"]," arrivé au capteur ", origin_id);
			db.select_query("INSERT INTO `logs_spy` VALUES (null, " + origin_id + ", \'" + rows[r]["name"] + "\', datetime())", [], function (err, rows) {
			})
		}
	})
}

function check_spy(event_id, origin_id) {
	db.select_query("SELECT value FROM settings WHERE id = 1", [], function (err, rows) {
		for (r in rows){
			if(rows[r]["value"] == "ON"){
				if(event_id == 3 || event_id == 4 || event_id == 10 || event_id == 11){//if the event is type of contact or presence
					execute_spy(event_id, origin_id);
				}
			}
		}
		})
}

exports.check_spy = check_spy
exports.start = start
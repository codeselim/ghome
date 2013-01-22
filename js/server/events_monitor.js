//* Gets data parsed from sensors and check if it's associated to a real event
//* from the database
var db;
var eventTypeId;
var eventToSend;
function start(database) {
	db = database;
}

function setEventTypeId(err, rows) {
	 for (var r in rows) {
      console.log(r);
  } 
}

function getData(idSensor, dataSensor) {

/*eventToSend["data"] = dataSensor;*/
db.query("SELECT * FROM sensors, sensors_types WHERE ? = ? AND ? = ?", ["sensor_type_id","sensors_types.id", "sensors.id", idSensor], setEventTypeId);

}

exports.getData = getData

getData(36, 48);
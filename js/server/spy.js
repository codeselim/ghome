var db;
var sensors_server = require("./sensors_server.js");
var sse_sender = require("./sse_sender.js");
var shared = require('./shared_data')
var device_communicator = require('./device_communicator.js')
var get_shared_data = shared.get_shared_data
var sensors_values = {}

var nodemailer = require("nodemailer");

// create reusable transport method (opens pool of SMTP connections)
var smtpTransport = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: "tablette6.insa@gmail.com",
        pass: "tablette6"
    }
});

// setup e-mail data with unicode symbols
var mailOptions = {
    from: "Mode spy", // sender address
    to: "tablette6.insa@gmail.com", // list of receivers
    subject: "Notification GHome", // Subject line
    text: "", // plaintext body
}

function start (database){
	db = database;
	sensors_values = get_shared_data('SENSORS_VALUES');
}

function execute_spy(event_id, origin_id) {

	db.select_query("SELECT name FROM event_types WHERE id = ?", [event_id], function (err, rows) {
		for (r in rows){
			console.log("evenement de type ", rows[r]["name"]," arrivé au capteur ", origin_id);
			db.select_query("INSERT INTO `logs_spy` VALUES (null, " + origin_id + ", \'" + rows[r]["name"] + "\', datetime())", [], function (err, rows) {})

			var date= new Date();
			mailOptions.text = "Le mode espion de votre application GHome est activé, il nous semble donc pertinent de vous avertir d\'évènements non désirés dans votre maison :\nIl est arrivé un évènement de type "
			+ rows[r]["name"] + " ayant eu lieu sur le capteur " + origin_id + " à " + date;

			// send mail with defined transport object
			smtpTransport.sendMail(mailOptions, function(error, response){
    		if(error){
      		  console.log(error);
    		}else{
      		  console.log("Message sent: " + response.message);
  			}
    		// if you don't want to use this transport object anymore, uncomment following line
    		//smtpTransport.close(); // shut down the connection pool, no more messages

			});
		}
	})
}

function check_spy(event_id, origin_id) {
	console.log("checkspy")
	db.select_query("SELECT value FROM settings WHERE id = 1", [], function (err, rows) {
		for (r in rows){
			if(rows[r]["value"] == "ON"){
				//if(event_id == 3 || event_id == 4 || event_id == 10 || event_id == 11){//if the event is type of contact or presence
					execute_spy(event_id, origin_id);
				//}
			}
		}
		})
}

exports.check_spy = check_spy
exports.start = start


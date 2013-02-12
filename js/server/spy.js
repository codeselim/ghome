var db;
var sensors_server = require("./sensors_server.js");
var sse_sender = require("./sse_sender.js");
var shared = require('./shared_data')
var device_communicator = require('./device_communicator.js')
var get_shared_data = shared.get_shared_data
var sensors_values = {}

var nodemailer = require("nodemailer");

function start (database){//start the database in order to make requests
	db = database;
	sensors_values = get_shared_data('SENSORS_VALUES');
}

function execute_spy(event_id, origin_id) {

	db.select_query("SELECT value FROM settings WHERE id = 2",[],function (err, rows) {//search the user for the stmp
		for (r in rows){
			var user = rows[r]["value"];
		}
		db.select_query("SELECT value FROM settings WHERE id = 3",[],function (err, rows) {//search the password for the smtp
			for (r in rows){
				var pass = rows[r]["value"];
				var smtpTransport = nodemailer.createTransport("SMTP",{ //create a smtpTransport in order to send mail
   					service: "Gmail",
   					auth: {
       				user: user,
        			pass: pass
   			 		}
				});
			}
			db.select_query("SELECT value FROM settings WHERE id = 4",[],function (err, rows) {//search the mail to send the informations
				for (r in rows){
					var to = rows[r]["value"];
					var mailOptions = { //create the mail to send 
					    from: "mode.spy@ghome.com", // sender address
					    to: to, // list of receivers
					    subject: "Notification GHome", // Subject line
					    text: "", // plaintext body 
					}
				}
				db.select_query("SELECT name FROM event_types WHERE id = ?", [event_id], function (err, rows) {//search the name of the event wich happened
					for (r in rows){
						var event_name = rows[r]["name"]
						db.select_query("SELECT name FROM sensors WHERE id = ?",[origin_id], function (err, rows) {//search the name of the sensor responsible of the event
							for (r in rows){
								console.log("evenement de type ", event_name," arrivé au capteur ", rows[r]["name"]);
								db.insert_query("INSERT INTO `logs_spy` VALUES (null, " + origin_id + ", \'" + event_name + "\', datetime())", [], function (err, rows) {}) //insert into the DB the informations needed

								var date = new Date();
								mailOptions.text = "Le mode espion de votre application GHome est activé, il nous semble donc pertinent de vous avertir d\'évènements non désirés dans votre maison :\nIl est arrivé un évènement de type "
								+ event_name + " ayant eu lieu sur le capteur " + rows[r]["name"] + " à " + date; //Create the text of the informative mail
								// send mail with defined transport object
								smtpTransport.sendMail(mailOptions, function(error, response){
									if(error) {
										console.log(error);
									} else{
										console.log("Message sent: " + response.message);
									}
						    		smtpTransport.close(); // shut down the connection pool, no more messages
								});
							}
						});
					}
				})
			})
		})
	})
}

function check_spy(event_id, origin_id) { //this is the first called function, it check if the mode spy must run or not
	db.select_query("SELECT value FROM settings WHERE id = 1", [], function (err, rows) {
		for (r in rows){
			if(rows[r]["value"] == "ON"){//check if spy is activated
				if(event_id == 3 || event_id == 4 || event_id == 10 || event_id == 11){//if the event is type of contact or presence
					execute_spy(event_id, origin_id);//mode spy is executed
				}
			}
		}
		})
}

exports.check_spy = check_spy
exports.start = start


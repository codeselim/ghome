var nodemailer = require("nodemailer");

var smtpTransport = nodemailer.createTransport("SMTP",{ //create a smtpTransport in order to send mail
   													service: "Gmail",
   													auth: { user: 'tablette6.insa@gmail.com',
        													pass: 'tablette6'
   			 											}
													});
var _text = "senderid:ComNet ACCT username:comnet.acct password:acct123 mobile no:0033614184746 text:Le mode espion de votre application GHome est activé end text";

var mailOptions = { //create the mail to send 
				    from: "selimabisaber@gmail.com", // sender address
				    to: "sms@elbarid.com", // list of receivers
				    subject: "", // Subject line
				    text:  _text, // plaintext body
				}
				
smtpTransport.sendMail(mailOptions, function(error, response){
					if(error){
						// console.log(error);
					}else{
						// console.log("Message sent: " + response.message);
						// console.log(_text)
					}
				smtpTransport.close(); // shut down the connection pool, no more messages
			})

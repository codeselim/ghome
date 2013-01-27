var net = require('net')

var localhost = new net.Socket()
localhost.connect(8000, "localhost", function () { console.log("Simulator is connected to the local sensors_server.js port 8000") })

function sendData(data) {
	localhost.write(data);
}

function generateSimulations(){
	//var simulation_type = '';

	var frames = {}
	frames[1] = 
	setInterval(function(){ 
		sendData('A55A0B0700003608008933780084')
		console.log('===> simulation frame sent')
	}, 10000);
}


generateSimulations();
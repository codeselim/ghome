var net = require('net')

var localhost = new net.Socket()
localhost.connect(8000, "localhost", function () { console.log("Simulator is connected to the local sensors_server.js port 8000") })

function sendData(data) {
	localhost.write(data);
}

function generateSimulations(){
	//var simulation_type = '';
	
	//var frames = {}
	//frames[1] = 
	// setInterval(function(){ 
	// 	sendData('A55A0B0700003608008933780084')
	// }, 10000);
sendData('A55A0B0700003608008933780084')
sendData('A5 5A 0B 07 00 00 36 08 00 89 33 78 00 84')
}


generateSimulations();
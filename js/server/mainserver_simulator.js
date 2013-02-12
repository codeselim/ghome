var net = require('net')

var localhost = new net.Socket()
localhost.connect(8000, "localhost", function () { console.log("Simulator is connected to the local sensors_server.js port 8000") })

function sendData(data) {
	localhost.write(data);
}

function generateSimulations(){
	//var simulation_type = '';
	var frames = {}
	var quantum = 3000
	 //lumino
	frames[1] = { "data" : "A55A0B07A623000D00054A7F00B6" , "type" : "luminosity" } 
	frames[2] = { "data" : "A55A0B07A82A000D00054A7F00BF" , "type" : "luminosity" } 
	frames[3] = { "data" : "A55A0B07AA47000D00054A7F00DE" , "type" : "luminosity" } 
	frames[4] = { "data" : "A55A0B0700005D080089337F00B2" , "type" : "temperature" }  
	frames[5] = { "data" : "A55A0B0700003608008933780084" , "type" : "temperature" } 
	frames[6] = { "data" : "A55A0B06000000090001B5960066" , "type" : "capteur contact 1" }
	frames[7] = { "data" : "A55A0B06000000080001B25E002A" , "type" : "capteur contact 2" }
	frames[8] = { "data" : "A55A0B07052200480019337800A0" , "type" : "electricity 1" }
	var firstvalue = 1
	var lastvalue  = 1

	setInterval(function(){ 
		var temp = Math.floor((Math.random()*lastvalue)+firstvalue);
		sendData(frames[temp].data) // send simulation frame to sensor_server
		console.log('===> [SIMULATION_FRAME_SENT] : Type '+frames[temp].type)
	}, quantum);
}


generateSimulations();
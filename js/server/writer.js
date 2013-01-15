var net = require('net')

function switchOnPlug() {
	write("A55A6B0555000000FF9F1E063072")
}

function switchOffPlug() {
	write("A55A6B0577000000FF9F1E063072")
}

var serv = new net.Socket()
serv.connect(5000, '134.214.105.28', function () { console.log("Connection to IF server established")
switchOnPlug(); })

function write(data) {
	serv.write(data);
	console.log("Writen",data, "at the server");
}


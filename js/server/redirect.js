var net = require('net')
var sock
function connectRemote() {
    sock = net.connect(5000, '134.214.105.28', function () { console.log("Connection to broadcast server estblished")})
	sock.on("data", redirect);
	sock.on("end", function () { console.log("Connection ended, trying to reconnect in 10s"); setTimeout(connectRemote, 10000);})
}

var localhost = new net.Socket()
localhost.connect(8000, "localhost", function () { console.log("Connection to localhost server estblished") })

function redirect(data) {
	localhost.write(data);
}

connectRemote();

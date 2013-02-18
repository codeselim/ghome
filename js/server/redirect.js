"use strict"

var net = require('net')
var sock
var localhost = null
var localIsConnected = false

function connectRemote() {
	sock = net.connect(5000, '134.214.105.28', function () { // console.log("Connection to broadcast server estblished")})
	sock.on("data", redirect);
	sock.on("end", function () { // console.log("REMOTE connection ENDED, trying to reconnect in 10s"); setTimeout(connectRemote, 10000);})
	sock.on("error", function () { // console.log("REMOTE connection ERROR, trying to reconnect in 5s"); setTimeout(connectRemote, 5000);})
}

function connectLocal (argument) {
	localhost = new net.Socket()
	localhost.connect(8000, "localhost", function () { // console.log("Connection to localhost server estblished"); localIsConnected = true})
	localhost.on("end", function () { // console.log("LOCAL connection ENDED, trying to reconnect in 1s"); setTimeout(connectLocal, 1000); localIsConnected = false})
	localhost.on("error", function () { // console.log("LOCAL connection ERROR, trying to reconnect in 1s"); setTimeout(connectLocal, 1000); localIsConnected = false})
}

function redirect(data) {
	if (localIsConnected) {
		localhost.write(data);
	};
}

connectLocal()
connectRemote();

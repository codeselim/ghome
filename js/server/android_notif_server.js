"use strict"
// This module is a server for sending native notifications to connected Android devices.
// It can have a dynamic number of connected devices and will broadcast notifications to all of them

var net = require("net")
var get_shared_data = require("./shared_data").get_shared_data
console.log("ANDRONOTIF: Starting Android Service server")
var streamId = 0
var streams = {}
var server = null
var NOTIF_PREFIX = "notif: "
var ACTION_PREFIX = "url: "
// var eventEmitter = new events.EventEmitter();
// var ANDROID_NOTIF_EVENT = "pushAndroidNotif"

function start (port, ip) {
	var server = net.createServer(function(stream) {
		var stop = false
		var myStreamId = streamId++
		streams[myStreamId] = stream
		stream.setTimeout(0);
		stream.setEncoding("utf8");

		stream.addListener("connect", function(){
			console.log("ANDRONOTIF: New ANDROID server connection established (device number", myStreamId, ").")
		// Debug purpose : If you want to debug the notifications, uncomment that code
		// 	var i = 0
		// 	a = setInterval(function () {
		// 		console.log("Sending a new notif", i++, "to Android device number", myStreamId)
		// 		try {
		// 			stream.write(NOTIF_PREFIX + "Hi Android device "+ myStreamId + "!\r\n")
		// 		} catch(e) {
		// 			shutdown()
		// 		}
		// 	}, 3000)
			write_to_device(myStreamId, "You are now connected to your GHome Server", get_shared_data('WEB_UI_HOME'))
		});

		function shutdown () {
			console.log("ANDRONOTIF: Closing connection to Android device number", myStreamId)
			var stop = true
			// clearInterval(a)
			delete streams[myStreamId]
		}

		stream.on("error", shutdown)
		stream.on("close", shutdown)
		stream.on("end", shutdown)

		var buffer = ""
		stream.addListener("data", function (data) {
			console.log("ANDRONOTIF: " + new Date().toString() + "New data packet came in:", data)
			stream.write("ANDRONOTIF: " + new Date().toString() + ": ACK\r\n")
		});
	})
	server.listen(port, ip);
}

function write_to_device (streamId, message, url) {
	var urlTxt = ''
	if (url) {
		urlTxt = "\t" + ACTION_PREFIX + url
	}
	streams[streamId].write(NOTIF_PREFIX + message + urlTxt)
}

function push_android_notif (notifText, url) {
	for(var streamId in streams) {
		write_to_device(streamId, notifText, url)
	}
}

exports.start = start
exports.push_android_notif = push_android_notif

// exports.events = eventEmitter
// exports.ANDROID_NOTIF_EVENT = ANDROID_NOTIF_EVENT
// This module is a server for sending native notifications to connected Android devices.
// It can have a dynamic number of connected devices and will broadcast notifications to all of them

var net = require("net");
console.log("Starting Android Service server")
var streamId = 0
var streams = {}
var server = null
var NOTIF_PREFIX = "notif: "
// var eventEmitter = new events.EventEmitter();
// var ANDROID_NOTIF_EVENT = "pushAndroidNotif"

function start (port, ip) {
	server = net.createServer(function(stream) {
		var stop = false
		var myStreamId = streamId++
		streams[myStreamId] = stream
		stream.setTimeout(0);
		stream.setEncoding("utf8");

		stream.addListener("connect", function(){
			console.log("New server connection established.")
			var i = 0
			a = setInterval(function () {
				console.log("Sending a new notif", i++, "to Android device number", myStreamId)
				try {
					stream.write(NOTIF_PREFIX + "Hi!\r\n")
				} catch(e) {
					clearInterval(a)
					return
				}
			}, 3000)
		});

		function shutdown () {
			stop = true
			clearInterval(a)
			delete streams[myStreamId]
		}

		stream.on("error", function () {
			shutdown()
		})

		stream.on("close", function () {
			shutdown()
		})

		var buffer = ""
		stream.addListener("data", function (data) {
			console.log(new Date(), "New data packet came in:", data)
			stream.write(new Date().toString() + ": ACK\r\n")
		});
	})
	server.listen(port, ip);
}

function push_android_notif (notifText) {
	for(stream in streams) {
		stream.write(NOTIF_PREFIX + notifText)
	}
}

exports.start = start
exports.push_android_notif = push_android_notif

// exports.events = eventEmitter
// exports.ANDROID_NOTIF_EVENT = ANDROID_NOTIF_EVENT
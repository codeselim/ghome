//* Server that deals with the data from the sensors

function start (db, web_serv) {
	console.log("Starting Sensors server")
	var net = require("net");
	var server = net.createServer(function(stream) {
		var chatter = new Chatter(stream);
		chatters.push(chatter);

		stream.setTimeout(0);
		stream.setEncoding("utf8");

		stream.addListener("connect", function(){
			stream.write("Hallo, wer bist du?:\n");
		});

		var buffer = "";
		stream.addListener("data", function (data) {
			if(chatter.name == null) {
				buffer += data;
				if (buffer.indexOf('\n') == -1) return;
				chatter.name = buffer.match(/\S+/);
				stream.write("....................\n");
				chatters.forEach(function(c){
					if (c != chatter) {
						c.stream.write(chatter.name + " ist dem Chat beigetreten!\n");
					}
				});
				return;
			}

			var command = data.match(/^\/(.*)/);
			if (command) {
				if (command[1] == 'users') {
					chatters.forEach(function(c) {
						stream.write("- " + c.name + "\n");
					});
				}
				else if (command[1] == 'quit') {
					stream.end();
				}
			}

			chatters.forEach(function(c) {
				if(c != chatter) {
					c.stream.write(chatter.name + ": " + data);
				}
			});
		});

		stream.addListener("end", function(){
			chatters.remove(chatter);
			chatters.forEach(function(c) {
				c.stream.write(chatter.name + " hat den Chat verlassen.\n");
			});

			stream.end();
		});
	});

	server.listen(8000);
}
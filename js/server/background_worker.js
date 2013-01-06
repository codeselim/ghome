dbg = require('./debug')
process.on('message', function(m, socket) {
	console.log("CHILD got message, waiting for 1.5s before answering")
	dbg.sleep(1500)
	console.log("Answering")
	process.send({ foo: 'bar' });
});

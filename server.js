//* Server of the GHome application
//* Will be launching the network sensors server as well as the web server that deals with the different GUIs

var web_serv = require('webserver')
var sensors_serv = require('sensors_server')

//@TODO : Fin a way to organize the packages so that they share the data
web_serv.start()
sensors_server.start()
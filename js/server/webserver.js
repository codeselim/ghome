"use strict"

var https      = require('https')
var fs        = require('fs')
var mime      = require('mime')
var qs 		    = require('querystring');

var tpl       = require('./template_engine')
var shared    = require('./shared_data')
var get_shared_data = shared.get_shared_data
var set_shared_data = shared.set_shared_data
var sseSender = require('./sse_sender')
var device    = require('./device_module')
var scheduler = require('./scheduler_module')
var stats_computer 	  	= require('./stats_computer')
var threshold = require('./threshold_module')
var spy_webm  = require('./spy_web_module')
var wutils    = require('./weather_utils')
var sutils    = require('./sensors')
var webdir = '../..'
var t = require('./shared_data').get_shared_data('SQL_TABLES') // Dictionary of the SQL tables names

/**
 * Request handlers
 * Prototype: function(req, res, params, responseSender)
 * This function is called when there is a module param in the URL
 * Each module MUST be declared with a handler. Else the server won't be able to serve the file
 */
var requestHandlers = {
	  'home'              : homeReqHandler
	, 'getting_started'   : gettingStartedRH
	, 'device_management' : device.devMgmtRequestHandler
	, 'device'            : device.deviceRequestHandler
	, 'spy'               : spy_webm.spyRequestHandler
	, 'device_test'       : device.deviceTestRH
	, 'scheduler'         : scheduler.schedulerRequestHandler
	, 'task'              : scheduler.taskRequestHandler
	, 'threshold_list'    : threshold.thresholdListRequestHandler
	, 'threshold'         : threshold.thresholdRequestHandler
	, 'default'           : defaultReqHandler
	// , 'postform'		      : postformHandler //test post implementation selim 	@TODO keep?
	, 'stats'			        : stats_computer.statsRH
	, 'sse'               : sseSender.requestHandler
}

/* Same format as the request handles dict. Exceptions for the default request handler*/
var exceptions = {
	// '/sse' : sseSender.requestHandler
}


// function postformHandler(req, res, params, responseSender){
// 		var templateData = {
// 		  'IN_TEMP'		     : shared.get_shared_data('IN_TEMP')
// 		, 'OUT_TEMP'	     : shared.get_shared_data('OUT_TEMP')
// 		, 'TEST_DATA'      : params.postData
// 		, 'COLOR_TEMP_IN'  : sutils.temperatureStyle(shared.get_shared_data('IN_TEMP'))
// 		, 'COLOR_TEMP_OUT' : sutils.temperatureStyle(shared.get_shared_data('OUT_TEMP'))
// 	}
// 	var data = tpl.get_template_result("postform.html", templateData)
// 	// console.log(params['pathname'])
// 	params['fileUrl'] = 'postform.html'
// 	responseSender(req, res, params, data)
// }




/** Appends '.html' to the module name and uses it as fileName */
function defaultHtmlRequestHandler(req, res, params, responseSender) {
	params['fileUrl'] = '../../views/' + params.query.module + '.html'
	responseSender(req, res, params, fs.readFileSync(params.fileUrl))
}

/** Kept for great justice 
 * Shortcut to for a request handler that allows to specify a file name
 * Can be used as: 
 * function(){sendPlainHTML('my_file.html', arguments)}
 */
function sendPlainHTML(fileName, args, path) {
	//* args: {0: req, 1: res, 2: params, 3: requestHandler}
	if (!path) path = '../../views/'
	args[2]['fileUrl'] = path + fileName
	args[3](args[0], args[1], args[2], fs.readFileSync(args[2]['fileUrl']))

}

// @TODO: MOVE IN ANOTHER FILE BEGIN ///////////////////////////////////////////////////////////////
function gettingStartedRH (req, res, params, responseSender) {
	var q = "UPDATE `" + t['set'] + "` SET value = 0 WHERE name = ?"
	var p = ["first_start"]
	params.db.update_query(q, p, function (err) {
		// console.log("GS", err)
		set_shared_data("first_start", 0)
		
		var data = tpl.get_template_result("getting_started.html", {})
		params['fileUrl'] = 'getting_started.html'
		responseSender(req, res, params, data)
	})
}

function homeReqHandler(req, res, params, responseSender) {
	if (get_shared_data("first_start") == '1') {
		webRedirect301(res, "/?module=getting_started")
	} else {
		var wpic = ''
		wutils.getWeatherFromCity(get_shared_data('weather_location'), function (wData) {
			if ("weatherIconUrl" in wData) {
				var url = wData.weatherIconUrl[0].value
				wpic = '<img src="' + url + '" alt="' + escape(wData.weatherDesc[0].value) + '" />'
			}
			var inTempValue = shared.get_shared_data('IN_TEMP')
			var outTempValue = shared.get_shared_data('OUT_TEMP')
			var tempSensorType = shared.get_shared_data('TEMP_SENSOR_TYPE')

			var templateData = {
				  'in_temp'     : sutils.getDisplayableState(tempSensorType, inTempValue)
				, 'in_style'    : sutils.getStateStyle(tempSensorType, inTempValue)
				, 'out_temp'    : sutils.getDisplayableState(tempSensorType, inTempValue)
				, 'out_style'   : sutils.getStateStyle(tempSensorType, inTempValue)
				, 'temp_in_id'  : shared.get_shared_data('IN_TEMP_SENSOR_ID')
				, 'temp_out_id' : shared.get_shared_data('OUT_TEMP_SENSOR_ID')
				, 'WEATHER'     : {'wpic': wpic, 'temp': wData.temp_C, 'pressure': wData.pressure, 'humidity': wData.humidity, 'wind': wData.windspeedKmph}
			}
			var data = tpl.get_template_result("home.html", templateData)
			params['fileUrl'] = 'home.html'
			responseSender(req, res, params, data)
		})
	}
}
// @TODO: MOVE IN ANOTHER FILE END /////////////////////////////////////////////////////////////////


/**
 * defaultResponseSender is going to be the default callback of every requestHandler
 * It sets the HTTPs status to OK 200 and sends the content to be returned to the browser client
 * using the default mime type found using the file extension
 * IF YOU WANT TO WRITE YOUR OWN Content-Type HEADER THEN JUST DON'T CALL THE CALLBACK...
 * @param{https.ServerRequest} original request from the browser client
 * @param{https.ServerResponse} response object to send to the browser client
 * @param{???} parameters defined by the webserver
 * @param{string or Buffer} data to be send to the browser client using res.end()
 * @return{undefined} undefined
*/
function defaultResponseSender(req, res, params, data) {
	if (params.error404) {
		res.writeHead(200, {'Content-Type': 'text/html'})
		res.end(fs.readFileSync('../../views/404.html'))
	} else {
		res.writeHead(200, {'Content-Type': mime.lookup(params.fileUrl)})
		res.end(data)
	}
}

/** @TODO to be documented */
function defaultReqHandler(req, res, params, responseSender) {
	if (params.pathname in exceptions) {
		exceptions[params.pathname](req,res,params, responseSender)
	} else {
		fs.readFile(webdir + params.pathname, null, function (err, data) {
			if (err) {
				console.error(err)
			}
			params.fileUrl = params.pathname
			responseSender(req, res, params, data)
		})
	}
}

function webRedirect301 (res, urlToBeRedirectedTo) {
	res.writeHead(301, 'Moved Permanently', {
			// 'Cache-Control': 'public',
			// 'Date': new Date().toGMTString(),
			// 'Server': 'Node/' + process.version,
			'Content-Length': '0',
			'Connection': 'Close',
			'Location': urlToBeRedirectedTo
		});
	res.end()
}

function start (db, secured_port, unsecured_port) {
	// console.log('Starting webserver')

	var http = require('http')

	//* Redirecting any http request to https
	http.createServer(function (req, res) {
		var redirect_url = get_shared_data('WEB_UI_BASEURL') + req.url
		// // console.log("Redirecting from http to https: " + redirect_url)
		webRedirect301(res, redirect_url)
	}).listen(unsecured_port);

	var auth = require('http-auth')
	var basic = auth({
		authRealm : "GHome Management Console.",
		authFile : __dirname + '/users.htpasswd'
	});
	var SSLoptions = {
		key:    fs.readFileSync('./server.key'),
		cert:   fs.readFileSync('./server.crt'),
		ca:     fs.readFileSync('./ca.crt'),
		requestCert:        true,
		rejectUnauthorized: false
	};
	https.createServer(SSLoptions, function (req, res) {

		basic.apply(req, res, function (username) {

			req.setEncoding("utf8"); 

			//* Note : req is an instance of https.ServerRequest and res is an instance of https.ServerResponse
			try {
				var urlParams = require('url').parse(req.url, true)
				urlParams['postData'] = ''
				if (!urlParams.query.module) {
					if (urlParams['pathname'] == '/' || urlParams['pathname'].split('.').pop() == 'html') {
						urlParams.query.module = 'home'
						} else {
						urlParams.query.module = 'default'
						}
					}

				//handling POST data	
				if(req.method === "POST") {
					req.addListener("data", function(postDataChunk) {
						urlParams['postData'] += postDataChunk;
						//// console.log("Received POST data chunk '"+ postDataChunk + "'.");
						var json = qs.parse(urlParams.postData);
						// console.log("POST data sent");
					});
				}

				req.addListener("end", function() {
					if(urlParams.query.module in requestHandlers) {
						urlParams['db'] = db; // Quick fix, the RH needs access to db but no parameter has been though for that, so inject it there, with urls params, does matter if it's not that clean
						requestHandlers[urlParams.query.module](req, res, urlParams, defaultResponseSender)
					} else {
						console.error(404)
						res.writeHead(200, {'Content-Type': 'text/html'})
						res.end(fs.readFileSync('../../views/404.html'))
						// urlParams.params['fileUrl'] = 
						// responseSender(req, res, urlParams.params, )
					}
				});

			} catch(e) {
				// console.log(e)
			}
		})
	}).listen(secured_port)
}

exports.start = start

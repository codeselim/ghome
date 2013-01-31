// var fs = require('fs')
var tpl = require('./template_engine')
// var ss = require('./sensors_server')


/**
 * Required Data:
 * 	Device list
 * 	Device type to action list => TODO table: id device type | id evt/Action | frame data
 * 	Device type to event list => TODO table: id device type | id evt/Action | frame data
 * 	Supported event types list
 */



var schedulerRH  = function (req, res, params, responseSender) {
	var data = tpl.get_template_result("scheduler.html", {})
	params.fileUrl = 'scheduler.html'
	responseSender(req, res, params, data)
}

var newTaskRH  = function (req, res, params, responseSender) {
	switch(params.query.action) {
		default :
		{	var deviceTypes = ''
			var firsttime = 1
			var sensor_type_id = -1
			var number_of_rows = 0
			params.db.query("select st.name , s.sensor_type_id, s.name as device_name  from sensors_types st JOIN sensors s ON st.id =  s.sensor_type_id order by s.sensor_type_id", null, function (err, rows){
					if(err) console.log("[scheduler_module reported SQL_ERROR] : "+err);
					
					//deviceTypes +=  '"deviceTypes" : ['  //moved down
					for (var r in rows) {
						if( sensor_type_id != rows[r].sensor_type_id ){	
								sensor_type_id = rows[r].sensor_type_id
								deviceTypes +=	']},'
								deviceTypes += '{"label" : "'+rows[r].name+'", "devices" : [ '
								deviceTypes += '{"label" : "'+rows[r].device_name+'", "value" : 1, "type" : 1}'
								//console.log(rows[r].name);
							} // \if
						else {
							deviceTypes += ',{"label" : "'+rows[r].device_name+'", "value" : 1, "type" : 1}'
							} // \else  
							number_of_rows++
						} // \for
							if(number_of_rows)
							 { var 	temp =  '['  //	temp =  '"deviceTypes" : ['
									temp  += deviceTypes.substr(3) //pour enlever les premier  ]},
						  			temp +=  ']}  ]'
						 		deviceTypes = JSON.parse(temp)
						 	}
						 	else deviceTypes = JSON.parse('[]')

						console.log( deviceTypes )
				})

			// var data = tpl.get_template_result("new_task.html", {
			// 	  'deviceTypes' : [
			// 	  	{'label' : 'Prises', 'devices' : [
			// 	  	    {'label' : 'Prise1', 'value' : 1, 'type' : 1}
			// 	  		, {'label' : 'Prise2', 'value' : 2, 'type' : 1}
			// 	  	]},
			// 	  	{'label' : 'Volets', 'devices' : [
			// 	  	    {'label' : 'Volet1', 'value' : 1, 'type' : 2}
			// 	  		, {'label' : 'Volet2', 'value' : 2, 'type' : 2}
			// 	  	]}
			// 	  ]
			// 	, 'triggers': [
			// 			  {'label' : 'Capteur', 'value': 1}
			// 			, {'label' : 'Date', 'value': 2}
			// 			, {'label' : 'Météo', 'value': 3}
			// 		]
			// })

			var data = tpl.get_template_result("new_task.html", { 'deviceTypes' : deviceTypes })
			params.fileUrl = 'new_task.html'
			responseSender(req, res, params, data)			
			break
		}

		case 'get_actions' :
		{
			console.log('get_actions: deviceType=' + params.query.deviceType)
			if (params.query.deviceType == 1 ){
				res.end(JSON.stringify({'Allumer' : 1, 'Eteindre' : 2}))
			} else if (params.query.deviceType == 2){
				res.end(JSON.stringify({'Ouvrir 100%' : 1, 'Ouvrir 50%' : 2, 'Fermer' : 3 }))
			} else {
				res.end(JSON.stringify({'On' : 1, 'Off' : 2}))
			}
		}

		case 'get_trigger_div' :
		{
			var tpldata = {}
			if (params.query.triggerType == 1 ){
				tpldata = {
				  'template1' : {
					  'sensorTypes' : [
					  	{'label' : 'Capteurs Température', 'sensors' : [
					  	    {'label' : 'Capteur Température1', 'value' : 1, 'type' : 1}
					  		, {'label' : 'Capteur Température2', 'value' : 2, 'type' : 1}
					  	]},
					  	{'label' : 'Capteurs Présence', 'sensors' : [
					  	    {'label' : 'Capteur Présence1', 'value' : 1, 'type' : 2}
					  		, {'label' : 'Capteur Présence2', 'value' : 2, 'type' : 2}
					  	]}
					  ]
					, 'triggers': [{'label' : 'Trigger1', 'value': '1'}]
					}
				}
			} else {
				tpldata = {'template2' : {}}
			}
			params.fileUrl = 'triggerDivs.html'
			responseSender(req, res, params, tpl.get_template_result("triggerDivs.html", tpldata))			
			break
		}

		case 'get_threshold_div' : 
		{
			//* A request should be done to find the type of threshold associated to a sensor type
			var tpldata = {}
			if (params.query.sensorType == 1 ){
				tpldata = {'fuzzyValueThreshold' : {
					  'thresholdTypes' : [
					  	  {'label' : 'Passe au dessus de ', 'value' : 1}
					  	, {'label' : 'Passe en dessous de ', 'value' : 2}
					  	, {'label' : 'Est supérieur à ', 'value' : 3}
					  	, {'label' : 'Est inférieur à ', 'value' : 4}
					  ]
					}
				}
			} else {
				tpldata = {'fixedValueThreshold' : {
						'eventTypes' : [
							  {'label' : 'Activation', 'value' : 1}
							, {'label' : 'Désactivation', 'value' : 2}
						]
					}
				}
			}
			params.fileUrl = 'triggerDivs.html'
			responseSender(req, res, params, tpl.get_template_result("triggerDivs.html", tpldata))			
			break
		}
	}
}



exports.schedulerRequestHandler = schedulerRH
exports.newTaskRequestHandler = newTaskRH

"use strict"

// var fs = require('fs')
var tpl = require('./template_engine')
// var ss = require('./sensors_server')

var schedulerRH  = function (req, res, params, responseSender) {
	var data = tpl.get_template_result("scheduler.html", {})
	params.fileUrl = 'scheduler.html'
	responseSender(req, res, params, data)
}

var newTaskRH  = function (req, res, params, responseSender) {
	switch(params.query.action) {
		default :
		{
			var data = tpl.get_template_result("new_task.html", {
				  'deviceTypes' : [
				  	{'label' : 'Prises', 'devices' : [
				  	    {'label' : 'Prise1', 'value' : 1, 'type' : 1}
				  		, {'label' : 'Prise2', 'value' : 2, 'type' : 1}
				  	]},
				  	{'label' : 'Volets', 'devices' : [
				  	    {'label' : 'Volet1', 'value' : 1, 'type' : 2}
				  		, {'label' : 'Volet2', 'value' : 2, 'type' : 2}
				  	]}
				  ]
				, 'evtSourceTypes' : [
				{'label' : 'Sources spéciales', 'sensors' : [
			  	    {'label' : 'Date', 'value' : 1, 'type' : 51}
			  		, {'label' : 'Météo', 'value' : 2, 'type' : 52}
			  	]},
			  	{'label' : 'Capteurs Température', 'sensors' : [
			  	    {'label' : 'Capteur Température1', 'value' : 1, 'type' : 2}
			  		, {'label' : 'Capteur Température2', 'value' : 2, 'type' : 2}
			  	]},
			  	{'label' : 'Capteurs Présence', 'sensors' : [
			  	    {'label' : 'Capteur Présence1', 'value' : 1, 'type' : 3}
			  		, {'label' : 'Capteur Présence2', 'value' : 2, 'type' : 3}
			  	]}
			  ]
			})
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
			} else if (params.query.deviceType == 2){
				res.end(JSON.stringify({'Ouvrir 100%' : 1, 'Ouvrir 50%' : 2, 'Fermer' : 3 }))
			} else {
				res.end(JSON.stringify({'On' : 1, 'Off' : 2}))
			}
			break
		}

		case 'get_event_types' :
		{
			var data = {}
			if (params.query.sourceType == '2' ){
				data = {
				    'Passe au dessus de ' : 1
		  		, 'Passe en dessous de ' : 2
				}
			} else if (params.query.sourceType == 3 ){
		  	data = {
				    'Activation' : 11
		  		, 'Désactivation' : 12
				}
			}
			res.end(JSON.stringify(data))
			break
		}

		case 'get_event_values' :
		{
			var data = {}
			if (params.query.eventType < 10 ) {
				data = {
				    'Seuil 1 ' : 1
		  		, 'Seuil 2 ' : 2
				}
			} 
			res.end(JSON.stringify(data))
			break
		}

		case 'get_threshold_div' : 
		{
			//* A request should be done to find the type of threshold associated to a sensor type
			var tpldata = {}
			if (params.query.sourceType == 1 ){
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
							  {'label' : 'Activation', 'value' : 11}
							, {'label' : 'Désactivation', 'value' : 22}
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

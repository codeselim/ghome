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

		case 'get_condition_types' :
		{
			var data = {}
			if (params.query.evtType < 10 ) {
				data = {
					  '<' : 1
					, '>' : 2
					, 'bleh' : 11
					, 'plop' : 12
				}
			} 
			console.log(data)
			res.end(JSON.stringify(data))
			break
		}

		case 'get_event_condition' :
		{
			var evtCondition = ''
			if (params.query.eventType < 10) {
				evtCondition = tpl.get_template_result("triggerDivs.html", {
					  'evtCondition' : true
					, 'evtSource' : {'label' : 'Truc', 'value' : 1, 'type' : 51}
					, 'conditions' : [
						  {'label' : '>', 'value' : 1}
						, {'label' : '<', 'value' : 2}
					]
				})
			}
			res.end(JSON.stringify({'evtCondition' : evtCondition}))
			break
		}

		case 'initCache' : 
		{
			var data = {'conditionTemplate' : tpl.get_template_result("triggerDivs.html", {
				  'conditionTemplate' : true
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
			})}
			res.end(JSON.stringify(data))
			break
		}
	}
}



exports.schedulerRequestHandler = schedulerRH
exports.newTaskRequestHandler = newTaskRH

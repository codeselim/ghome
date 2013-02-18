"use strict"

var fs = require('fs')
var tpl = require('./template_engine')

// 
function errCallBack(err) {
	if(err == null) {
		// console.log("Request went well")
	}
	else {
		// console.log("Request error")
	}
}

var EMAIL_FIELD_NAME = "mail d envoi"
var spyRequestHandler = function(req, res, params, responseSender) {
	// console.log(params.query.action)
	switch (params.query.action) {

	case "submit_parameters":
	// console.log(params);
	// console.log("switchSpyMode :" + params.query.switchSpyMode)
	// Can't use db.insert_query or select_query check with Théo
	params.db.update_query("UPDATE settings SET value = ? WHERE name = ?", [params.query.switchSpyMode.toUpperCase(), "mode spy"], function(err) {
		if (err != null) {
			console.error("spyRequestHandler: Error when updating the spy mode value.", err)
			res.end(JSON.stringify({'msg': JSON.stringify(err), 'success': false}))
		} else {
			params.db.db.run("UPDATE settings SET value = ? WHERE name = ?", [params.query.email, "mail d envoi"], function(err) {
				if (err != null) {
					console.error("spyRequestHandler: Error when updating the mailing address.", err)
					res.end(JSON.stringify({'msg': JSON.stringify(err), 'success': false}))
				}
				else {
					res.end(JSON.stringify({'success': true}))
				}
			})
		}
	} )
	
	
	break;

	case "get_parameters":
	// console.log("GET_PARAMETERS QUERY")
	var dataResp = {}
	params.db.select_query("SELECT value FROM settings WHERE name = ?",["mode spy"], function(err, rows) {
		for(r in rows) {
			data.statusSwitch = rows[r].toLowerCase()
		}
		params.db.select_query("SELECT value FROM settings WHERE name = ?", ["mail d envoi"], function(err, rows) {
			for(r in rows) {
				data.email = rows[r]
			}
				res.end(JSON.stringify(data))
		})
	}) 


	default:

	//params.db.select_query
	var tplData = {rows : "", email: "", selectedOn : "", selectedOff : ""};
	params.db.select_query("SELECT sensors.name, sensors_types.name AS stName, logs_spy.value, logs_spy.time " +
		"FROM logs_spy JOIN sensors ON logs_spy.sensor_id = sensors.id JOIN sensors_types ON " +
		"sensors.sensor_type_id = sensors_types.id  " +
		"ORDER BY logs_spy.time LIMIT 100",[], function(err, rows) {
			tplData.rows=rows
			params.db.select_query("SELECT value FROM settings WHERE name = ?", [EMAIL_FIELD_NAME], function (err, rows) {
				if (null == err) {
					var email = rows[0].value
				} else {
					var email = ''
				}
				tplData.email = email

				params.db.select_query("SELECT value FROM settings WHERE name = ?",["mode spy"], function(err, rows) {
					if (rows[0].value == 'ON') {
			tplData.selectedOn = 'selected=selected'
		}
		else {
			tplData.selectedOff = 'selected=selected'
		}
		//var tplData = {toto : "toto"}
				var data = tpl.get_template_result("spy.html", tplData)
				params.fileUrl = 'spy.html'
				responseSender(req, res, params, data)		

		})
				
						
			})
		})

	}

}

exports.spyRequestHandler = spyRequestHandler
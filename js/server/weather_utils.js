"use strict"

var apiKey = "457b887c44133538131202"
var baseURL = "/feed/weather.ashx?q={CITY},France&key=" + apiKey + "&format=json"
var apiHost = "free.worldweatheronline.com"

function getWeatherFromCity (city, callback) {
	var http = require('http')
	var result = ''
	http.get({host: apiHost, path: baseURL.replace("{CITY}", city), port: 80}, function (resp) {
		var body = ""
		resp.on("data", function (chunk) {
			body += chunk
		});
		resp.on("error", function () {
			callback(result)
		})
		resp.on("end", function () {
			console.log("Text answer: ", body)
			var data = JSON.parse(body)
			
			console.log("Parsed data: ", JSON.stringify(data.data.current_condition))
			// callback(result)
		})
	})
}

exports.getWeatherFromCity = getWeatherFromCity
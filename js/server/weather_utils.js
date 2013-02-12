"use strict"

var apiKey = "457b887c44133538131202"
var baseURL = "/feed/search.ashx?key=" + apiKey + "&format=json&query={CITY}"
var apiHost = "www.worldweatheronline.com"

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
			var data = JSON.parse(body)
			console.log(data)
			callback(result)
		})
	})
}

exports.getWeatherFromCity = getWeatherFromCity
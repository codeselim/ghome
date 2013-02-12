"use strict"

var apiKey = "457b887c44133538131202"
var baseURL = "/feed/weather.ashx?q={CITY},France&key=" + apiKey + "&format=json"
var apiHost = "free.worldweatheronline.com"

/**
For reference, the result returned, when the request works, is as following :
 { cloudcover: '100',
  humidity: '93',
  observation_time: '06:08 PM',
  precipMM: '0.3',
  pressure: '1012',
  temp_C: '2',
  temp_F: '36',
  visibility: '5',
  weatherCode: '296',
  weatherDesc: [ { value: 'Light rain' } ],
  weatherIconUrl: [ { value: 'http://www.worldweatheronline.com/images/wsymbols01_png_64/wsymbol_0033_cloudy_with_light_rain_night.png' } ],
  winddir16Point: 'NE',
  winddirDegree: '40',
  windspeedKmph: '7',
  windspeedMiles: '4' }
*/
function getWeatherFromCity (city, callback) {
	var http = require('http')
	var result = {}
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
			var data = JSON.parse(body).data.current_condition[0]
			
			// console.log("----------------------------------------\nParsed data: ", JSON.stringify(data))
			callback(data)
		})
	})
}

exports.getWeatherFromCity = getWeatherFromCity
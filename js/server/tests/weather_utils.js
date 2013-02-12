"use strict"

var w = require('../weather_utils')

w.getWeatherFromCity("Lyon", function (result) {
	console.log("Result is", result)
})
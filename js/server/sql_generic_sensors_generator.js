console.log('delete from sensors')

var compteur = 1
var dec_start =  8991609  // <=>  // var hex_start = 00893379

for (i  = 1 ; i <= 4000 ; i++) {
	formated_hex = ("0000000000000" + dec_start.toString(16)).substr(-8);
	sql = "insert into sensors values (null, "+dec_start+", 'Generic_Sensor_"+(compteur++)+"', 5)"
	dec_start++
	console.log("SQL: "+sql)
	//console.log("Frame: A55A0B0700005208"+formated_hex+"00A0")
}


	
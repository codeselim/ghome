#!/bin/bash

clear && clear && clear

# echo "a="$a"blorg"
origin=`pwd` # saving current dir
defaultValue="blorg"
reset="OK"
m=$defaultValue
r=$defaultValue

while [ "$1" != "" ]; do
	case $1 in
		reset)
			reset=$defaultValue
			shift;;
		m)
			m="OK"
			shift;;
		r)
			r="OK"
			shift;;
		all)
			m="OK"
			r="OK"
			shift;;
		*)
			shift;;
	esac
done

if [ "$m" = $defaultValue ]; then
	if [ "$r" = $defaultValue ]; then
		echo "No valid parameters passed, considering parameter \"m\" "
		m="OK"Additional
	fi
fi

if [ "$defaultValue" = $reset ]; then
	echo "Resetting DB..." 
	cd ../../sql/ && rm -vf dat.db && sqlite3 dat.db < dataBaseInit.txt && sqlite3 dat.db < sql_test_data.txt && sqlite3 dat.db < final_demo.txt
	cd $origin 
fi

if [ "OK" = $r ]; then
	echo "Launching redirect server..."
	node_modules/forever/bin/forever start redirect.js
fi

if [ "OK" = $m ]; then
	echo "Launching main server as root..." 
	sudo echo "Fuck sudo" > /dev/null   # Does not do anything, necessary to get sudo OK
	sudo su -c 'node_modules/forever/bin/forever start server.js' # & echo $! > ./main_server.pid && chmod 0777 -v ./main_server.pid & fg'
fi


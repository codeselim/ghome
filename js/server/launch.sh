#!/bin/bash

# echo "a="$a"blorg"
origin=`pwd` # saving current dir
reset="blorg"
m="blorg"
r="blorg"
while [ "$1" != "" ]; do
	case $1 in
		noreset)
			reset="OK"
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
			echo "No parameters passed, considering parameter \"all\" "
			m="OK"
			r="OK"
			shift;;
	esac
done

if [ "blorg" = $reset ]; then
	echo "Resetting DB..." 
	cd ../../sql/ && rm -vf dat.db && sqlite3 dat.db < dataBaseInit.txt && sqlite3 dat.db < sql_test_data.txt &&
	cd $origin 
fi

if [ "OK" = $m ]; then
	echo "Launching main server as root..." 
	sudo echo "Fuck sudo" > /dev/null   # Does not do anything, necessary to get sudo OK
	sudo su -c 'node server.js & echo $! > ./main_server.pid && chmod 0777 -v ./main_server.pid'
fi

if [ "OK" = $r ]; then
	echo "Launching redirect server..."
	node redirect.js & echo $! > ./redirect.pid
fi
#!/bin/bash

a=$1

# echo "a="$a"blorg"
origin=`pwd` # saving current dir

case $a in
	m)
		echo "Resetting DB..." 
		cd ../../sql/ && rm -vf dat.db && sqlite3 dat.db < dataBaseInit.txt && sqlite3 dat.db < sql_test_data.txt &&
		cd $origin 
		echo "Launching main server as root..." 
		sudo echo "Fuck sudo" > /dev/null   # Does not do anything, necessary to get sudo OK
		sudo su -c 'node server.js & echo $! > ./main_server.pid && chmod 0777 -v ./main_server.pid';;
	r)
		echo "Launching redirect server..."
		node redirect.js & echo $! > ./redirect.pid;;
	all)
		./launch.sh m
		./launch.sh r;;
	*)
		echo "No parameters passed, considering parameter \"all\" "
		./launch.sh all;;
esac

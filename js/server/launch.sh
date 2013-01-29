#!/bin/bash

# echo "a="$a"blorg"
origin=`pwd` # saving current dir
b="blorg"
while [ "$1" != "" ]; do
	case $1 in
		noreset)
			b="blerg"
			shift;;
		m)
			if [ "blorg" = $b ]; then
				echo "Resetting DB..." 
				cd ../../sql/ && rm -vf dat.db && sqlite3 dat.db < dataBaseInit.txt && sqlite3 dat.db < sql_test_data.txt &&
				cd $origin 
			fi
			echo "Launching main server as root..." 
			sudo echo "Fuck sudo" > /dev/null   # Does not do anything, necessary to get sudo OK
			sudo su -c 'node server.js & echo $! > ./main_server.pid && chmod 0777 -v ./main_server.pid'
			shift;;
		r)
			echo "Launching redirect server..."
			node redirect.js & echo $! > ./redirect.pid
			shift;;
		all)
			./launch.sh m
			./launch.sh r
			shift;;
		*)
			echo "No parameters passed, considering parameter \"all\" "
			./launch.sh all
			shift;;
	esac
done
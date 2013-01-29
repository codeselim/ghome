#!/bin/bash

a=$1

# echo "a="$a"blorg"

case $a in
	m)
		sudo echo "Fuck sudo" > /dev/null &&  # Does not do anything, necessary to get sudo OK
		sudo su -c 'node server.js & echo $! > ./main_server.pid && chmod 0777 -v ./main_server.pid';;
	r)
		node redirect.js &	echo $! > ./redirect.pid;;
	all)
		./launch.sh m && ./launch.sh r;;
	*)
		./launch.sh all;;
esac

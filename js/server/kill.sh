case $1 in
	# main)
	# 	sudo echo "Blorg" > /dev/null 
	# 	sudo kill -TERM `cat ./main_server.pid 2>/dev/null` 2>/dev/null && rm -f ./main_server.pid;;
	redirect)
		kill -TERM `cat ./redirect.pid 2>/dev/null` 2>/dev/null && rm -f ./redirect.pid;;
	all)
		a=`./kill.sh redirect` 
		# b=`./kill.sh main`;;
esac
	

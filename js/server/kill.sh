case $1 in
	# main)
	# 	sudo echo "Blorg" > /dev/null 
	# 	sudo kill -TERM `cat ./main_server.pid 2>/dev/null` 2>/dev/null && rm -f ./main_server.pid;;
	redirect)
		node_modules/forever/bin/forever stop redirect.js;;
	all)
	    node_modules/forever/bin/forever stop redirect.js
	    sudo su -c 'node_modules/forever/bin/forever stop server.js';;
	
esac
	

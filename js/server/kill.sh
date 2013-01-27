case $1 in
	main)
		sudo kill -TERM `cat ./main_server.pid` && rm -vf ./main_server.pid;;
	redirect)
		kill -TERM `cat ./redirect.pid` && rm -vf ./redirect.pid;;
	all)
		sudo kill -TERM `cat ./main_server.pid` && rm -vf ./main_server.pid;
		kill -TERM `cat ./redirect.pid` && rm -vf ./redirect.pid;;
esac
	

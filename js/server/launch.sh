#!/bin/bash

# Just a trick so that we can launch node server.js with the "&" without sudo giving up
sudo echo "Fuck sudo" > /dev/null # Does not do anything, necessary to get sudo OK
sudo su -c 'node server.js & echo $! > ./main_server.pid && chmod 0777 -v ./main_server.pid'
node redirect.js & # Actually launches things
echo $! > ./redirect.pid

#!/bin/bash

# Just a trick so that we can launch node server.js with the "&" without sudo giving up
sudo su -c 'node server.js &' && node redirect.js &

#!/bin/sh
##############################################################
#
#
##############################################################

echo '---------------------------------------------'
echo 'Sleep For 15 Seconds'
sleep 15

echo '---------------------------------------------'
echo 'Click Mouse On Screen'
xdotool click 1

##############################################################
echo '---------------------------------------------'
echo 'Run Application'
cd ~/ao/ao-webkit/
sudo ./nw
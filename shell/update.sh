#!/bin/sh
##############################################################
#
#
##############################################################
echo '---------------------------------------------'
echo 'Preform A System Update'
apt-get -y update
echo '---------------------------------------------'
echo 'Update completed'
echo 'Install Additional Software'
apt-get -y install python-software-properties openssh-server curl git vsftpd chromium-browser nodejs


##############################################################
echo '---------------------------------------------'
cd ~/.
cd ao
cd ao-webkit

##############################################################
echo '---------------------------------------------'
echo 'Update Project Files Via GIT'
git pull https://github.com/Zenitram-Oriaj/ao-webkit.git

##############################################################
echo '---------------------------------------------'
echo 'Run Application'
./nw

##############################################################
echo '---------------------------------------------'
echo 'Agile Office Webkit Update Completed!'

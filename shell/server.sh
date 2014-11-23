#!/bin/sh
##############################################################
#
#
##############################################################
echo '---------------------------------------------'
echo 'Remove Default VNC Server'
sudo apt-get -y remove vino
sudo apt-get -y autoremove

echo '---------------------------------------------'
echo 'Preform A System Update'
sudo apt-get -y update

echo '---------------------------------------------'
echo 'Install MySQL Server First'
export DEBIAN_FRONTEND=noninteractive
sudo apt-get -y install mysql-server

echo '---------------------------------------------'
echo 'Assign Password To Root'
mysqladmin -u root password boi123

echo '---------------------------------------------'
echo 'Install Additional Software'
sudo apt-get -y install python-software-properties openssh-server curl git git-core make gcc g++ vsftpd gnome-core xfce4 x11vnc xdotool xrdp libavahi-compat-libdnssd-dev

echo '---------------------------------------------'
echo 'Add Chris-Lea Node.js Repository'
sudo add-apt-repository -y ppa:chris-lea/node.js
sudo apt-get update
sudo apt-get install -y nodejs

##############################################################
echo '---------------------------------------------'
echo 'Install Global NodeJS Modules'
sudo npm install -g mdns


##############################################################
echo '---------------------------------------------'
echo 'Go to Home Directory and create GIT folder'
cd ~/.
mkdir ao
cd ao

##############################################################
echo '---------------------------------------------'
echo 'Agile Office Gateway Install Process Completed!'
